open Utils
open FirestoreUtils

(** These are the primitive operations that we need to perform on firestore.
    It is a low-level API. *)
module type FIRESTORE_PRIMITIVES = sig

  (** Get a document from its path and return it as a JSON *)
  val get_doc : Dream.request -> string -> JSON.t Lwt.t

  (** Create a document from its path and return its id. *)
  val create_doc : Dream.request -> string -> JSON.t -> string Lwt.t

  (** Set a document. Like create, but with an id *)
  val set_doc : Dream.request -> string -> string -> JSON.t -> unit Lwt.t

  (** Update a document from its path and a partial update in JSON *)
  val update_doc : Dream.request -> string -> JSON.t -> unit Lwt.t

  (** Delete a document from its path *)
  val delete_doc : Dream.request -> string -> unit Lwt.t

end

module Make
    (External : External.EXTERNAL)
    (TokenRefresher : TokenRefresher.TOKEN_REFRESHER)
    (Stats : Stats.STATS)
  : FIRESTORE_PRIMITIVES = struct

  let logger = Dream.sub_log "firestore"

  let is_error (response : Cohttp.Response.t) =
    Cohttp.Code.is_error (Cohttp.Code.code_of_status response.status)

  let get_doc (request : Dream.request) (path : string) : JSON.t Lwt.t =
    Stats.read request;
    let* headers = TokenRefresher.header request in
    let* (response, body) = External.Http.get (endpoint path) headers in
    logger.info (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (DocumentNotFound path)
    else Lwt.return (of_firestore (JSON.from_string body))

  let create_doc (request : Dream.request) (collection : string) (doc : JSON.t) : string Lwt.t =
    let get_id_from_firestore_document_name (doc : JSON.t) : string =
      let name = JSON.Util.(doc |> member "name" |> to_string) in
      let elements = String.split_on_char '/' name in
      let id = List.nth elements (List.length elements - 1) in
      id in
    Stats.write request;
    logger.info (fun log -> log ~request "Creating %s: %s" collection (JSON.to_string doc));
    let* headers = TokenRefresher.header request in
    let firestore_doc = to_firestore doc in
    (* By asking only for _, firestore will not give us the document back, which is what we want *)
    let params = [("mask.fieldPaths", "_")] in
    let endpoint = endpoint ~params collection in
    (* Note: We *can't* create a doc and retrieve its id in a transaction, so we just ignore whether we are in a transaction *)
    let* (response, body) = External.Http.post_json endpoint headers firestore_doc in
    logger.info (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (UnexpectedError (Printf.sprintf "error on document creation for %s: %s" collection body))
    else Lwt.return (get_id_from_firestore_document_name (JSON.from_string body))

  let update_doc (request : Dream.request) (path : string) (update : JSON.t) : unit Lwt.t =
    let update_to_fields_and_firestore (update : JSON.t) : string list * JSON.t =
      let fields = match update with
        | `Assoc key_values -> List.map fst key_values
        | _ -> raise (UnexpectedError "invalid update: should be a Assoc") in
     (fields, to_firestore update) in
    Stats.write request;
    logger.info (fun log -> log ~request "Updating %s with %s" path (JSON.to_string update));
    (* We want only to update what we provide, and we don't care about the response so we provide an empty mask *)
    let (fields, firestore_update) = update_to_fields_and_firestore update in
    let update_params = List.map (fun field -> ("updateMask.fieldPaths", field)) fields in
    let params = ("mask.fieldPaths", "_") :: update_params in
    let endpoint = endpoint ~params path in
    let* headers = TokenRefresher.header request in
    let* (response, body) = External.Http.patch_json endpoint headers firestore_update in
    logger.info (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (UnexpectedError (Printf.sprintf "error on document update for %s: %s" path body))
    else Lwt.return ()

  let set_doc (request : Dream.request) (path : string) (id : string) (doc : JSON.t) : unit Lwt.t =
    update_doc request (Printf.sprintf "%s/%s" path id) doc

  let delete_doc (request : Dream.request) (path : string) : unit Lwt.t =
    Stats.write request;
    logger.info (fun log -> log ~request "Deleting %s" path);
    let* headers = TokenRefresher.header request in
    let* (response, body) = External.Http.delete (endpoint path) headers in
    if is_error response
    then raise (UnexpectedError (Printf.sprintf "error on document deletion for %s: %s" path body))
    else Lwt.return ()

end

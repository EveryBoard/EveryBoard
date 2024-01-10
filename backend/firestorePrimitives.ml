open Utils

(** These are the primitive operations that we need to perform on firestore.
    It is a low-level API. *)
module type FIRESTORE_PRIMITIVES = sig

  (** Get a document from its path and return it as a JSON *)
  val get_doc : Dream.request -> string -> JSON.t Lwt.t

  (** Create a document, potentially with a specific id (otherwise an id will be assigned by firestore).
      In either case, the document id is returned *)
  val create_doc : Dream.request -> string -> ?id:string -> JSON.t -> string Lwt.t

  (** Update a document from its path and a partial update in JSON *)
  val update_doc : Dream.request -> string -> JSON.t -> unit Lwt.t

  (** Delete a document from its path *)
  val delete_doc : Dream.request -> string -> unit Lwt.t

  (** Begin a transaction and return the transaction id *)
  val begin_transaction : Dream.request -> string Lwt.t

  (** Commit the transaction with the given id *)
  val commit : Dream.request -> string -> unit Lwt.t

  (** Roll back a transaction to cancel everything in it *)
  val rollback : Dream.request -> string -> unit Lwt.t
end

module Make
    (External : External.EXTERNAL)
    (TokenRefresher : TokenRefresher.TOKEN_REFRESHER)
    (Stats : Stats.STATS)
  : FIRESTORE_PRIMITIVES = struct
  let is_error (response : Cohttp.Response.t) =
    Cohttp.Code.is_error (Cohttp.Code.code_of_status response.status)

  let get_doc (request : Dream.request) (path : string) : JSON.t Lwt.t =
    Stats.read request;
    let* headers = TokenRefresher.header request in
    let* (response, body) = External.Http.get (endpoint path) headers in
    Printf.printf "%d\n" (Cohttp.Code.code_of_status (Cohttp.Response.status response));
    if is_error response
    then raise (Error ("can't retrieve doc with path " ^ path))
    else Lwt.return (of_firestore (JSON.from_string body))

  let get_id_from_firestore_document_name (doc : JSON.t) : string =
    let name = JSON.Util.(doc |> member "name" |> to_string) in
    let elements = String.split_on_char '/' name in
    let id = List.nth elements (List.length elements - 1) in
    id

  let create_doc (request : Dream.request) (collection : string) ?(id : string option) (doc : JSON.t) : string Lwt.t =
    Stats.write request;
    let* headers = TokenRefresher.header request in
    let path = match id with
      | Some id -> collection ^ "/" ^ id
      | None -> collection in
    let firestore_doc = to_firestore doc in
    let params = [("mask", "_")] in (* By asking only for _, firestore will not give us the document back, which is what we want *)
    let endpoint = endpoint ~params path in
    let* (response, body) =
      if Option.is_some id then
        External.Http.patch_json endpoint headers firestore_doc
      else
        External.Http.post_json endpoint headers firestore_doc in
    if is_error response
    then raise (Error "can't create doc")
    else Lwt.return (get_id_from_firestore_document_name (JSON.from_string body))

  let update_doc (request : Dream.request) (path : string) (update : JSON.t) : unit Lwt.t =
    Stats.write request;
    let* headers = TokenRefresher.header request in
    let firestore_update = to_firestore update in
    let endpoint = endpoint path in
    let* (response, _) = External.Http.patch_json endpoint headers firestore_update in
    if is_error response
    then raise (Error "can't update doc")
    else Lwt.return ()

  let delete_doc (request : Dream.request) (path : string) : unit Lwt.t =
    Stats.write request;
    let* headers = TokenRefresher.header request in
    let* response = External.Http.delete (endpoint path) headers in
    if is_error response
    then raise (Error "can't update doc")
    else Lwt.return ()

  let begin_transaction (request : Dream.request) : string Lwt.t =
    let* headers = TokenRefresher.header request in
    let endpoint = endpoint ~last_separator:":" "beginTransaction" in
    let* (response, body) = External.Http.post_json endpoint headers (`Assoc []) in
    if is_error response
    then raise (Error "can't begin transaction")
    else
      body
      |> JSON.from_string
      |> JSON.Util.member "transaction"
      |> JSON.Util.to_string
      |> Lwt.return

  let commit (request : Dream.request) (transaction_id : string) : unit Lwt.t =
    let* headers = TokenRefresher.header request in
    let endpoint = endpoint ~last_separator:":" "commit" in
    let json = `Assoc [("transaction", `String transaction_id)] in
    let* (response, _) = External.Http.post_json endpoint headers json in
    if is_error response
    then raise (Error "can't commit transaction")
    else Lwt.return ()

  let rollback (request : Dream.request) (transaction_id : string) : unit Lwt.t =
    let* headers = TokenRefresher.header request in
    let endpoint = endpoint ~last_separator:":" "rollback" in
    let json = `Assoc [("transaction", `String transaction_id)] in
    let* (response, _) = External.Http.post_json endpoint headers json in
    if is_error response
    then raise (Error "can't rollback transaction")
    else Lwt.return ()
end

open Utils

type token = string

(** These are the primitive operations that we need to perform on firestore.
    It is a low-level API. *)
module type FIREBASE_PRIMITIVES = sig (* TODO: rename firebase to firestore in most places *)

  (** Get a document from its path and return it as a JSON *)
  val get_doc : token -> string -> Yojson.Safe.t Lwt.t

  (** Create a document, potentially with a specific id (otherwise an id will be assigned by firestore).
      In either case, the document id is returned *)
  val create_doc : token -> string -> ?id:string -> Yojson.Safe.t -> string Lwt.t

  (** Update a document from its path and a partial update in JSON *)
  val update_doc : token -> string -> Yojson.Safe.t -> unit Lwt.t

  (** Delete a document from its path *)
  val delete_doc : token -> string -> unit Lwt.t

  (** Begin a transaction and return the transaction id *)
  val begin_transaction : token -> string Lwt.t

  (** Commit the transaction with the given id *)
  val commit : token -> string -> unit Lwt.t

  (** Roll back a transaction to cancel everything in it *)
  val rollback : token -> string -> unit Lwt.t
end

module Impl : FIREBASE_PRIMITIVES = struct
  let is_error (response : Cohttp.Response.t) =
    Cohttp.Code.is_error (Cohttp.Code.code_of_status response.status)

  let get_doc (token : token) (path : string) : Yojson.Safe.t Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let* (response, body) = !External.Http.get (Firebase.endpoint path) headers in
    if is_error response
    then raise (Error ("can't retrieve doc with path " ^ path))
    else Lwt.return (Firebase.of_firestore (Yojson.Safe.from_string body))

  let get_id_from_firestore_document_name (doc : Yojson.Safe.t) : string =
    let name = Yojson.Safe.Util.to_string (Yojson.Safe.Util.member "name" doc) in
    let elements = String.split_on_char '/' name in
    let id = List.nth elements (List.length elements - 1) in
    id

  let create_doc (token : token) (collection : string) ?(id : string option) (doc : Yojson.Safe.t) : string Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let path = match id with
      | Some id -> collection ^ "/" ^ id
      | None -> collection in
    let firestore_doc = Firebase.to_firestore doc in
    let params = [("mask", "_")] in (* By asking only for _, firestore will not give us the document back, which is what we want *)
    let endpoint = Firebase.endpoint ~params path in
    let* (response, body) =
      if Option.is_some id then
        !External.Http.patch_json endpoint headers firestore_doc
      else
        !External.Http.post_json endpoint headers firestore_doc in
    if is_error response
    then raise (Error "can't create doc")
    else Lwt.return (get_id_from_firestore_document_name (Yojson.Safe.from_string body))

  let update_doc (token : token) (path : string) (update : Yojson.Safe.t) : unit Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let firestore_update = Firebase.to_firestore update in
    let endpoint = Firebase.endpoint path in
    let* (response, _) = !External.Http.patch_json endpoint headers firestore_update in
    if is_error response
    then raise (Error "can't update doc")
    else Lwt.return ()

  let delete_doc (token : token) (path : string) : unit Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let* _ = !External.Http.delete (Firebase.endpoint path) headers in
    Lwt.return ()

  let begin_transaction (token : token) : string Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let endpoint = Firebase.endpoint ~last_separator:":" "beginTransaction" in
    let* (response, body) = !External.Http.post_json endpoint headers (`Assoc []) in
    if is_error response
    then raise (Error "can't begin transaction")
    else
      body
      |> Yojson.Safe.from_string
      |> Yojson.Safe.Util.member "transaction"
      |> Yojson.Safe.Util.to_string
      |> Lwt.return

  let commit (token : token) (transaction_id : string) : unit Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let endpoint = Firebase.endpoint ~last_separator:":" "commit" in
    let json = `Assoc [("transaction", `String transaction_id)] in
    let* (response, _) = !External.Http.post_json endpoint headers json in
    if is_error response
    then raise (Error "can't commit transaction")
    else Lwt.return ()

  let rollback (token : token) (transaction_id : string) : unit Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let endpoint = Firebase.endpoint ~last_separator:":" "rollback" in
    let json = `Assoc [("transaction", `String transaction_id)] in
    let* (response, _) = !External.Http.post_json endpoint headers json in
    if is_error response
    then raise (Error "can't rollback transaction")
    else Lwt.return ()
end

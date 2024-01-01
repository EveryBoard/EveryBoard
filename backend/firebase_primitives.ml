open Utils

type token = string

module type FIREBASE_PRIMITIVES = sig

  (** Get a document from its id and return it as a JSON *)
  val get_doc : token -> string -> Yojson.Safe.t Lwt.t

  (** Create a document, potentially with a specific id (otherwise an id will be assigned by firestore).
      In either case, the document id is returned *)
  val create_doc : token -> string -> ?id:string -> Yojson.Safe.t -> string Lwt.t

  (** Delete a document from its id *)
  val delete_doc : token -> string -> unit Lwt.t
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
    let doc_str = Yojson.Safe.to_string (Firebase.to_firestore doc) in
    let params = [("mask", "_")] in (* By asking only for _, firestore will not give us the document back, which is what we want *)
    let* (response, body) =
      if Option.is_some id then
        !External.Http.patch_json (Firebase.endpoint ~params path) headers doc_str
      else
        !External.Http.post_json (Firebase.endpoint ~params path) headers doc_str in
    if is_error response
    then raise (Error "can't create doc")
    else Lwt.return (get_id_from_firestore_document_name (Yojson.Safe.from_string body))

  let delete_doc (token : token) (path : string) : unit Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let* _ = !External.Http.delete (Firebase.endpoint path) headers in
    Lwt.return ()

end

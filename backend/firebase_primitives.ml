open Utils


module type FIREBASE_PRIMITIVES = sig
  val get_doc : string -> string -> Yojson.Safe.t Lwt.t

  val create_doc : string -> string -> ?id:string -> Yojson.Safe.t -> string Lwt.t
end

module Impl : FIREBASE_PRIMITIVES = struct
  let is_error (response : Cohttp.Response.t) =
    Cohttp.Code.is_error (Cohttp.Code.code_of_status response.status)

  let get_doc (token : string) (path : string) : Yojson.Safe.t Lwt.t =
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

  let create_doc (token : string) (collection : string) ?(id : string option) (doc : Yojson.Safe.t) : string Lwt.t =
    let headers = Cohttp.Header.of_list [Firebase.header token] in
    let path = match id with
      | Some id -> collection ^ "/" ^ id
      | None -> collection in
    let doc_str = Yojson.Safe.to_string (Firebase.to_firestore doc) in
    let params = [("mask", "_")] in (* By asking only for _, firestore will not give us the document back, which is what we want *)
    let* (response, body) =
      if Option.is_some id then
        !External.Http.patch_json (Firebase.endpoint ~version:"v1beta1" ~params path) headers doc_str
      else
        !External.Http.post_json (Firebase.endpoint ~version:"v1beta1" ~params path) headers doc_str in
    if is_error response
    then raise (Error "can't create doc")
    else Lwt.return (get_id_from_firestore_document_name (Yojson.Safe.from_string body))

end

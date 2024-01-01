open Alcotest
open Backend
open Utils
open Test_utils

module type MOCK = sig
  include Firebase_primitives.FIREBASE_PRIMITIVES

  val read_docs : string list ref

  val doc_to_return : Yojson.Safe.t option ref
end

module Mock : MOCK = struct

  let read_docs = ref []

  let doc_to_return = ref None

  let get_doc _ path =
    read_docs := path :: !read_docs;
    match !doc_to_return with
    | Some doc -> Lwt.return doc
    | None -> raise (Error "can't retrieve doc")

  let create_doc _ _ _ = failwith "TODO"

end

module Firebase_primitives = Firebase_primitives.Impl

let tests = [
  "Firebase_primitives.get_doc", [
    lwt_test "should retrieve the document returned by firebase" (fun () ->
        (* Given a document that exists *)
        let no_headers = Cohttp.Header.init () in
        (* Firestore has a strange way of returning objects, let's mock that *)
        let doc = `Assoc [("foo", `String "bar")] in
        let firestore_doc_str = Yojson.Safe.to_string (Firebase.to_firestore ~path:"collection/some-doc" doc) in
        with_mock External.Http.get (get_mock no_headers `OK firestore_doc_str) (fun _ ->
            (* When retrieving the document *)
            let* actual = Firebase_primitives.get_doc "token" "collection/some-doc" in
            let expected = doc in
            (* Then it should be the same document *)
            check json "success" expected actual;
            Lwt.return ()
          )
      );
    lwt_test "should fail if firebase returns an error" (fun () ->
        (* Given a document that does not exist *)
        let no_headers = Cohttp.Header.init () in
        (* TODO: does firebase answer with Not_found? To check. *)
        with_mock External.Http.get (get_mock no_headers `Not_found "document not found") (fun _ ->
            (* When retrieving the document *)
            (* Then it should fail *)
            lwt_check_raises "failure" (Error "can't retrieve doc") (fun () ->
                let* _ = Firebase_primitives.get_doc "token" "some/doc" in
                Lwt.return ()
              )
          )
      );
  ];

]

let integration_tests = [
  "Firebase_primitives document creation", [
    lwt_test "should successfully create and access a document" (fun () ->
        let token = "owner" in
        let collection = "coll" in
        (* Given a document *)
        let doc = `Assoc [
            ("hello", `String "firebase");
          ]; in
        (* When creating it and getting it *)
        let* uid = Firebase_primitives.create_doc token collection doc in
        let* retrieved_doc = Firebase_primitives.get_doc token (collection ^ "/" ^ uid) in
        (* Then it should work *)
        check json "success" doc retrieved_doc;
        Lwt.return ()
      )
  ];
]

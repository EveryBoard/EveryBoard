open Alcotest
open Backend
open Utils
open TestUtils

module type MOCK = sig
  include FirestorePrimitives.FIRESTORE_PRIMITIVES

  val read_docs : string list ref

  val doc_to_return : JSON.t option ref
end

module Mock : MOCK = struct

  let read_docs = ref []

  let doc_to_return = ref None

  let get_doc _ path =
    read_docs := path :: !read_docs;
    match !doc_to_return with
    | Some doc -> Lwt.return doc
    | None -> raise (Error "can't retrieve doc")

  let create_doc _ _ ?id:_ = failwith "TODO"

  let update_doc _ _ _ = failwith "TODO"

  let delete_doc _ _ = failwith "TODO"

  let begin_transaction _ = failwith "TODO"

  let commit _ _ = failwith "TODO"

  let rollback _ _ = failwith "TODO"

end

module FirestorePrimitives = FirestorePrimitives.Make(ExternalTests.Mock)(TokenRefresherTests.Mock)(StatsTests.Mock)

let tests = [
  "FirestorePrimitives.get_doc", [

    lwt_test "should retrieve the document returned by firestore" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that exists *)
        let doc = `Assoc [("foo", `String "bar")] in
        let response = ok_response (Cohttp.Header.init ()) in
        let body = JSON.to_string (to_firestore ~path:"collection/some-doc" doc) in
        let _ = ExternalTests.Mock.Http.mock_response (response, body) in
        (* When retrieving the document *)
        let* actual = FirestorePrimitives.get_doc request "collection/some-doc" in
        let expected = doc in
        (* Then it should be the same document *)
        check json "success" expected actual;
        Lwt.return ()
      );

    lwt_test "should fail if firebase returns an error" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that does not exist *)
        let _ = ExternalTests.Mock.Http.mock_response (not_found_response, "") in
        (* When retrieving the document *)
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't retrieve doc with path some/doc") (fun () ->
            let* _ = FirestorePrimitives.get_doc request "some/doc" in
            Lwt.return ()
          )
      );
  ];

  "FirestorePrimitives.create_doc", [

    lwt_test "should make a POST request if we don't ask for a specific id, and return the id" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that we want to create *)
        let doc = `Assoc [("foo", `String "bar")] in
        (* When we create it *)
        let response = ok_response (Cohttp.Header.init ()) in
        let body = JSON.to_string (`Assoc [("name", `String "collection/some-id")]) in
        let mock = ExternalTests.Mock.Http.mock_response (response, body) in
        (* Then it should have made a POST request and should return the document id*)
        let* id = FirestorePrimitives.create_doc request "collection" doc in
        check (list http_query) "query" [(`POST, endpoint ~params:[("mask", "_")] "collection")] !(mock.calls);
        check string "document id" "some-id" id;
        Lwt.return ()
      );

    lwt_test "should make a PATCH request if we want an id, and return the id" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that we want to create, along with a specific id*)
        let id = "some-id" in
        let doc = `Assoc [("foo", `String "bar")] in
        (* When we create it *)
        let response = ok_response (Cohttp.Header.init ()) in
        let body = JSON.to_string (`Assoc [("name", `String "collection/some-id")]) in
        let mock = ExternalTests.Mock.Http.mock_response (response, body) in
        (* Then it should have made a PATCH request and should return the document id*)
        let* id = FirestorePrimitives.create_doc ~id request "collection" doc in
        check (list http_query) "query" [(`PATCH, endpoint ~params:[("mask", "_")] "collection/some-id")] !(mock.calls);
        check string "document id" "some-id" id;
        Lwt.return ()
      );

    lwt_test "should fail if the document cannot be created" (fun () ->
        failwith "TODO"
      );
  ];

]

let integration_tests = [
  (*
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
  ]; *)
]

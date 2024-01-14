open Alcotest
open Backend
open Utils
open TestUtils

module type MOCK = sig
  include FirestorePrimitives.FIRESTORE_PRIMITIVES

  val started_transactions : string list ref

  val succeeded_transactions : string list ref

  val failed_transactions : string list ref

  val read_docs : string list ref

  val created_docs : (string * string option * JSON.t) list ref

  val updated_docs : (string * JSON.t) list ref

  val deleted_docs : string list ref

  val doc_to_return : JSON.t option ref
end

module Mock : MOCK = struct

  let started_transactions = ref []

  let succeeded_transactions = ref []

  let failed_transactions = ref []

  let read_docs = ref []

  let created_docs = ref []

  let updated_docs = ref []

  let deleted_docs = ref []

  let doc_to_return = ref None

  let get_doc _ path =
    read_docs := path :: !read_docs;
    match !doc_to_return with
    | Some doc -> Lwt.return doc
    | None -> raise (Error "can't retrieve doc")

  let create_doc _ path ?id doc =
    created_docs := (path, id, doc) :: !created_docs;
    Lwt.return "created-id"

  let update_doc _ path update =
    updated_docs := (path, update) :: !updated_docs;
    Lwt.return ()

  let delete_doc _ path =
    deleted_docs := path :: !deleted_docs;
    Lwt.return ()

  let begin_transaction _ =
    let transaction_id = "transaction-id" in
    started_transactions := transaction_id :: !started_transactions;
    Lwt.return "transaction-id"

  let commit _ transaction_id =
    succeeded_transactions := transaction_id :: !succeeded_transactions;
    Lwt.return ()

  let rollback _ transaction_id =
    failed_transactions := transaction_id :: !failed_transactions;
    Lwt.return ()

end

module FirestorePrimitives = FirestorePrimitives.Make(ExternalTests.Mock)(TokenRefresherTests.Mock)(StatsTests.Mock)

let tests = [
  "FirestorePrimitives.get_doc", [

    lwt_test "should retrieve the document returned by firestore" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that exists *)
        let path = "collection/some-id" in
        let doc = `Assoc [("foo", `String "bar")] in
        let body = JSON.to_string (to_firestore ~path doc) in
        let _ = ExternalTests.Mock.Http.mock_response (response `OK, body) in
        (* When retrieving the document *)
        let* actual = FirestorePrimitives.get_doc request path in
        (* Then it should be the same document *)
        let expected = doc in
        check json_eq "success" expected actual;
        Lwt.return ()
      );

    lwt_test "should fail if firebase returns an error" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that does not exist *)
        let _ = ExternalTests.Mock.Http.mock_response (response `Not_found, "") in
        (* When retrieving the document *)
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't retrieve doc with path some-doc-that-doesnt-exist") (fun () ->
            let* _ = FirestorePrimitives.get_doc request "some-doc-that-doesnt-exist" in
            Lwt.return ()
          )
      );
  ];

  "FirestorePrimitives.create_doc", [

    lwt_test "should make a POST request if we don't ask for a specific id, and return the id" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that we want to create *)
        let collection = "collection" in
        let id = "some-id" in
        let path = collection ^ "/" ^ id in
        let doc = `Assoc [("foo", `String "bar")] in
        (* When we create it *)
        let body = JSON.to_string (`Assoc [("name", `String path)]) in
        let mock = ExternalTests.Mock.Http.mock_response (response `OK, body) in
        let* actual_id = FirestorePrimitives.create_doc request collection doc in
        (* Then it should have made a POST request with the doc, and should return the document id*)
        let firestore_doc = to_firestore doc in
        check (list http_query) "query" [(`POST, endpoint ~params:[("mask", "_")] collection, Some firestore_doc)] !(mock.calls);
        check string "document id" id actual_id;
        Lwt.return ()
      );

    lwt_test "should make a PATCH request if we want an id, and return the id" (fun () ->
        let request = Dream.request "/" in
        (* Given a document that we want to create, along with a specific id *)
        let collection = "collection" in
        let id = "some-id" in
        let path = collection ^ "/" ^ id in
        let doc = `Assoc [("foo", `String "bar")] in
        (* When we create it *)
        let body = JSON.to_string (`Assoc [("name", `String path)]) in
        let mock = ExternalTests.Mock.Http.mock_response (response `OK, body) in
        let* actual_id = FirestorePrimitives.create_doc ~id request "collection" doc in
        (* Then it should have made a PATCH request with the doc and should return the document id*)
        let firestore_doc = to_firestore doc in
        check (list http_query) "query" [(`PATCH, endpoint ~params:[("mask", "_")] path, Some firestore_doc)] !(mock.calls);
        check string "document id" id actual_id;
        Lwt.return ()
      );

    lwt_test "should fail if the document cannot be created" (fun () ->
        let request = Dream.request "/" in
        (* Given a document we want to create *)
        let doc = `Assoc [("foo", `String "bar")] in
        (* When we try to create it but firestore will not accept it *)
        let response = response `Bad_request in
        let _ = ExternalTests.Mock.Http.mock_response (response, "{}") in
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't create doc") (fun () ->
            let* _ = FirestorePrimitives.create_doc request "collection" doc in
            Lwt.return ())
      );
  ];

  "FirestorePrimitives.update_doc", [

    lwt_test "should make a PATCH request on the document with only the update" (fun () ->
        let request = Dream.request "/" in
        (* Given an update that we want to apply to some document *)
        let update = `Assoc [("foo", `String "bli")] in
        let path = "collection/some-id" in
        (* When we update it *)
        let mock = ExternalTests.Mock.Http.mock_response (response `OK, "") in
        let* _ = FirestorePrimitives.update_doc request path update in
        (* Then it should have made a PATCH request on the document with the update *)
        let firestore_update = to_firestore update in
        (* mask=_ means we don't care about the return value, updateMask=foo means we only update the foo field *)
        let params = [("mask", "_"); ("updateMask", "foo")] in
        check (list http_query) "query" [(`PATCH, endpoint ~params path, Some firestore_update)] !(mock.calls);
        Lwt.return ()
      );

    lwt_test "should fail if the update failed" (fun () ->
        let request = Dream.request "/" in
        (* Given an update that we want to apply to some document *)
        let update = `Assoc [("foo", `String "bli")] in
        (* When we update it and the update fails*)
        let _ = ExternalTests.Mock.Http.mock_response (response `Bad_request, "") in
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't update doc") (fun () ->
            let* _ = FirestorePrimitives.update_doc request "collection/some-id" update in
            Lwt.return ())
      );
  ];

  "FirestorePrimitives.delete_doc", [

    lwt_test "should make a DELETE request on the document" (fun () ->
        let request = Dream.request "/" in
        (* Given a document we want to delete *)
        let path = "collection/some-id" in
        (* When we update it *)
        let mock = ExternalTests.Mock.Http.mock_response (response `OK, "") in
        let* _ = FirestorePrimitives.delete_doc request path in
        (* Then it should have made a DELETE request on the document *)
        check (list http_query) "query" [(`DELETE, endpoint path, None)] !(mock.calls);
        Lwt.return ()
      );

    lwt_test "should fail if the deletion failed" (fun () ->
        let request = Dream.request "/" in
        (* Given a document we want to delete *)
        let path = "collection/some-id" in
        (* When we update it *)
        let _ = ExternalTests.Mock.Http.mock_response (response `Bad_request, "") in
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't update doc") (fun () ->
            let* _ = FirestorePrimitives.delete_doc request path in
            Lwt.return ())
      );
  ];

  "FirestorePrimitives.begin_transaction", [

    lwt_test "should make a POST request on :beginTransaction endpoint" (fun () ->
        let request = Dream.request "/" in
        (* When we begin a transaction *)
        let transaction_id = "transaction-id" in
        let transaction_response = `Assoc [("transaction", `String transaction_id)] in
        let mock = ExternalTests.Mock.Http.mock_response (response `OK, JSON.to_string transaction_response) in
        let* actual = FirestorePrimitives.begin_transaction request in
        (* Then it should have made a POST request on :beginTransaction, and return the transaction id *)
        let nothing = `Assoc [] in
        check (list http_query) "query" [(`POST, endpoint ~last_separator:":" "beginTransaction", Some nothing)] !(mock.calls);
        check string "transaction id" transaction_id actual;
        Lwt.return ()
      );

    lwt_test "should fail if beginning the transaction failed" (fun () ->
        let request = Dream.request "/" in
        (* When we try to begin a transaction but it fails *)
        let _ = ExternalTests.Mock.Http.mock_response (response `Bad_request, "{}") in
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't begin transaction") (fun () ->
            let* _ = FirestorePrimitives.begin_transaction request in
            Lwt.return ())
      );
  ];

  "FirestorePrimitives.commit", [

    lwt_test "should make a POST request on :commit endpoint" (fun () ->
        let request = Dream.request "/" in
        (* When we commit a transaction *)
        let transaction_id = "transaction-id" in
        let mock = ExternalTests.Mock.Http.mock_response (response `OK, "") in
        let* _ = FirestorePrimitives.commit request transaction_id in
        (* Then it should have made a POST request on :commit with the transaction id *)
        let expected_body = `Assoc [("transaction", `String transaction_id)] in
        check (list http_query) "query" [(`POST, endpoint ~last_separator:":" "commit", Some expected_body)] !(mock.calls);
        Lwt.return ()
      );

    lwt_test "should fail if commiting the transaction failed" (fun () ->
        let request = Dream.request "/" in
        (* When we try to commit a transaction but it fails *)
        let transaction_id = "transaction-id" in
        let _ = ExternalTests.Mock.Http.mock_response (response `Bad_request, "{}") in
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't commit transaction") (fun () ->
            let* _ = FirestorePrimitives.commit request transaction_id in
            Lwt.return ())
      );
  ];

  "FirestorePrimitives.rollback_transaction", [

    lwt_test "should make a POST request on :rollback endpoint" (fun () ->
        let request = Dream.request "/" in
        (* When we rollback a transaction *)
        let transaction_id = "transaction-id" in
        let mock = ExternalTests.Mock.Http.mock_response (response `OK, "") in
        let* _ = FirestorePrimitives.rollback request transaction_id in
        (* Then it should have made a POST request on :rollback with the transaction id *)
        let expected_body = `Assoc [("transaction", `String transaction_id)] in
        check (list http_query) "query" [(`POST, endpoint ~last_separator:":" "rollback", Some expected_body)] !(mock.calls);
        Lwt.return ()
      );

    lwt_test "should fail if the rollback failed" (fun () ->
        let request = Dream.request "/" in
        (* When we try to commit a transaction but it fails *)
        let transaction_id = "transaction-id" in
        let _ = ExternalTests.Mock.Http.mock_response (response `Bad_request, "{}") in
        (* Then it should fail *)
        lwt_check_raises "failure" (Error "can't rollback transaction") (fun () ->
            let* _ = FirestorePrimitives.rollback request transaction_id in
            Lwt.return ())
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

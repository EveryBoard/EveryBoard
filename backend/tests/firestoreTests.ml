open Alcotest
open Backend
open Utils
open TestUtils

module type MOCK = sig
  include Firestore.FIRESTORE

  val user : Domain.User.t option ref
end

module Mock : MOCK = struct

  let transaction _ _ = failwith "TODO"

  let user : Domain.User.t option ref = ref None

  module User = struct
    let get _  _ =
      match !user with
      | Some user -> Lwt.return user
      | None -> raise (DocumentNotFound "user")
  end

  module Game = struct
    let get _ _ = failwith "TODO"
    let get_name _ _ = failwith "TODO"
    let create _ _ = failwith "TODO"
    let delete _ _ = failwith "TODO"
    let update _ _ _ = failwith "TODO"
    let add_event _ _ _ = failwith "TODO"
  end

  module ConfigRoom = struct
    let get _ _ = failwith "TODO"
    let create _ _ _ = failwith "TODO"
    let add_candidate _ _ _ = failwith "TODO"
    let remove_candidate _ _ _ = failwith "TODO"
    let accept _ _ = failwith "TODO"
    let update _ _ _ = failwith "TODO"
  end

  module Chat = struct
    let create _ _ = failwith "TODO"
  end

end

let unverified_user : Domain.User.t = {
  username = Some "foo";
  last_update_time = None;
  verified = false;
  current_game = None;
}

let verified_user : Domain.User.t = {
  username = Some "foo";
  last_update_time = None;
  verified = true;
  current_game = None;
}

let verified_minimal_user : Domain.MinimalUser.t =
  (* The uid is set to match the uid of JwtTests.identity_token *)
  Domain.User.to_minimal_user "wECcuMPVQHO9VSs7bgOL5rLxmPD2" verified_user

let unstarted_game : Domain.Game.t =
  Domain.Game.initial "P4" verified_minimal_user

let initial_config_room : Domain.ConfigRoom.t =
  Domain.ConfigRoom.initial verified_minimal_user

module Firestore = Firestore.Make(FirestorePrimitivesTests.Mock)

let test_get type_ get collection ?(mask = "") doc expected conversion = [
    lwt_test "should retrieve" (fun () ->
        let request = Dream.request "/" in
        (* Given a user *)
        FirestorePrimitivesTests.Mock.doc_to_return := Some (conversion doc);
        (* When getting it *)
        let* actual = get request "id" in
        (* Then it should be retrieved *)
        check type_ "success" expected actual;
        Lwt.return ()
    );

    lwt_test "should fail if document does not exist" (fun () ->
        let request = Dream.request "/" in
        (* Given that no user exist *)
        FirestorePrimitivesTests.Mock.doc_to_return := None;
        (* When trying to get a user with get_user *)
        (* Then it should fail *)
        lwt_check_raises "failure" (DocumentNotFound (collection ^ "/id" ^ mask)) (fun () ->
            let* _ = get request "id" in
            Lwt.return ())
      );

    lwt_test "should raise an error if document exists but is invalid" (fun () ->
        let request = Dream.request "/" in
        (* Given a user *)
        FirestorePrimitivesTests.Mock.doc_to_return := Some (`Assoc [("not-a", `String "user!")]);
        (* When getting it with get_user *)
        (* Then it should raise an error *)
        lwt_check_raises "failure" (DocumentInvalid (collection ^ "/id")) (fun () ->
            let* _ = get request "id" in
            Lwt.return ())
      );
]

let creations_type = list (triple string (option string) json_eq)

let tests = [

  "Firestore.transaction", [
    lwt_test "should commit the transaction upon success of the body" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.started_transactions := [];
        FirestorePrimitivesTests.Mock.succeeded_transactions := [];
        FirestorePrimitivesTests.Mock.failed_transactions := [];
        (* Given a transaction we want to do, which will succeed *)
        let transaction_body () = Lwt.return 42 in
        (* When doing it *)
        let* result = Firestore.transaction request transaction_body in
        (* Then it should have begun and committed the transaction *)
        let started = !FirestorePrimitivesTests.Mock.started_transactions in
        let succeeded = !FirestorePrimitivesTests.Mock.succeeded_transactions in
        let failed = !FirestorePrimitivesTests.Mock.failed_transactions in
        check int "result" 42 result;
        check (list string) "started" ["transaction-id"] started;
        check (list string) "succeeded" ["transaction-id"] succeeded;
        check (list string) "failed" [] failed;
        Lwt.return ()
      );

    lwt_test "should rollback the transaction upon an exception" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.started_transactions := [];
        FirestorePrimitivesTests.Mock.succeeded_transactions := [];
        FirestorePrimitivesTests.Mock.failed_transactions := [];
        (* Given a transaction we want to do, which will throw *)
        let transaction_body () = raise (Failure "Error!") in
        (* When doing it *)
        (* Then it should have begun and rolled back the transaction *)
        let* _ = lwt_check_raises "failure" (Failure "Error!") (fun () ->
            let* _ = Firestore.transaction request transaction_body in
            Lwt.return ()) in
        let started = !FirestorePrimitivesTests.Mock.started_transactions in
        let succeeded = !FirestorePrimitivesTests.Mock.succeeded_transactions in
        let failed = !FirestorePrimitivesTests.Mock.failed_transactions in
        check (list string) "started" ["transaction-id"] started;
        check (list string) "succeeded" [] succeeded;
        check (list string) "failed" ["transaction-id"] failed;
        Lwt.return ()
      );
  ];

  "Firestore.User.get", test_get user_eq Firestore.User.get "users" verified_user verified_user Domain.User.to_yojson;

  "Firestore.Game.get", test_get game_eq Firestore.Game.get "parts" unstarted_game unstarted_game Domain.Game.to_yojson;

  "Firestore.Game.get_name", test_get string Firestore.Game.get_name "parts" ~mask:"?mask=typeGame" unstarted_game "P4" Domain.Game.to_yojson;

  "Firestore.Game.create", [
    lwt_test "should create the document" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.created_docs := [];
        (* Given a game *)
        let game = unstarted_game in
        (* When creating it *)
        let* id = Firestore.Game.create request game  in
        (* Then it should have called create_doc on /parts and return the game id *)
        let game_json = Domain.Game.to_yojson game in
        check string "id" id "created-id";
        let created = !FirestorePrimitivesTests.Mock.created_docs in
        check creations_type "creations" [("parts", None, game_json)] created;
        Lwt.return ()
      );
  ];

  "Firestore.Game.delete", [
    lwt_test "should delete the document" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.deleted_docs := [];
        (* Given a game *)
        let game_id = "game-id" in
        (* When deleting it *)
        let* _ = Firestore.Game.delete request game_id in
        (* Then it should have called delete_doc on /parts with the game id *)
        let deleted = !FirestorePrimitivesTests.Mock.deleted_docs in
        check (list string) "deletions" ["parts/" ^ game_id] deleted;
        Lwt.return ()
      );
  ];

  "Firestore.Game.update", [
    lwt_test "should update the document" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.updated_docs := [];
        (* Given a game and its update *)
        let game_id = "game-id" in
        let update = Domain.Game.Updates.EndTurn.get 1 in
        let json_update = Domain.Game.Updates.EndTurn.to_yojson update in
        (* When applying the update *)
        let* _ = Firestore.Game.update request game_id json_update in
        (* Then it should have called update_doc on /parts with the game id and update *)
        let updated = !FirestorePrimitivesTests.Mock.updated_docs in
        check (list (pair string json_eq)) "updates" [("parts/" ^ game_id, json_update)] updated;
        Lwt.return ()
      );
  ];

  "Firestore.Game.add_event", [
    lwt_test "should create an event document" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.created_docs := [];
        (* Given an event we want to create in a game *)
        let game_id = "game-id" in
        let user = Domain.User.to_minimal_user "uid" verified_user in
        let event = Domain.Game.Event.(Request (Request.draw user 0)) in
        (* When adding the event *)
        let* _ = Firestore.Game.add_event request game_id event in
        (* Then it should have created an event document *)
        let json_event = Domain.Game.Event.to_yojson event in
        let created = !FirestorePrimitivesTests.Mock.created_docs in
        check creations_type "creations" [("parts/" ^ game_id ^ "/events", None, json_event)] created;
        Lwt.return ()
      );
  ];

  "Firestore.ConfigRoom.create", [
    lwt_test "should create a config room document" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.created_docs := [];
        (* Given a config room *)
        let game_id = "game-id" in
        let config_room = initial_config_room in
        (* When we create it *)
        let* _ = Firestore.ConfigRoom.create request game_id config_room in
        (* Then it should have been created *)
        let json_config_room = Domain.ConfigRoom.to_yojson config_room in
        let created = !FirestorePrimitivesTests.Mock.created_docs in
        check creations_type "creations" [("config-room", Some game_id, json_config_room)] created;
        Lwt.return ()
      );
  ];

  "Firestore.ConfigRoom.accept", [
    lwt_test "should send the appropriate update to the config room" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.updated_docs := [];
        (* Given a game for which we want to accept the config *)
        let game_id = "game-id" in
        (* When we accept it *)
        let* _ = Firestore.ConfigRoom.accept request game_id in
        (* Then it should have updated the config room *)
        let json_update = `Assoc [("partStatus", Domain.ConfigRoom.GameStatus.(to_yojson Started))] in
        let updated = !FirestorePrimitivesTests.Mock.updated_docs in
        check (list (pair string json_eq)) "updates" [("config-room/" ^ game_id, json_update)] updated;
        Lwt.return ()
      )
  ];

  "Firestore.Chat.create", [
    lwt_test "should create an empty chat" (fun () ->
        let request = Dream.request "/" in
        FirestorePrimitivesTests.Mock.created_docs := [];
        (* Given a game for which we want to create the chat *)
        let game_id = "game-id" in
        (* When we create the chat *)
        let* _ = Firestore.Chat.create request game_id in
        (* Then it should have been created *)
        let created = !FirestorePrimitivesTests.Mock.created_docs in
        let empty_chat = `Assoc [] in
        check creations_type "creations" [("chats", Some game_id, empty_chat)] created;
        Lwt.return ()
      );
  ];

  "Firestore.ConfigRoom.get", test_get config_room_eq Firestore.ConfigRoom.get "config-room" initial_config_room initial_config_room Domain.ConfigRoom.to_yojson;
]

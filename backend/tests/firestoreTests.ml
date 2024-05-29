open Alcotest
open Backend
open Utils
open TestUtils

type call =
    | CreateGame of JSON.t
    | DeleteGame of string
    | UpdateGame of string * JSON.t
    | AddEvent of string * JSON.t

    | CreateConfigRoom of string * JSON.t
    | DeleteConfigRoom of string
    | AddCandidate of string * Domain.MinimalUser.t
    | RemoveCandidate of string * string
    | UpdateConfigRoom of string * JSON.t
    | AcceptConfig of string

    | CreateChat of string
    | DeleteChat of string
[@@deriving show]

let call : call testable =
    let pp ppf (call : call) = Fmt.pf ppf "%s" (show_call call) in
    testable pp (=)

module type MOCK = sig
    include Firestore.FIRESTORE

    val user : (unit -> Domain.User.t) ref

    val calls : call list ref
    val clear_calls : unit -> unit

    module Game : sig
        include module type of Game
        val set : Domain.Game.t -> unit
    end

    module ConfigRoom : sig
        include module type of ConfigRoom
        val set : Domain.ConfigRoom.t -> unit
    end
end

module Mock : MOCK = struct

    let user = ref (fun () -> raise (DocumentNotFound "user"))

    let calls : call list ref = ref []
    let clear_calls () = calls := []
    let record_call (call : call) : unit =
        calls := !calls @ [call]

    module User = struct
        let get ~request:_ ~id:_ = Lwt.return (!user ())
    end

    module Game = struct
        let game : Domain.Game.t option ref = ref None
        let set new_game =
            game := Some new_game
        let get ~request:_ ~id:_ =
            Lwt.return (Option.get !game)
        let get_name ~request:_ ~id:_ =
            Lwt.return (Option.get !game).type_game
        let create ~request:_ ~game =
            record_call (CreateGame (Domain.Game.to_yojson game));
            Lwt.return "game_id"
        let delete ~request:_ ~id =
            record_call (DeleteGame id);
            Lwt.return ()
        let update ~request:_ ~id ~update =
            record_call (UpdateGame (id, update));
            Lwt.return ()
        let add_event ~request:_ ~id ~event =
            record_call (AddEvent (id, Domain.GameEvent.to_yojson event));
            Lwt.return ()
    end

    module ConfigRoom = struct
        let config_room : Domain.ConfigRoom.t option ref = ref None
        let set new_config_room =
            config_room := Some new_config_room
        let get ~request:_ ~id:_ =
            Lwt.return (Option.get !config_room)

        let create ~request:_ ~id ~config_room =
            record_call (CreateConfigRoom (id, Domain.ConfigRoom.to_yojson config_room));
            Lwt.return ()
        let delete ~request:_ ~id =
            record_call (DeleteConfigRoom id);
            Lwt.return ()
        let add_candidate ~request:_ ~id ~candidate =
            record_call (AddCandidate (id, candidate));
            Lwt.return ()
        let remove_candidate ~request:_ ~id ~candidate_id =
            record_call (RemoveCandidate (id, candidate_id));
            Lwt.return ()
        let accept ~request:_ ~id =
            record_call (AcceptConfig id);
            Lwt.return ()
        let update ~request:_ ~id ~update =
            record_call (UpdateConfigRoom (id, update));
            Lwt.return ()
    end

    module Chat = struct
        let create ~request:_ ~id =
            record_call (CreateChat id);
            Lwt.return ()
        let delete ~request:_ ~id =
            record_call (DeleteChat id);
            Lwt.return ()
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
        let* actual = get ~request ~id:"id" in
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
        lwt_check_raises "failure" ((=) (DocumentNotFound (collection ^ "/id" ^ mask))) (fun () ->
            let* _ = get ~request ~id:"id" in
            Lwt.return ())
    );

    lwt_test "should raise an error if document exists but is invalid" (fun () ->
        let request = Dream.request "/" in
        (* Given a user *)
        FirestorePrimitivesTests.Mock.doc_to_return := Some (`Assoc [("not-a", `String "user!")]);
        (* When getting it with get_user *)
        (* Then it should raise an error *)
        let invalid_doc_error = function
            | DocumentInvalid _ -> true (* the message contain details about the error, we don't want to match that precisely *)
            | _ -> false in
        lwt_check_raises "failure" invalid_doc_error (fun () ->
            let* _ = get ~request ~id:"id" in
            Lwt.return ())
    );
]

let creations_type = list (pair string json_eq)
let set_type = list (triple string string json_eq)

let tests = [

    "Firestore.User.get", test_get user_eq Firestore.User.get "users" verified_user verified_user Domain.User.to_yojson;

    "Firestore.Game.get", test_get game_eq Firestore.Game.get "parts" unstarted_game unstarted_game Domain.Game.to_yojson;

    "Firestore.Game.get_name", test_get string Firestore.Game.get_name "parts" ~mask:"?mask.fieldPaths=typeGame" unstarted_game "P4" Domain.Game.to_yojson;

    "Firestore.Game.create", [
        lwt_test "should create the document" (fun () ->
            let request = Dream.request "/" in
            FirestorePrimitivesTests.Mock.created_docs := [];
            (* Given a game *)
            let game = unstarted_game in
            (* When creating it *)
            let* id = Firestore.Game.create ~request ~game  in
            (* Then it should have called create_doc on /parts and return the game id *)
            let game_json = Domain.Game.to_yojson game in
            check string "id" id "created-id";
            let created = !FirestorePrimitivesTests.Mock.created_docs in
            check creations_type "creations" [("parts", game_json)] created;
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
            let* _ = Firestore.Game.delete ~request ~id:game_id in
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
            let* _ = Firestore.Game.update ~request ~id:game_id ~update:json_update in
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
            let event = Domain.GameEvent.(Request (Request.draw user 0)) in
            (* When adding the event *)
            let* _ = Firestore.Game.add_event ~request ~id:game_id ~event in
            (* Then it should have created an event document *)
            let json_event = Domain.GameEvent.to_yojson event in
            let created = !FirestorePrimitivesTests.Mock.created_docs in
            check creations_type "creations" [("parts/" ^ game_id ^ "/events", json_event)] created;
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
            let* _ = Firestore.ConfigRoom.create ~request ~id:game_id ~config_room in
            (* Then it should have been created *)
            let json_config_room = Domain.ConfigRoom.to_yojson config_room in
            let set = !FirestorePrimitivesTests.Mock.set_docs in
            check set_type "creations" [("config-room", game_id, json_config_room)] set;
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
            let* _ = Firestore.ConfigRoom.accept ~request ~id:game_id in
            (* Then it should have updated the config room *)
            let json_update = `Assoc [("partStatus", Domain.ConfigRoom.GameStatus.(to_yojson Started))] in
            let updated = !FirestorePrimitivesTests.Mock.updated_docs in
            check (list (pair string json_eq)) "updates" [("config-room/" ^ game_id, json_update)] updated;
            Lwt.return ()
        )
    ];

    "Firestore.ConfigRoom.delete", [
        lwt_test "should delete the document" (fun () ->
            let request = Dream.request "/" in
            FirestorePrimitivesTests.Mock.deleted_docs := [];
            (* Given a config room *)
            let game_id = "game-id" in
            (* When deleting it *)
            let* _ = Firestore.ConfigRoom.delete ~request ~id:game_id in
            (* Then it should have called delete_doc on /chat with the game id *)
            let deleted = !FirestorePrimitivesTests.Mock.deleted_docs in
            check (list string) "deletions" ["config-room/" ^ game_id] deleted;
            Lwt.return ()
        );
    ];

    "Firestore.ConfigRoom.add_candidate", [
        lwt_test "should create a candidate document in a sub-collection" (fun () ->
            let request = Dream.request "/" in
            FirestorePrimitivesTests.Mock.set_docs := [];
            (* Given a config room *)
            let game_id = "game-id" in
            let candidate = DomainTests.a_minimal_user in
            (* When we add a candidate *)
            let* _ = Firestore.ConfigRoom.add_candidate ~request ~id:game_id ~candidate in
            (* Then it should have created a document in the sub collection *)
            let json_user = Domain.MinimalUser.to_yojson candidate in
            let set = !FirestorePrimitivesTests.Mock.set_docs in
            check set_type "creations" [("config-room/game-id/candidates", candidate.id, json_user)] set;
            Lwt.return ()
        );
    ];

    "Firestore.ConfigRoom.remove_candidate", [
        lwt_test "should remove candidate document" (fun () ->
            let request = Dream.request "/" in
            FirestorePrimitivesTests.Mock.deleted_docs := [];
            (* Given a config room with a candidate *)
            let game_id = "game-id" in
            let candidate = DomainTests.a_minimal_user in
            let* _ = Firestore.ConfigRoom.add_candidate ~request ~id:game_id ~candidate in
            (* When we remove a candidate *)
            let* _ = Firestore.ConfigRoom.remove_candidate ~request ~id:game_id ~candidate_id:candidate.id in
            (* Then it should have deleted the corresponding document *)
            let deleted = !FirestorePrimitivesTests.Mock.deleted_docs in
            check (list string) "deletions" ["config-room/game-id/candidates/" ^ candidate.id] deleted;
            Lwt.return ()
        );
    ];

    "Firestore.Chat.create", [
        lwt_test "should create an empty chat" (fun () ->
            let request = Dream.request "/" in
            FirestorePrimitivesTests.Mock.set_docs := [];
            (* Given a game for which we want to create the chat *)
            let game_id = "game-id" in
            (* When we create the chat *)
            let* _ = Firestore.Chat.create ~request ~id:game_id in
            (* Then it should have been created *)
            let set = !FirestorePrimitivesTests.Mock.set_docs in
            let empty_chat = `Assoc [] in
            check set_type "creations" [("chats", game_id, empty_chat)] set;
            Lwt.return ()
        );
    ];

    "Firestore.Chat.delete", [
        lwt_test "should delete the document" (fun () ->
            let request = Dream.request "/" in
            FirestorePrimitivesTests.Mock.deleted_docs := [];
            (* Given a chat *)
            let game_id = "game-id" in
            (* When deleting it *)
            let* _ = Firestore.Chat.delete ~request ~id:game_id in
            (* Then it should have called delete_doc on /chat with the game id *)
            let deleted = !FirestorePrimitivesTests.Mock.deleted_docs in
            check (list string) "deletions" ["chats/" ^ game_id] deleted;
            Lwt.return ()
        );
    ];

    "Firestore.ConfigRoom.get", test_get config_room_eq Firestore.ConfigRoom.get "config-room" initial_config_room initial_config_room Domain.ConfigRoom.to_yojson;
]

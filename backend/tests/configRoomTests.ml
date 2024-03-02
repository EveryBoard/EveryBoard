open Alcotest
open Backend
open Utils
open TestUtils

module ConfigRoom = ConfigRoom.Make(ExternalTests.Mock)(AuthTests.Mock)(FirestoreTests.Mock)(StatsTests.Mock)

let handler = Dream.router ConfigRoom.routes

let tests = [
  "ConfigRoom.routes config-room/:game_id/candidates", [

    lwt_test "should add user to candidates if they are not creator" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;
        (* Given a game with a config room already existing *)
        let game_id = "game-id" in
        let config_room = Domain.ConfigRoom.initial DomainTests.another_minimal_user in
        FirestoreTests.Mock.ConfigRoom.set config_room;

        (* When joining the game *)
        let target = Printf.sprintf "config-room/%s/candidates" game_id in
        let request = Dream.request ~method_:`POST ~target "" in
        let* result = handler request in

        (* Then it should return OK and have added the candidate to the config room *)
        check status "response status" `OK (Dream.status result);
        let expected = [FirestoreTests.AddCandidate (game_id, DomainTests.a_minimal_user)] in
        check (list FirestoreTests.call) "calls" expected !FirestoreTests.Mock.calls;
        Lwt.return ()
      );

    lwt_test "should not add user to candidates if they are creator" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;
        (* Given a game with a config room already existing *)
        let game_id = "game-id" in
        let config_room = Domain.ConfigRoom.initial DomainTests.a_minimal_user in
        FirestoreTests.Mock.ConfigRoom.set config_room;

        (* When joining the game as creator *)
        let target = Printf.sprintf "config-room/%s/candidates" game_id in
        let request = Dream.request ~method_:`POST ~target "" in
        let* result = handler request in

        (* Then it should return OK and have not added the candidate to the config room *)
        check status "response status" `OK (Dream.status result);
        let expected = [] in
        check (list FirestoreTests.call) "calls" expected !FirestoreTests.Mock.calls;
        Lwt.return ()
      );

  ]
]

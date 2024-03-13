open Alcotest
open Backend
open Utils
open TestUtils

module Game = Game.Make(ExternalTests.Mock)(AuthTests.Mock)(FirestoreTests.Mock)(StatsTests.Mock)

let handler = Dream.router Game.routes

let tests = [
  "Game.routes POST game/", [

    lwt_test "should fail if the gameName is not provided" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;

        (* When creating a game that does not exist *)
        (* Then it should fail *)
        lwt_check_raises "failure" ((=) (BadInput "Missing gameName in query")) (fun () ->
            let target = "game" in
            let request = Dream.request ~method_:`POST ~target "" in
            let* _ = handler request in
            Lwt.return ())
      );

    lwt_test "should fail if the gameName does not correspond to a real game" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;

        (* When creating a game that does not exist *)
        (* Then it should fail *)
        lwt_check_raises "failure" ((=) (BadInput "gameName does not correspond to an existing game")) (fun () ->
            let target = "game?gameName=LaMarelle" in
            let request = Dream.request ~method_:`POST ~target "" in
            let* _ = handler request in
            Lwt.return ())
      );

    lwt_test "should fail if the user is already in a game" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        (* Given a user already in a game *)
        let current_game = Some Domain.CurrentGame.{
          id = "some-other-game-id";
          game_name = "ConnectSix";
          opponent = None;
          role = Creator;
        } in
        AuthTests.Mock.set DomainTests.a_minimal_user.id { DomainTests.a_user with current_game };

        (* When creating a game *)
        (* Then it should fail *)
        lwt_check_raises "failure" ((=) (BadInput "User is already in a game")) (fun () ->
            let target = "game?gameName=P4" in
            let request = Dream.request ~method_:`POST ~target "" in
            let* _ = handler request in
            Lwt.return ())
      );

    lwt_test "should create game, config room, and chat" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        (* Given a user already in a game *)
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;

        (* When creating a game *)
        let target = "game?gameName=P4" in
        let request = Dream.request ~method_:`POST ~target "" in
        let* result = handler request in

        (* Then it should succeed and create the game, config room, and chat *)
        check status "response status" `Created (Dream.status result);
        let expected = [
          FirestoreTests.CreateGame Domain.Game.(to_yojson (initial "P4" DomainTests.a_minimal_user));
          FirestoreTests.CreateConfigRoom ("game_id", Domain.ConfigRoom.(to_yojson (initial DomainTests.a_minimal_user)));
          FirestoreTests.CreateChat "game_id";
        ] in
        check (list FirestoreTests.call) "calls" expected !FirestoreTests.Mock.calls;
        Lwt.return ()
      );
  ];

  "Game.routes GET game/:game_id", [
    lwt_test "should retrieve the game" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;

        (* Given a game *)
        let game_id = "game_id" in
        let game = Domain.Game.initial "P4" DomainTests.a_minimal_user in
        FirestoreTests.Mock.Game.set game;

        (* When getting it *)
        let target = Printf.sprintf "game/%s" game_id in
        let request = Dream.request ~method_:`GET ~target "" in
        let* result = handler request in

        (* Then it should retrieve the game *)
        check status "response status" `OK (Dream.status result);
        let* body = Dream.body result in
        let game_from_body = Domain.Game.of_yojson (JSON.from_string body) in
        check game_eq "game" game (Result.get_ok game_from_body);
        Lwt.return ()
      );

    lwt_test "should retrieve the game name only if onlyGameName is passed" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;

        (* Given a game *)
        let game = Domain.Game.initial "P4" DomainTests.a_minimal_user in
        FirestoreTests.Mock.Game.set game;

        (* When getting it *)
        let target = "game/game_id?onlyGameName" in
        let request = Dream.request ~method_:`GET ~target "" in
        let* result = handler request in

        (* Then it should retrieve the game *)
        check status "response status" `OK (Dream.status result);
        let* body = Dream.body result in
        let expected = `Assoc [
            "gameName", `String "P4";
          ] in
        check json_eq "game" expected (JSON.from_string body);
        Lwt.return ()
      );
  ];

  "Game.routes DELETE game/:game_id", [
    lwt_test "should delete the game, config room, and chat" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;

        (* Given a game *)
        let game_id = "game_id" in
        let game = Domain.Game.initial "P4" DomainTests.a_minimal_user in
        FirestoreTests.Mock.Game.set game;

        (* When deleting it *)
        let target = Printf.sprintf "game/%s" game_id in
        let request = Dream.request ~method_:`DELETE ~target "" in
        let* result = handler request in

        (* Then it should delete the game, the config room, and the chat *)
        check status "response status" `OK (Dream.status result);
        let expected = [
          FirestoreTests.DeleteGame game_id;
          FirestoreTests.DeleteConfigRoom game_id;
          FirestoreTests.DeleteChat game_id;
        ] in
        check (list FirestoreTests.call) "calls" expected !FirestoreTests.Mock.calls;
        Lwt.return ()
      );
  ];

  "Game.routes POST game/:game-id", [
    lwt_test "should fail if no action is provided" (fun () ->
        (* Given a game *)
        let game_id = "game_id" in
        (* When making a POST request without action *)
        (* Then it should fail *)
        lwt_check_raises "failure" ((=) (BadInput "Missing action")) (fun () ->
            let target = Printf.sprintf "game/%s" game_id in
            let request = Dream.request ~method_:`POST ~target "" in
            let* _ = handler request in
            Lwt.return ())
      );

    lwt_test "should fail if an unknown action is provided" (fun () ->
        (* Given a game *)
        let game_id = "game_id" in
        (* When making a POST request without action *)
        (* Then it should fail *)
        lwt_check_raises "failure" ((=) (BadInput "Unknown action")) (fun () ->
            let target = Printf.sprintf "game/%s?action=doTheRoar" game_id in
            let request = Dream.request ~method_:`POST ~target "" in
            let* _ = handler request in
            Lwt.return ())
      );
  ];

  "Game.routes POST game/:game-id?action=resign", [
    lwt_test "should resign from the game" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;
        let now = 42 in
        ExternalTests.Mock.current_time := now;

        (* Given a game with an opponent *)
        let game_id = "game_id" in
        let game = {
          (Domain.Game.initial "P4" DomainTests.a_minimal_user) with
          player_one = Some DomainTests.another_minimal_user
        } in
        FirestoreTests.Mock.Game.set game;

        (* When resigning from it *)
        let target = Printf.sprintf "game/%s?action=resign" game_id in
        let request = Dream.request ~method_:`POST ~target "" in
        let* result = handler request in

        (* Then it should resign from the game *)
        check status "response status" `OK (Dream.status result);
        let winner = DomainTests.another_minimal_user in
        let loser = DomainTests.a_minimal_user in
        let end_game = Domain.Game.Updates.End.(to_yojson (get ~winner ~loser Domain.Game.GameResult.Resign (-1))) in
        let end_game_event = Domain.Game.Event.(to_yojson (Action (Action.end_game DomainTests.a_minimal_user (now * 1000)))) in
        let expected = [
          FirestoreTests.UpdateGame (game_id, end_game);
          FirestoreTests.AddEvent (game_id, end_game_event);
        ] in
        check (list FirestoreTests.call) "calls" expected !FirestoreTests.Mock.calls;
        Lwt.return ()
      );

    lwt_test "should fail when there is no opponent" (fun () ->
        FirestoreTests.Mock.clear_calls ();
        AuthTests.Mock.set DomainTests.a_minimal_user.id DomainTests.a_user;

        (* Given a game without an opponent *)
        let game_id = "game_id" in
        let game = Domain.Game.initial "P4" DomainTests.a_minimal_user in
        FirestoreTests.Mock.Game.set game;

        (* When resigning from it *)
        (* Then it should fail *)
        lwt_check_raises "failure" ((=) (BadInput "game has no opponent")) (fun () ->
            let target = Printf.sprintf "game/%s?action=resign" game_id in
            let request = Dream.request ~method_:`POST ~target "" in
            let* _ = handler request in
            Lwt.return ())
      );

  ];


]

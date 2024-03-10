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
  ];

]

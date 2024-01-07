(*open Alcotest
open TestUtils
open Backend
open Utils *)

(* module Auth = Auth.Make(Firebase_ops_tests.Mock)(Token_refresher_tests.Mock)(Google_certificates_tests.Mock)(Jwt_tests.Mock) *)

let tests = [
(*
  "Auth_tests.middleware", [
    lwt_test "should fail if there is no Authorization token" (fun () ->
        (* Given a request without Authorization token *)
        let request = Dream.request ~headers:[] "/" in
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let expected = Dream.response ~status:`Unauthorized "Authorization token is missing" in
        lwt_check_response "failure"  expected actual
      );

    lwt_test "should fail if the authorization header is invalid" (fun () ->
        (* Given a request with an invalid Authorization header *)
        let request = Dream.request ~headers:[("Authorization", "i'm missing the Bearer part")] "/" in
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let expected = Dream.response ~status:`Unauthorized "Authorization header is invalid" in
        lwt_check_response "failure" expected actual
      );

    lwt_test "should fail if the token is invalid" (fun () ->
        (* Given a request with an invalid Authorization token *)
        let request = Dream.request ~headers:[("Authorization", "Bearer foo")] "/" in
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let expected = Dream.response ~status:`Unauthorized "Authorization token is invalid" in
        lwt_check_response "failure" expected actual
      );


    lwt_test "should fail if the user has no account" (fun () ->
        (* Given a request with a valid Authorization token, but no corresponding user *)
        let request = Dream.request ~headers:[("Authorization", "Bearer " ^ Jwt_tests.identity_token_str)] "/" in
        Jwt_tests.Mock.validate_token := true;
        Firebase_ops_tests.Mock.user := None;
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let expected = Dream.response ~status:`Unauthorized "User does not exist" in
        lwt_check_response "failure" expected actual
      );

    lwt_test "should fail if the user has an unverified account" (fun () ->
        (* Given a request with a valid Authorization token for an user that is not verified *)
        let request = Dream.request ~headers:[("Authorization", "Bearer " ^ Jwt_tests.identity_token_str)] "/" in
        Jwt_tests.Mock.validate_token := true;
        Firebase_ops_tests.Mock.user := Some Firebase_ops_tests.unverified_user;
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let expected = Dream.response ~status:`Unauthorized "User is not verified" in
        lwt_check_response "failure" expected actual
      );

    lwt_test "should call the handler with the user bound if the request is well formed" (fun () ->
        (* Given a request with a valid Authorization token for an user that is verified *)
        let request = Dream.request ~headers:[("Authorization", "Bearer " ^ Jwt_tests.identity_token_str)] "/" in
        Jwt_tests.Mock.validate_token := true;
        Firebase_ops_tests.Mock.user := Some Firebase_ops_tests.verified_user;
        (* When it is received by the middleware *)
        (* Then it should succeed and bind the user in the handler *)
        let handler = Dream.router [ Dream.get "/" (fun request ->
            let (_uid, actual_user) : (string * Firebase.User.t) = Auth.get_user request in
            let expected_user : Firebase.User.t = Firebase_ops_tests.verified_user in
            check user "user" expected_user actual_user;
            Dream.html ~status:`Found "response from the handler") ] in
        let* actual = Auth.middleware handler request in
        let expected = Dream.response ~status:`Found "response from the handler" in
        lwt_check_response "success" expected actual
      );
  ];

  "Auth.get_user", [
    test "should fail if there is no middleware" (fun () ->
        check_raises "failure" (Error "Unexpected: no user stored. Is the Auth middleware missing?") (fun () ->
            let request = Dream.request "" in
            let _ = Auth.get_user request in
            ()
          )
      );
  ]; *)

]

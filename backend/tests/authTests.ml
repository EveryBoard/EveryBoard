open Alcotest
open TestUtils
open Backend
open Utils

module type MOCK = sig
  include Auth.AUTH

  val set : string -> Domain.User.t -> unit

end

module Mock : MOCK = struct

  let uid : string ref = ref ""
  let user : Domain.User.t option ref = ref None

  let set new_uid new_user =
    uid := new_uid;
    user := Some new_user

  let get_user _request = match !user with
    | Some user -> (!uid, user)
    | None -> failwith "No user set"

  let get_minimal_user _request =
    Domain.User.to_minimal_user !uid (Option.get !user)

  let middleware = fun handler request ->
    handler request

end

module Auth = Auth.Make(FirestoreTests.Mock)(GoogleCertificatesTests.Mock)(StatsTests.Mock)(JwtTests.Mock)

let tests = [
  "Auth.middleware", [
    lwt_test "should fail if there is no Authorization token" (fun () ->
        (* Given a request without Authorization token *)
        let request = Dream.request ~headers:[] "/" in
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let json_response = `Assoc [("reason", `String "Authorization token is missing")] in
        let expected = Dream.response ~status:`Unauthorized (JSON.to_string json_response) in
        lwt_check_response "failure"  expected actual
      );

    lwt_test "should fail if the authorization header is invalid" (fun () ->
        (* Given a request with an invalid Authorization header *)
        let request = Dream.request ~headers:[("Authorization", "i'm missing the Bearer part")] "/" in
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let json_response = `Assoc [("reason", `String "Authorization header is invalid")] in
        let expected = Dream.response ~status:`Unauthorized (JSON.to_string json_response) in
        lwt_check_response "failure" expected actual
      );

    lwt_test "should fail if the token is invalid" (fun () ->
        (* Given a request with an invalid Authorization token *)
        let request = Dream.request ~headers:[("Authorization", "Bearer foo")] "/" in
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let json_response = `Assoc [("reason", `String "Authorization token is invalid")] in
        let expected = Dream.response ~status:`Unauthorized (JSON.to_string json_response) in
        lwt_check_response "failure" expected actual
      );

    lwt_test "should fail if the user has no account" (fun () ->
        (* Given a request with a valid Authorization token, but no corresponding user *)
        let request = Dream.request ~headers:[("Authorization", "Bearer " ^ JwtTests.identity_token_str)] "/" in
        JwtTests.Mock.validate_token := true;
        FirestoreTests.Mock.user := None;
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let json_response = `Assoc [("reason", `String "User is invalid")] in
        let expected = Dream.response ~status:`Unauthorized (JSON.to_string json_response) in
        lwt_check_response "failure" expected actual
      );

    lwt_test "should fail if the user has an unverified account" (fun () ->
        (* Given a request with a valid Authorization token for an user that is not verified *)
        let request = Dream.request ~headers:[("Authorization", "Bearer " ^ JwtTests.identity_token_str)] "/" in
        JwtTests.Mock.validate_token := true;
        FirestoreTests.Mock.user := Some FirestoreTests.unverified_user;
        (* When it is received by the middleware *)
        let handler = Dream.router [ Dream.get "/" (fun _ -> Dream.empty `Found) ] in
        let* actual = Auth.middleware handler request in
        (* Then it should fail *)
        let json_response = `Assoc [("reason", `String "User is not verified")] in
        let expected = Dream.response ~status:`Unauthorized (JSON.to_string json_response) in
        lwt_check_response "failure" expected actual
      );

    lwt_test "should call the handler with the user bound if the request is well formed" (fun () ->
        (* Given a request with a valid Authorization token for an user that is verified *)
        let request = Dream.request ~headers:[("Authorization", "Bearer " ^ JwtTests.identity_token_str)] "/" in
        JwtTests.Mock.validate_token := true;
        FirestoreTests.Mock.user := Some FirestoreTests.verified_user;
        (* When it is received by the middleware *)
        (* Then it should succeed and bind the user in the handler *)
        let handler = Dream.router [ Dream.get "/" (fun request ->
            let (uid, actual_user) : (string * Domain.User.t) = Auth.get_user request in
            let minimal_user : Domain.MinimalUser.t = Auth.get_minimal_user request in
            let expected_user : Domain.User.t = FirestoreTests.verified_user in
            let expected_minimal_user : Domain.MinimalUser.t = FirestoreTests.verified_minimal_user in
            check user_eq "user" expected_user actual_user;
            check string "uid (user)" expected_minimal_user.id uid;
            check string "name" expected_minimal_user.name minimal_user.name;
            check string "uid (minimal user)" expected_minimal_user.id minimal_user.id;
            Dream.html ~status:`Found "response from the handler") ] in
        let* actual = Auth.middleware handler request in
        let expected = Dream.response ~status:`Found "response from the handler" in
        lwt_check_response "success" expected actual
      );
  ];

  "Auth.get_user", [
    test "should fail if there is no middleware" (fun () ->
        check_raises "failure" (UnexpectedError "No user stored. Is the Auth middleware missing?") (fun () ->
            let request = Dream.request "" in
            let _ = Auth.get_user request in
            ()
          )
      );
  ];

]

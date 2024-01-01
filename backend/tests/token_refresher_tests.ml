open Alcotest
open Test_utils
open Backend
open Utils

module Mock = struct

  (* To be overriden by the tests that need it *)
  let token_value = ref "token"

  let get_token (_ : Dream.request) : string Lwt.t =
    Lwt.return !token_value

  let middleware (_ : string) : Dream.middleware =
    fun handler -> handler
end

module Token_refresher = Token_refresher.Make(Jwt.Impl)

let access_token : Yojson.Basic.t = `Assoc [
    ("access_token", `String "some-access-token");
    ("expires_in", `Float 42.)
  ]

let access_token_str : string = Yojson.Basic.to_string access_token

let tests = [

  "Token_refresher.get_token", [
    lwt_test "should fail if the middleware is absent" (fun () ->
        lwt_check_raises "failure" (Error "get_token_field not set, the middleware is probably missing") (fun () ->
            let request = Dream.request "/" in
            let* _ = Token_refresher.get_token request in
            Lwt.return ()
          )
      );
  ];

  "Token_refresher.middleware", [
    test "should fail if there is no service account" (fun () ->
        check_raises "failure" (Error "does-not-exist.json: No such file or directory") (fun () ->
          let _ : Dream.middleware = Token_refresher.middleware "does-not-exist.json" in ()
          )
      );

    test "should fail if the the private key is invalid" (fun () ->
        check_raises "failure" (Error "Cannot read private key from service account file") (fun () ->
          let _ : Dream.middleware = Token_refresher.middleware "test-data/corrupted-service-account.json" in ()
          )
      );

    test "should create middleware if the service account exists" (fun () ->
        (* it should not throw *)
        let _ : Dream.middleware = Token_refresher.middleware "test-data/service-account.json" in ()
      );

    lwt_test "should request a token and bind it in the request" (fun () ->
        Mirage_crypto_rng_lwt.initialize ();
        (* Given a middleware *)
        let middleware : Dream.middleware = Token_refresher.middleware "test-data/service-account.json" in
        let body = access_token_str in
        with_mock External.Http.post_form (post_form_mock (Cohttp.Header.init ()) body) (fun mock ->
            (* When it receives a request *)
            (* Then it should bind the token in the request passed to the handler *)
            let request = Dream.request "/" in
            let handler = Dream.router [ Dream.get "/" (fun request ->
                let* actual = Token_refresher.get_token request in
                let expected = "some-access-token" in
                check string "success" expected actual;
                Dream.empty `Found) ] in
            let* _ = middleware handler request in
            check int "number of tokens requested" 1 !(mock.number_of_calls);
            Lwt.return ()
          )
      );

    lwt_test "should request a new token if the old one is outdated" (fun () ->
        Mirage_crypto_rng_lwt.initialize ();
        (* Given a middleware where a token has already been requested but is now expired *)
        with_mock External.now (fun () -> 0.) (fun _ ->
            let middleware : Dream.middleware = Token_refresher.middleware "test-data/service-account.json" in
            let body = access_token_str in (* expires in 42 seconds! *)
            with_mock External.Http.post_form (post_form_mock (Cohttp.Header.init ()) body) (fun mock ->
                let request = Dream.request "/" in
                let handler = Dream.router [ Dream.get "/" (fun request ->
                    let* actual = Token_refresher.get_token request in
                    let expected = "some-access-token" in
                    check string "success" expected actual;
                    Dream.empty `Found) ] in
                let* _ = middleware handler request in
                check int "number of tokens requested" 1 !(mock.number_of_calls);
                (* When handling a new request *)
                with_mock External.now (fun () -> 100.) (fun _ ->
                    let* _ = middleware handler request in
                    (* Then it should have requested a new token *)
                    check int "number of tokens requested" 2 !(mock.number_of_calls);
                    Lwt.return ()
                  )
              )
          )
      );

    lwt_test "should not request a new token if the old one is still valid" (fun () ->
        (* Given a middleware where a token has already been requested (and is not expired) *)
        with_mock External.now (fun () -> 0.) (fun _ ->
            let middleware : Dream.middleware = Token_refresher.middleware "test-data/service-account.json" in
            let body = access_token_str in (* expires in 42 seconds! *)
            with_mock External.Http.post_form (post_form_mock (Cohttp.Header.init ()) body) (fun mock ->
                let request = Dream.request "/" in
                let handler = Dream.router [ Dream.get "/" (fun request ->
                    let* actual = Token_refresher.get_token request in
                    let expected = "some-access-token" in
                    check string "success" expected actual;
                    Dream.empty `Found) ] in
                let* _ = middleware handler request in
                check int "number of tokens requested" 1 !(mock.number_of_calls);
                (* When handling a new request *)
                with_mock External.now (fun () -> 20.) (fun _ ->
                    let* _ = middleware handler request in
                    (* Then it should not have requested a new token *)
                    check int "number of tokens requested" 1 !(mock.number_of_calls);
                    Lwt.return ()
                  )
              )
          )
      );

  ];
]

open Alcotest
open Test_utils
open Backend

let tests = [
  "Firebase.User.from_json", [
    test "should work" (fun () ->
        (* Given a user JSON *)
        let user_str = "{\"verified\":true,\"currentGame\":null,\"username\":\"foo\", \"lastUpdateTime\": \"24 September 2023 at 11:02:56 UTC-4\"}" in
        let user_json = Yojson.Safe.from_string user_str in
        (* When converting it to a user *)
        let actual = Result.get_ok (Firebase.User.of_yojson user_json) in
        (* Then it should give the expected user *)
        let expected = Firebase.User.{
            username = Some "foo";
            last_update_time = Some "24 September 2023 at 11:02:56 UTC-4";
            verified = true;
            current_game = None;
          } in
        check user "success" expected actual
      );
    test "should work when user has no update time" (fun () ->
        (* Given a user JSON without last update time *)
        let user_str = "{\"verified\":true,\"currentGame\":null,\"username\":\"foo\"}" in
        let user_json = Yojson.Safe.from_string user_str in
        (* When converting it to a user *)
        let actual = Result.get_ok (Firebase.User.of_yojson user_json) in
        (* Then it should give the expected user *)
        let expected = Firebase.User.{
            username = Some "foo";
            last_update_time = None;
            verified = true;
            current_game = None;
          } in
        check user "success" expected actual
      );
  ];
  "Firebase.User.to_minimal_user", [
    test "should convert to minimal user" (fun () ->
        (* Given a user *)
        let user = Firebase.User.{
            username = Some "foo";
            last_update_time = Some "24 September 2023 at 11:02:56 UTC-4";
            verified = true;
            current_game = None;
          } in
        (* When converting it to a minimal user *)
        let actual = Firebase.User.to_minimal_user "some-id" user in
        (* Then it should keep its name and add the uid *)
        let expected = Firebase.Minimal_user.{
            id = "some-id";
            name = "foo";
          } in
        check minimal_user "success" expected actual
      );
  ];

]

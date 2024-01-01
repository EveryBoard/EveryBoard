open Alcotest
open Backend
open Utils
open Test_utils

module type MOCK = sig
  include Firebase_ops.FIREBASE_OPS
  val user : Firebase.User.t option ref
end

module Mock : MOCK = struct

  let user : Firebase.User.t option ref = ref None

  let get_user _  _ : Firebase.User.t option Lwt.t =
    Lwt.return !user

  let create_game _ _ _ = failwith "TODO"

  let create_config_room _ _ _ = failwith "TODO"

  let create_chat _ _ = failwith "TODO"

end

let unverified_user : Firebase.User.t = {
  username = Some "foo";
  last_update_time = None;
  verified = false;
  current_game = None;
}

let verified_user : Firebase.User.t = {
  username = Some "foo";
  last_update_time = None;
  verified = true;
  current_game = None;
}

module Firebase_ops = Firebase_ops.Make(Firebase_primitives_tests.Mock)

let tests = [
  "Firebase_ops.get_user", [
    lwt_test "should retrieve user" (fun () ->
        (* Given a user *)
        Firebase_primitives_tests.Mock.doc_to_return := Some (Firebase.User.to_yojson verified_user);
        (* When getting it with get_user *)
        let* actual = Firebase_ops.get_user "access-token" "uid" in
        (* Then it should be retrieved *)
        let expected = Some verified_user in
        check (option user) "success" expected actual;
        Lwt.return ()
    );

    lwt_test "should retrieve nothing if user does not exist" (fun () ->
        (* Given that no user exist *)
        Firebase_primitives_tests.Mock.doc_to_return := None;
        (* When trying to get a user with get_user *)
        let* actual = Firebase_ops.get_user "access-token" "uid" in
        (* Then it should not retrieve anything *)
        let expected = None in
        check (option user) "failure" expected actual;
        Lwt.return ()
      )
  ]
]

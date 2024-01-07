(* open Alcotest *)
open Backend
(* open Utils *)
(* open TestUtils *)

module type MOCK = sig
  include Firestore.FIRESTORE

  val user : Domain.User.t option ref
end

module Mock : MOCK = struct

  let transaction _ _ = failwith "TODO"

  let user : Domain.User.t option ref = ref None
  module User = struct

    let get _  _ =
      Lwt.return (Option.map Domain.User.to_yojson !user)
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
    let accept _ _ = failwith "TODO"
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

(* module Firebase_ops = Firebase_ops.Make(Firebase_primitives_tests.Mock) *)

let tests = [
(*
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
  ]; *)
]

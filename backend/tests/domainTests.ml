open Alcotest
open TestUtils
open Backend
open Utils
open Domain

module type JSONable = sig
  type t
  val of_yojson : JSON.t -> (t, string) result
  val to_yojson : t -> JSON.t
end

let test_json_conversion (type t) (module M : JSONable with type t = t) (value : t) (json_value : JSON.t) =
  let eq : t testable =
    let pp ppf game = Fmt.pf ppf "%s" (JSON.to_string (M.to_yojson game)) in
    testable pp (=) in
  check json_eq "to JSON" json_value (M.to_yojson value);
  check eq "from JSON" value (Result.get_ok (M.of_yojson json_value))

let a_minimal_user : MinimalUser.t =
  { id = "uid"; name = "JeanJJ" }

let a_minimal_user_json : JSON.t =
  `Assoc [("id", `String a_minimal_user.id); ("name", `String a_minimal_user.name)]

let another_minimal_user : MinimalUser.t =
  { id = "uid"; name = "Jeanne Jaja" }

let another_minimal_user_json : JSON.t =
  `Assoc [("id", `String another_minimal_user.id); ("name", `String another_minimal_user.name)]

let tests = [

  "Domain.CurrentGame JSON conversion", [
    test "should convert to and from JSON when there is no opponent" (fun () ->
        (* Given a current game without opponent *)
        let current_game = CurrentGame.{
            id = "game-id";
            game_name = "P4";
            opponent = None;
            role = Player;
          } in
        let current_game_json = `Assoc [
            "id", `String "game-id";
            "typeGame", `String "P4";
            "opponent", `Null;
            "role", `String "Player";
          ] in
        (* When converting it to/from JSON *)
        (* Then it should work *)
        test_json_conversion (module CurrentGame) current_game current_game_json
      );

    test "should convert to and from JSON when there is an opponent" (fun () ->
        (* Given a current game without opponent *)
        let current_game = CurrentGame.{
            id = "game-id";
            game_name = "P4";
            opponent = Some a_minimal_user;
            role = Player;
          } in
        let current_game_json = `Assoc [
            "id", `String "game-id";
            "typeGame", `String "P4";
            "opponent", a_minimal_user_json;
            "role", `String "Player";
          ] in
        (* When converting it to/from JSON *)
        (* Then it should work *)
        test_json_conversion (module CurrentGame) current_game current_game_json
      );
  ];

  "Domain.User JSON conversion", [

    test "should work" (fun () ->
        (* Given a user *)
        let user = User.{
            username = Some "foo";
            last_update_time = Some "24 September 2023 at 11:02:56 UTC-4";
            verified = true;
            current_game = None;
          } in
        let user_json = `Assoc [
            "username", `String "foo";
            "lastUpdateTime", `String "24 September 2023 at 11:02:56 UTC-4";
            "verified", `Bool true;
            "currentGame", `Null;
          ] in
        (* When converting it to and from JSON *)
        (* Then it should work *)
        test_json_conversion (module User) user user_json
      );

    test "should work when user has no update time" (fun () ->
        (* Given a user JSON without last update time *)
        let user_json = `Assoc [
            "verified", `Bool true;
            "currentGame", `Null;
            "username", `String "foo";
          ] in
        (* When converting it to a user *)
        let actual = Result.get_ok (User.of_yojson user_json) in
        (* Then it should give the expected user *)
        (* (we can't rely on test_json_conversion here as it would include last update time in one way) *)
        let expected = User.{
            username = Some "foo";
            last_update_time = None;
            verified = true;
            current_game = None;
          } in
        check user_eq "success" expected actual
      );

    test "should work when user has a current game" (fun () ->
        (* Given a user JSON with current game *)
        let user_json = `Assoc [
            "verified", `Bool true;
            "username", `String "foo";
            "currentGame", `Assoc [
              "id", `String "game-id";
              "typeGame", `String "P4";
              "opponent", `Null;
              "role", `String "Player";
            ]
          ] in
        (* When converting it to a user *)
        let actual = Result.get_ok (User.of_yojson user_json) in
        (* Then it should give the expected user with a current game *)
        let expected = User.{
            username = Some "foo";
            last_update_time = None;
            verified = true;
            current_game = Some (CurrentGame.{
                id = "game-id";
                game_name = "P4";
                opponent = None;
                role = Player;
              })
          } in
        check user_eq "success" expected actual
      );

  ];

  "Domain.User.to_minimal_user", [
    test "should convert to minimal user" (fun () ->
        (* Given a user *)
        let user = User.{
            username = Some "foo";
            last_update_time = Some "24 September 2023 at 11:02:56 UTC-4";
            verified = true;
            current_game = None;
          } in
        (* When converting it to a minimal user *)
        let actual = User.to_minimal_user "some-id" user in
        (* Then it should keep its name and add the uid *)
        let expected = MinimalUser.{
            id = "some-id";
            name = "foo";
          } in
        check minimal_user_eq "success" expected actual
      );
  ];

  "Domain.ConfigRoom JSON conversion", [
    test "should work with initial config room" (fun () ->
        (* Given the initial config room *)
        let config_room = ConfigRoom.initial a_minimal_user in
        let config_room_json = `Assoc [
            "creator", a_minimal_user_json;
            "chosenOpponent", `Null;
            "partStatus", `Int 0;
            "firstPlayer", `String "RANDOM";
            "partType", `String "STANDARD";
            "maximalMoveDuration", `Int (2*60);
            "totalPartDuration", `Int (30*60);
            "rulesConfig", `Assoc [];
          ] in
        (* When converting it to and from JSON *)
        (* Then it should work *)
        test_json_conversion (module ConfigRoom) config_room config_room_json
      );

    test "should work with a config room that has a chosen opponent" (fun () ->
        (* Given a config room with a chosen opponent *)
        let config_room = { (ConfigRoom.initial a_minimal_user) with chosen_opponent = Some another_minimal_user } in
        let config_room_json = `Assoc [
            "creator", a_minimal_user_json;
            "chosenOpponent", another_minimal_user_json;
            "partStatus", `Int 0;
            "firstPlayer", `String "RANDOM";
            "partType", `String "STANDARD";
            "maximalMoveDuration", `Int (2*60);
            "totalPartDuration", `Int (30*60);
            "rulesConfig", `Assoc [];
          ] in
        (* When converting it to and from JSON *)
        (* Then it should work *)
        test_json_conversion (module ConfigRoom) config_room config_room_json
      );
  ];

  "Domain.ConfigRoom.rematch", [
    test "should change expected fields" (fun () ->
        (* Given a config room *)
        let config_room = { (ConfigRoom.initial a_minimal_user) with chosen_opponent = Some another_minimal_user } in
        (* When creating the rematch config room *)
        let first_player = ConfigRoom.FirstPlayer.Creator in
        let creator = another_minimal_user in
        let chosen_opponent = a_minimal_user in
        let actual = ConfigRoom.rematch config_room first_player creator chosen_opponent in
        (* Then it should have updated game status, first player, creator, and chosen opponent *)
        let expected = {
          (ConfigRoom.initial a_minimal_user) with
          first_player;
          game_status = ConfigRoom.GameStatus.Started;
          creator;
          chosen_opponent = Some chosen_opponent;
        } in
        check config_room_eq "success" expected actual
      );
  ];
]

open Utils

let endpoint ?(version = "v1beta1") ?(params = []) ?(last_separator = "/") (path : string) : Uri.t =
  let url = Uri.of_string (!Options.base_endpoint ^ "/" ^ version ^
                           "/projects/" ^ !Options.project_name ^
                           "/databases/" ^ !Options.database_name ^
                           "/documents" ^ last_separator ^ path) in
  Uri.with_query' url params

module Role = struct
  type t = string
  [@@deriving yojson]
end

module Minimal_user = struct
  type t = {
    id: string;
    name: string;
  }
  [@@deriving yojson]
end

module Current_game = struct
  type t = {
    id: string;
    game_name: string [@key "typeGame"];
    opponent: Minimal_user.t option;
    role: Role.t;
  }
  [@@deriving yojson]
end

module User = struct
  type t = {
    username: string option;
    last_update_time: string option [@default None] [@key "lastUpdateTime"];
    verified: bool;
    current_game: Current_game.t option [@key "currentGame"];
  }
  [@@deriving yojson]

  let to_minimal_user (uid : string) (user : t) : Minimal_user.t =
    { id = uid; name = Option.get user.username }
end

module Config_room = struct
  module Game_status = struct
    type t = int
    [@@deriving yojson]

    let game_created: t = 0
    let config_proposed: t = 2
    let game_started: t = 3
    let game_finished: t = 4
  end

  module First_player = struct
    type t = string
    [@@deriving yojson]

    let random: t = "RANDOM"
  end

  module Game_type = struct
    type t = string
    [@@deriving yojson]

    let standard: t = "RANDOM"
    let standard_move_duration = 2*60
    let standard_game_duration = 30*60

  end

  type t = {
    creator: Minimal_user.t;
    chosen_opponent: Minimal_user.t option [@key "chosenOpponent"];
    part_status: Game_status.t [@key "partStatus"];
    first_player: First_player.t [@key "firstPlayer"];
    part_type: Game_type.t [@key "partType"];
    maximal_move_duration: int [@key "maximalMoveDuration"];
    total_part_duration: int [@key "totalPartDuration"];
    rules_config: JSON.t option [@key "rulesConfig"]; (* TODO: adapt TS code to support empty rules and use default then *)
  }
  [@@deriving yojson]

  let initial (creator : Minimal_user.t) : t = {
    creator;
    first_player = First_player.random;
    chosen_opponent = None;
    part_status = Game_status.game_created;
    part_type = Game_type.standard;
    maximal_move_duration = Game_type.standard_move_duration;
    total_part_duration = Game_type.standard_game_duration;
    rules_config = None;
  }

end

module Game = struct
  module Game_result = struct
    type t = int
    [@@deriving yojson]

    let hard_draw = 0
    let resign = 1
    let escape = 2
    let victory = 3
    let timeout = 4
    let unachieved = 5
    let agreed_draw_by_zero = 6
    let agreed_draw_by_one = 7
  end

  module Updates = struct
    module Starting = struct
      type t = {
        player_zero: Minimal_user.t [@key "playerZero"];
        player_one: Minimal_user.t [@key "playerOne"];
        turn: int;
        beginning: float option;
      }
      [@@deriving yojson]

      let get (config_room : Config_room.t) : t =
        let starter = match config_room.first_player with
          | "RANDOM" -> if Random.bool () then "CREATOR" else "CHOSEN_PLAYER"
          | first -> first in
        let (player_zero, player_one) =
          if starter = "CREATOR"
          then (config_room.creator, Option.get config_room.chosen_opponent)
          else (Option.get config_room.chosen_opponent, config_room.creator)
        in
        {
          player_zero;
          player_one;
          turn = 0;
          beginning = Some (!External.now ())
        }
    end
    module Finishing = struct
      type t = {
        winner: Minimal_user.t option;
        loser: Minimal_user.t option;
        result: Game_result.t;
      }
      [@@deriving yojson]

      let get (winner : Minimal_user.t) (loser : Minimal_user.t) (result : Game_result.t) : t =
        { winner = Some winner; loser = Some loser; result }
    end
  end

  type t = {
    type_game: string [@key "typeGame"];
    player_zero: Minimal_user.t [@key "playerZero"];
    turn: int;
    result: Game_result.t;

    player_one: Minimal_user.t option [@key "playerOne"];
    beginning: float option;
    winner: Minimal_user.t option;
    loser: Minimal_user.t option;
    score_player_zero: int option [@key "scorePlayerZero"];
    score_player_one: int option [@key "scorePlayerOne"];
  }
  [@@deriving yojson]

  let initial (game_name : string) (creator : Minimal_user.t) : t = {
    type_game = game_name;
    player_zero = creator;
    turn = -1;
    result = Game_result.unachieved;
    player_one = None;
    beginning = None;
    winner = None;
    loser = None;
    score_player_zero = None;
    score_player_one = None;
  }

  module Event = struct
    module Request = struct
      type t = {
        eventType: string;
        time: float;
        player: int;
        requestType: string;
      }
      [@@deriving yojson]
    end

    module Reply = struct
      type t = {
        eventType: string;
        time: float;
        player: int;
        reply: string;
        requestType: string;
        data: JSON.t option;
      }
      [@@deriving yojson]
    end

    module Action = struct
      type t = {
        eventType: string;
        time: float;
        player: int;
        action: string;
      }
      [@@deriving yojson]

      let add_turn_time player =
        let time = !External.now () in
        { eventType = "Action"; action = "AddTurnTime"; player; time }
      let add_global_time player =
        let time = !External.now () in
        { eventType = "Action"; action = "AddGlobalTime"; player; time }
      let start_game player =
        let time = !External.now () in
        { eventType = "Action"; action = "StartGame"; player; time }
      let end_game player =
        let time = !External.now () in
        { eventType = "Action"; action = "EndGame"; player; time }
    end

    module Move = struct
      type t = {
        eventType: string;
        move: JSON.t;
      }
      [@@deriving yojson]

      let of_move (move : JSON.t) : t = { eventType = "Move"; move }
    end

    type t =
      | Request of Request.t
      | Reply of Reply.t
      | Action of Action.t
      | Move of Move.t

    let to_yojson (event : t) : JSON.t = match event with
      | Request request -> Request.to_yojson request
      | Reply reply -> Reply.to_yojson reply
      | Action action -> Action.to_yojson action
      | Move move -> Move.to_yojson move

    let of_yojson (json : JSON.t) : (t, string) result =
      match JSON.Util.(to_string (member "eventType" json)) with
      | "Request" -> Result.map (fun x -> Request x) (Request.of_yojson json)
      | "Reply" -> Result.map (fun x -> Reply x) (Reply.of_yojson json)
      | "Action" -> Result.map (fun x -> Action x) (Action.of_yojson json)
      | "Move" -> Result.map (fun x -> Move x) (Move.of_yojson json)
      | unknown -> Error ("unknown event type: " ^ unknown)
  end

end



let header (access_token : string) : string * string =
  ("Authorization", "Bearer " ^ access_token)

let rec of_firestore (json : JSON.t) : JSON.t =
  let extract_field ((key, value) : (string * JSON.t)) : (string * JSON.t) = (key, match value with
    | `Assoc [("mapValue", v)] -> of_firestore v
    | `Assoc [(_, v)] -> v (* We just rely on the real type contained, not on the type name from firestore *)
    | _-> raise (Error ("Invalid firestore JSON: unexpected value when extracting field: " ^ (JSON.to_string value)))) in
  match JSON.Util.member "fields" json with
  | `Assoc fields -> `Assoc (List.map extract_field fields)
  | _ -> raise (Error ("Invalid firestore JSON: not an object: " ^ (JSON.to_string json)))

let to_firestore ?(path : string option) (doc : JSON.t) : JSON.t  =
  (* Types of values are documented here: https://cloud.google.com/firestore/docs/reference/rest/Shared.Types/ArrayValue#Value *)
  let rec transform_field (v : JSON.t) : JSON.t = match v with
      | `String v -> `Assoc [("stringValue", `String v)]
      | `Bool v -> `Assoc [("boolValue", `Bool v)]
      | `Intlit v -> `Assoc [("integerValue", `String v)]
      | `Null -> `Assoc [("nullValue", `Null)]
      | `Assoc fields -> `Assoc [("mapValue", `Assoc [("fields", `Assoc (List.map transform_key_and_field fields))])]
      | `List v -> `Assoc [("arrayValue", `Assoc [("values", `List (List.map transform_field v))])]
      | `Float v -> `Assoc [("doubleValue", `Float v)]
      | `Int v -> `Assoc [("integerValue", `String (string_of_int v))]
      | _ -> raise (Error ("Invalid object for firestore: unsupported field: " ^ (JSON.to_string v)))
  and transform_key_and_field (key, field) : (string * JSON.t) = (key, transform_field field) in
  let doc_with_fields : JSON.t = match doc with
    | `Assoc fields -> `Assoc (List.map transform_key_and_field fields)
    | _ -> raise (Error "Invalid object for firestore") in
  let name = match path with
    | Some p -> [("name", `String ("projects/" ^ !Options.project_name ^ "/databases/" ^ !Options.database_name ^ "/documents/" ^ p))]
    | None -> [] in
  `Assoc (name @ [("fields", doc_with_fields)])

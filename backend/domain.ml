open Utils

module Role = struct
  type t = string
  [@@deriving yojson]
end

module MinimalUser = struct
  type t = {
    id: string;
    name: string;
  }
  [@@deriving yojson]
end

module CurrentGame = struct
  type t = {
    id: string;
    game_name: string [@key "typeGame"];
    opponent: MinimalUser.t option;
    role: Role.t;
  }
  [@@deriving yojson]
end

module User = struct
  type t = {
    username: string option;
    last_update_time: string option [@default None] [@key "lastUpdateTime"];
    verified: bool;
    current_game: CurrentGame.t option [@key "currentGame"];
  }
  [@@deriving yojson]

  let to_minimal_user (uid : string) (user : t) : MinimalUser.t =
    { id = uid; name = Option.get user.username }
end

module ConfigRoom = struct
  module GameStatus = struct
    type t = int
    [@@deriving yojson]

    let created: t = 0
    let config_proposed: t = 2
    let started: t = 3
    let finished: t = 4
  end

  module FirstPlayer = struct
    type t = string
    [@@deriving yojson]

    let random: t = "RANDOM"
    let chosen_player : t = "CHOSEN_PLAYER"
    let creator : t = "CREATOR"
  end

  module GameType = struct
    type t = string
    [@@deriving yojson]

    let standard: t = "RANDOM"
    let standard_move_duration = 2*60
    let standard_game_duration = 30*60

  end

  type t = {
    creator: MinimalUser.t;
    chosen_opponent: MinimalUser.t option [@key "chosenOpponent"];
    game_status: GameStatus.t [@key "partStatus"];
    first_player: FirstPlayer.t [@key "firstPlayer"];
    game_type: GameType.t [@key "partType"];
    maximal_move_duration: int [@key "maximalMoveDuration"];
    total_part_duration: int [@key "totalPartDuration"];
    rules_config: JSON.t option [@key "rulesConfig"]; (* TODO: adapt TS code to support empty rules and use default then *)
  }
  [@@deriving yojson]

  let initial (creator : MinimalUser.t) : t = {
    creator;
    first_player = FirstPlayer.random;
    chosen_opponent = None;
    game_status = GameStatus.created;
    game_type = GameType.standard;
    maximal_move_duration = GameType.standard_move_duration;
    total_part_duration = GameType.standard_game_duration;
    rules_config = None;
  }

  let rematch (config_room : t) (first_player : FirstPlayer.t) (creator : MinimalUser.t) (chosen_opponent : MinimalUser.t) : t =
    let game_status = GameStatus.started in
    { config_room with game_status; first_player; creator; chosen_opponent = Some chosen_opponent }

end

module Game = struct
  module GameResult = struct
    type t = int
    [@@deriving yojson]

    let hard_draw = 0
    let resign = 1
    let victory = 3
    let timeout = 4
    let unachieved = 5
    let agreed_draw_by (player : int) =
      if player = 0 then 6 else 7
  end

  module Updates = struct
    module Start = struct
      type t = {
        player_zero: MinimalUser.t [@key "playerZero"];
        player_one: MinimalUser.t [@key "playerOne"];
        turn: int;
        beginning: float option;
      }
      [@@deriving yojson]

      let get (config_room : ConfigRoom.t) : t =
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

    module End = struct
      type t = {
        winner: MinimalUser.t option;
        loser: MinimalUser.t option;
        result: GameResult.t;
        score_player_zero: int option [@key "scorePlayerZero"];
        score_player_one: int option [@key "scorePlayerZero"];
      }
      [@@deriving yojson]

      let get ?(winner : MinimalUser.t option) ?(loser : MinimalUser.t option) ?(scores : (int * int) option) (result : GameResult.t) : t =
        let (score_player_zero, score_player_one) = match scores with
          | None -> (None, None)
          | Some (score0, score1) -> (Some score0, Some score1) in
        { winner; loser; result; score_player_zero; score_player_one }
    end

    module TakeBack = struct
      type t = {
        turn: int;
      }
      [@@deriving yojson]

      let get (turn : int) : t =
        { turn }
    end

    module EndTurn = struct
      type t = {
        turn: int;
        score_player_zero: int option [@key "scorePlayerZero"];
        score_player_one: int option [@key "scorePlayerOne"];
      }
      [@@deriving yojson]

      let get ?(scores : (int * int) option) (turn : int) : t =
        let new_turn = turn+1 in
        let (score_player_zero, score_player_one) = match scores with
        | Some (score0, score1) -> (Some score0, Some score1)
        | None -> (None, None) in
        { turn = new_turn; score_player_zero; score_player_one }
    end
  end

  type t = {
    type_game: string [@key "typeGame"];
    player_zero: MinimalUser.t [@key "playerZero"];
    turn: int;
    result: GameResult.t;

    player_one: MinimalUser.t option [@key "playerOne"];
    beginning: float option;
    winner: MinimalUser.t option;
    loser: MinimalUser.t option;
    score_player_zero: int option [@key "scorePlayerZero"];
    score_player_one: int option [@key "scorePlayerOne"];
  }
  [@@deriving yojson]

  let initial (game_name : string) (creator : MinimalUser.t) : t = {
    type_game = game_name;
    player_zero = creator;
    turn = -1;
    result = GameResult.unachieved;
    player_one = None;
    beginning = None;
    winner = None;
    loser = None;
    score_player_zero = None;
    score_player_one = None;
  }

  let rematch (game_name : string) (config_room : ConfigRoom.t) : t =
    let starting = Updates.Start.get config_room in
    let initial_game = initial game_name config_room.creator in
    { initial_game with
      player_zero = starting.player_zero;
      player_one = Some starting.player_one;
      turn = starting.turn;
      beginning = starting.beginning }

  module Event = struct
    module Request = struct
      type t = {
        event_type: string [@key "eventType"];
        time: float;
        user: MinimalUser.t;
        request_type: string [@key "requestType"];
      }
      [@@deriving yojson]

      let make (user : MinimalUser.t) (request_type : string) : t =
        let time = !External.now () in
        { event_type = "Request"; time; user; request_type }
      let draw (user : MinimalUser.t) : t =
        make user "Draw"
      let rematch (user : MinimalUser.t) : t =
        make user "Rematch"
      let take_back (user : MinimalUser.t) : t =
        make user "TakeBack"
    end

    module Reply = struct
      type t = {
        event_type: string [@key "eventType"];
        time: float;
        user: MinimalUser.t;
        reply: string;
        request_type: string [@key "requestType"];
        data: JSON.t option;
      }
      [@@deriving yojson]

      let make ?(data : JSON.t option) (user : MinimalUser.t) (reply : string) (request_type : string) : t =
        let time = !External.now () in
        { event_type = "Reply"; time; user; reply; request_type; data }
      let accept (user : MinimalUser.t) (proposition : string) : t =
        make user "Accept" proposition
      let refuse (user : MinimalUser.t) (proposition : string) : t =
        make user "Reject" proposition
    end

    module Action = struct
      type t = {
        event_type: string [@key "eventType"];
        time: float;
        user: MinimalUser.t;
        action: string;
      }
      [@@deriving yojson]

      let add_time (user : MinimalUser.t) (kind : [ `Turn | `Global ]) : t =
        let time = !External.now () in
        let action = match kind with
          | `Turn -> "AddTurnTime"
          | `Global -> "AddGlobalTime" in
        { event_type = "Action"; action; user; time }
      let start_game (user : MinimalUser.t) : t =
        let time = !External.now () in
        { event_type = "Action"; action = "StartGame"; user; time }
      let end_game (user : MinimalUser.t) : t =
        let time = !External.now () in
        { event_type = "Action"; action = "EndGame"; user; time }
    end

    module Move = struct
      type t = {
        event_type: string [@key "eventType"];
        user: MinimalUser.t;
        move: JSON.t;
      }
      [@@deriving yojson]

      let of_json (user : MinimalUser.t) (move : JSON.t) : t = { event_type = "Move"; user; move }
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

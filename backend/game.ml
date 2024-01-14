open Utils

let ( >>= ) = Result.bind

let games_list = ["P4"] (* TODO: fill in with the rest, or extract automatically *)

module type GAME = sig
  val routes : Dream.route list
end

module Make
    (External : External.EXTERNAL)
    (Auth : Auth.AUTH)
    (Firestore : Firestore.FIRESTORE)
    (Stats : Stats.STATS)
    : GAME = struct

  let create : Dream.route = Dream.post "game" @@ fun request ->
    Stats.set_action request "CREATE game";
    (* Does the game name correspond to a game we have? *)
    match Dream.query request "gameName" with
    | None ->
      fail `Bad_Request "Missing gameName in query"
    | Some game_name when List.mem game_name games_list = false ->
      fail `Bad_Request "gameName does not correspond to an existing game"
    | Some game_name ->
      (* Is the user allowed to create a game? That is, the user should not have a current game *)
      let (uid, user) = Auth.get_user request in
      match user.current_game with
      | Some _ -> Dream.respond ~status:`Bad_Request "User is already in a game"
      | None ->
        let creator = Domain.User.to_minimal_user uid user in
        (* Create the game, then the config room, then the chat room *)
        let game = Domain.Game.initial game_name creator in
        let* game_id = Firestore.Game.create request game in
        Stats.set_game_id request game_id;
        let config_room = Domain.ConfigRoom.initial creator in
        let* _ = Firestore.ConfigRoom.create request game_id config_room in
        let* _ = Firestore.Chat.create request game_id in
        json_response `Created (`Assoc [("id", `String game_id)])

  let get : Dream.route = Dream.get "game/:game_id" @@ fun request ->
    let game_id = Dream.param request "game_id" in
    Stats.set_action request "GET game";
    Stats.set_game_id request game_id;
    match Dream.query request "onlyGameName" with
    | None ->
      let* game = Firestore.Game.get request game_id in
      json_response `OK (Domain.Game.to_yojson game)
    | Some _ ->
      try
        let* name = Firestore.Game.get_name request game_id in
        json_response `OK (`Assoc [("gameName", `String name)])
      with Error _ -> fail `Not_Found "There is no game with this id"

  let delete : Dream.route = Dream.delete "game/:game_id" @@ fun request ->
    let game_id = Dream.param request "game_id" in
    Stats.set_action request "DELETE game";
    Stats.set_game_id request game_id;
    let* _ = Firestore.Game.delete request game_id in
    Dream.empty `OK

  let accept_config (request : Dream.request) (game_id : string) =
    try
      let* config_room = Firestore.ConfigRoom.get request game_id in
      let* _ = Firestore.ConfigRoom.accept request game_id in
      let now = External.now () in
      let starting_config = Domain.Game.Updates.Start.get config_room now in
      let accepter = Auth.get_minimal_user request in
      let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.Start.to_yojson starting_config) in
      let event = Domain.Game.Event.(Action (Action.start_game accepter now)) in
      let* _ = Firestore.Game.add_event request game_id event in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)
    with Error _ -> fail_transaction `Not_Found "Game does not exist"

  let resign (request : Dream.request) (game_id : string) =
    try
      let* game = Firestore.Game.get request game_id in
      let minimal_user = Auth.get_minimal_user request in
      let player_zero = game.player_zero in
      let player_one = Option.get game.player_one in
      let winner = if minimal_user = game.player_zero then player_one else player_zero in
      let loser = minimal_user in
      let update = Domain.Game.Updates.End.get ~winner ~loser Domain.Game.GameResult.Resign in
      let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.End.to_yojson update) in
      let resigner = Auth.get_minimal_user request in
      let now = External.now () in
      let event = Domain.Game.Event.(Action (Action.end_game resigner now)) in
      let* _ = Firestore.Game.add_event request game_id event in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)
    with Error _ -> fail_transaction `Not_Found "Game not found"

  let notify_timeout (request : Dream.request) (game_id : string) (winner : Domain.MinimalUser.t) (loser : Domain.MinimalUser.t) =
    (* TODO: don't trust the client, we need to get winner and loser ourselves *)
    let update = Domain.Game.Updates.End.get ~winner ~loser Domain.Game.GameResult.Timeout in
    let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.End.to_yojson update) in
    let requester = Auth.get_minimal_user request in
    let now = External.now () in
    let event = Domain.Game.Event.(Action (Action.end_game requester now)) in
    let* _ = Firestore.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let propose (request : Dream.request) (game_id : string) (proposition : string) =
    let user = Auth.get_minimal_user request in
    let now = External.now () in
    let event = Domain.Game.Event.(Request (Request.make user proposition now)) in
    let* _ = Firestore.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let reject (request : Dream.request) (game_id : string) (proposition : string) =
    let user = Auth.get_minimal_user request in
    let now = External.now () in
    let event = Domain.Game.Event.(Reply (Reply.refuse user proposition now)) in
    let* _ = Firestore.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let accept_draw (request : Dream.request) (game_id : string) =
    try
      let* game = Firestore.Game.get request game_id in
      let user = Auth.get_minimal_user request in
      let now = External.now () in
      let accept = Domain.Game.Event.(Reply (Reply.accept user "Draw" now)) in
      let* _ = Firestore.Game.add_event request game_id accept in
      let player = if user = game.player_zero then Domain.Player.Zero else Domain.Player.One in
      let update = Domain.Game.Updates.End.get (Domain.Game.GameResult.AgreedDrawBy player) in
      let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.End.to_yojson update) in
      let game_end = Domain.Game.Event.(Action (Action.end_game user now)) in
      let* _ = Firestore.Game.add_event request game_id game_end in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)
    with Error _ -> fail_transaction `Not_Found "Game not found"

  let accept_rematch (request : Dream.request) (game_id : string) =
    try
      let* game = Firestore.Game.get request game_id in
      let* config_room = Firestore.ConfigRoom.get request game_id in
      (* The user accepting the rematch becomes the creator *)
      let creator = Auth.get_minimal_user request in
      let (chosen_opponent, first_player) =
        if game.player_zero = creator
        then (Option.get game.player_one, Domain.ConfigRoom.FirstPlayer.ChosenPlayer)
        else (game.player_zero, Domain.ConfigRoom.FirstPlayer.Creator) in
      let rematch_config_room =
        Domain.ConfigRoom.rematch config_room first_player creator chosen_opponent in
      let now = External.now () in
      let rematch_game = Domain.Game.rematch game.type_game rematch_config_room now in
      let* rematch_id = Firestore.Game.create request rematch_game in
      let user = Auth.get_minimal_user request in
      let* _ = Firestore.ConfigRoom.create request rematch_id config_room in
      let* _ = Firestore.Chat.create request rematch_id in
      let accept_event = Domain.Game.Event.(Reply (Reply.accept user "Rematch" now)) in
      let* _ = Firestore.Game.add_event request game_id accept_event in
      let start_event = Domain.Game.Event.(Action (Action.start_game user now)) in
      let* _ = Firestore.Game.add_event request game_id start_event in
      let* response = json_response `Created (`Assoc [("id", `String game_id)]) in
      Lwt.return (Ok response)
    with Error _ -> fail_transaction `Not_Found "Game not found"

  let accept_take_back (request : Dream.request) (game_id : string) =
    try
      let* game = Firestore.Game.get request game_id in
      let user = Auth.get_minimal_user request in
      let player_value = if game.player_zero = user then 0 else 1 in
      let new_turn =
        if game.turn mod 2 == player_value
        then game.turn - 2 (* Need to take back two turns to let the requester take back their move *)
        else game.turn -1 in
      let now = External.now () in
      let event = Domain.Game.Event.(Reply (Reply.accept user "TakeBack" now)) in
      let* _ = Firestore.Game.add_event request game_id event in
      let update = Domain.Game.Updates.TakeBack.get new_turn in
      let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.TakeBack.to_yojson update) in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)
    with Error _ -> fail_transaction `Not_Found "Game not found"

  let add_time (request : Dream.request) (game_id : string) (kind : [ `Turn | `Global ]) =
    let user = Auth.get_minimal_user request in
    let now = External.now () in
    let event = Domain.Game.Event.(Action (Action.add_time user kind now)) in
    let* _ = Firestore.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let scores_from_request (request : Dream.request) : (int * int) option =
    match (Dream.query request "score0", Dream.query request "score1") with
    | (Some score0, Some score1) -> Some (int_of_string score0, int_of_string score1)
    | _ -> None

  let end_turn (request : Dream.request) (game_id : string) =
    try
      let* game = Firestore.Game.get request game_id in
      let scores = scores_from_request request in
      let update = Domain.Game.Updates.EndTurn.get ?scores game.turn in
      let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.EndTurn.to_yojson update) in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)
    with Error _ -> fail_transaction `Not_Found "Game not found"

  let draw (request : Dream.request) (game_id : string) =
    let scores = scores_from_request request in
    let update = Domain.Game.Updates.End.get ?scores Domain.Game.GameResult.HardDraw in
    let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.End.to_yojson update) in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let victory (request : Dream.request) (game_id : string) (winner : Domain.MinimalUser.t) (loser : Domain.MinimalUser.t) =
    let scores = scores_from_request request in
    let update = Domain.Game.Updates.End.get ~winner ~loser ?scores Domain.Game.GameResult.Victory in
    let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.End.to_yojson update) in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let move (request : Dream.request) (game_id : string) (move : Yojson.Safe.t) =
    let user = Auth.get_minimal_user request in
    let event = Domain.Game.Event.(Move (Move.of_json user move)) in
    let* _ = Firestore.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let get_json_param (request : Dream.request) (field : string) : (Yojson.Safe.t, string) result =
    match Dream.query request field with
    | None -> Error "parameter missing"
    | Some value ->
      try Ok (Yojson.Safe.from_string value)
      with Yojson.Json_error error -> Error error

  let change : Dream.route = Dream.post "game/:game_id" @@ fun request ->
    match Dream.query request "action" with
    | None -> fail `Bad_Request "Missing action"
    | Some action ->
    let game_id = Dream.param request "game_id" in
      Stats.set_action request (Printf.sprintf "POST game %s" action);
      Stats.set_game_id request game_id;
      Firestore.transaction request @@ fun () ->
      match action with
      | "acceptConfig" -> accept_config request game_id
      | "resign" -> resign request game_id
      | "notifyTimeout" ->
        let winner = get_json_param request "winner" >>= Domain.MinimalUser.of_yojson in
        let loser = get_json_param request "loser" >>= Domain.MinimalUser.of_yojson in
        begin match (winner, loser) with
          | (Ok winner, Ok loser) -> notify_timeout request game_id winner loser
          | _ -> fail_transaction `Bad_Request "Missing or invalid winner or loser parameter"
        end
      | "proposeDraw" -> propose request game_id "Draw"
      | "acceptDraw" -> accept_draw request game_id
      | "refuseDraw" -> reject request game_id "Draw"
      | "proposeRematch" -> propose request game_id "Rematch"
      | "acceptRematch" -> accept_rematch request game_id
      | "rejectRematch" -> reject request game_id "Rematch"
      | "askTakeBack" -> propose request game_id "TakeBack"
      | "acceptTakeBack" -> accept_take_back request game_id
      | "refuseTakeBack" -> reject request game_id "TakeBack"
      | "addGlobalTime" -> add_time request game_id `Global
      | "addTurnTime" -> add_time request game_id `Turn
      | "endTurn" -> end_turn request game_id (* TODO: should be done with a single move request *)
      | "draw" -> draw request game_id
      | "victory" ->
        let winner = get_json_param request "winner" >>= Domain.MinimalUser.of_yojson in
        let loser = get_json_param request "loser" >>= Domain.MinimalUser.of_yojson in
        begin match (winner, loser) with
          | (Ok winner, Ok loser) -> victory request game_id winner loser
          | _ -> fail_transaction `Bad_Request "Missing or invalid winner or loser parameter"
        end
      | "move" ->
        begin match get_json_param request "move" with
          | Ok move_json -> move request game_id move_json
          | _ -> fail_transaction `Bad_Request "Missing or invalid move parameter"
        end
      | _ -> failwith "TODO"

  let routes = [create; get; delete; change]
end

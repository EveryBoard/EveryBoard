open Utils

let ( >>= ) = Result.bind

let games_list = ["P4"] (* TODO: fill in with the rest, or extract automatically *)

module type GAME = sig
  val routes : Dream.route list
end

module Make
    (Auth : Auth.AUTH)
    (Firebase_ops : Firebase_ops.FIREBASE_OPS)
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
        let creator = Firebase.User.to_minimal_user uid user in
        (* Create the game, then the config room, then the chat room *)
        let game = Firebase.Game.initial game_name creator in
        let* game_id = Firebase_ops.Game.create request game in
        let config_room = Firebase.Config_room.initial creator in
        let* _ = Firebase_ops.Config_room.create request game_id config_room in
        let* _ = Firebase_ops.Chat.create request game_id in
        json_response `Created (`Assoc [("id", `String game_id)])

  let get : Dream.route = Dream.get "game/:game_id" @@ fun request ->
    Stats.set_action request "GET game";
    let game_id = Dream.param request "game_id" in
    match Dream.query request "onlyGameName" with
    | None ->
      let* game = Firebase_ops.Game.get request game_id in
      begin match game with
        | None -> fail `Not_Found "There is no game with this id"
        | Some game_json -> json_response `OK game_json
      end
    | Some _ ->
      let* game_name : string option = Firebase_ops.Game.get_name request game_id in
      match game_name with
      | None -> fail `Not_Found "There is no game with this id"
      | Some name -> json_response `OK (`Assoc [("gameName", `String name)])

  let delete : Dream.route = Dream.delete "game/:game_id" @@ fun request ->
    Stats.set_action request "DELETE game";
    let game_id = Dream.param request "game_id" in
    let* _ = Firebase_ops.Game.delete request game_id in
    Dream.empty `OK

  let accept_config (request : Dream.request) (game_id : string) =
    let* config_room_doc = Firebase_ops.Config_room.get request game_id in
    match Option.to_result ~none:"does not exist" config_room_doc >>= Firebase.Config_room.of_yojson with
    | Error _ -> fail_transaction `Not_Found "Game does not exist"
    | Ok config_room ->
      let* _ = Firebase_ops.Config_room.accept request game_id in
      let starting_config = Firebase.Game.Updates.Start.get config_room in
      let accepter = Auth.get_minimal_user request in
      let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.Start.to_yojson starting_config) in
      let event = Firebase.Game.Event.(Action (Action.start_game accepter)) in
      let* _ = Firebase_ops.Game.add_event request game_id event in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)

  let resign (request : Dream.request) (game_id : string) =
      let* game_doc = Firebase_ops.Game.get request game_id in
      match Option.to_result ~none:"does not exist" game_doc >>= Firebase.Game.of_yojson with
      | Error _ -> fail_transaction `Not_Found "Game not found"
      | Ok game ->
        let minimal_user = Auth.get_minimal_user request in
        let player_zero = game.player_zero in
        let player_one = Option.get game.player_one in
        let winner = if minimal_user = game.player_zero then player_one else player_zero in
        let loser = minimal_user in
        let update = Firebase.Game.Updates.End.get ~winner ~loser Firebase.Game.Game_result.resign in
        let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.End.to_yojson update) in
        let resigner = Auth.get_minimal_user request in
        let event = Firebase.Game.Event.(Action (Action.end_game resigner)) in
        let* _ = Firebase_ops.Game.add_event request game_id event in
        let* response = Dream.empty `OK in
        Lwt.return (Ok response)

  let notify_timeout (request : Dream.request) (game_id : string) (winner : Firebase.Minimal_user.t) (loser : Firebase.Minimal_user.t) =
    (* TODO: don't trust the client, we need to get winner and loser ourselves *)
    let update = Firebase.Game.Updates.End.get ~winner ~loser Firebase.Game.Game_result.timeout in
    let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.End.to_yojson update) in
    let requester = Auth.get_minimal_user request in
    let event = Firebase.Game.Event.(Action (Action.end_game requester)) in
    let* _ = Firebase_ops.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let propose (request : Dream.request) (game_id : string) (proposition : string) =
    let user = Auth.get_minimal_user request in
    let event = Firebase.Game.Event.(Request (Request.make user proposition)) in
    let* _ = Firebase_ops.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let reject (request : Dream.request) (game_id : string) (proposition : string) =
    let user = Auth.get_minimal_user request in
    let event = Firebase.Game.Event.(Reply (Reply.refuse user proposition)) in
    let* _ = Firebase_ops.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let accept_draw (request : Dream.request) (game_id : string) =
    (* TODO: error handling: introduce a "abort" error that gives an HTTP response and is intercepted in the main route *)
    let* game_doc = Firebase_ops.Game.get request game_id in
    match Option.to_result ~none:"does not exist" game_doc >>= Firebase.Game.of_yojson with
    | Error _ -> fail_transaction `Not_Found "Game not found"
    | Ok game ->
      let user = Auth.get_minimal_user request in
      let accept = Firebase.Game.Event.(Reply (Reply.accept user "Draw")) in
      let* _ = Firebase_ops.Game.add_event request game_id accept in
      let player = if user = game.player_zero then 0 else 1 in
      let update = Firebase.Game.Updates.End.get (Firebase.Game.Game_result.agreed_draw_by player) in
      let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.End.to_yojson update) in
      let game_end = Firebase.Game.Event.(Action (Action.end_game user)) in
      let* _ = Firebase_ops.Game.add_event request game_id game_end in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)

  let accept_rematch (request : Dream.request) (game_id : string) =
    let* game_doc = Firebase_ops.Game.get request game_id in
    match Option.to_result ~none:"does not exist" game_doc >>= Firebase.Game.of_yojson with
    | Error _ -> fail_transaction `Not_Found "Game not found"
    | Ok game ->
      let* config_room_doc = Firebase_ops.Game.get request game_id in
      match Option.to_result ~none:"does not exist" config_room_doc >>= Firebase.Config_room.of_yojson with
      | Error _ -> fail_transaction `Not_Found "Config room not found"
      | Ok config_room ->
        (* The user accepting the rematch becomes the creator *)
        let creator = Auth.get_minimal_user request in
        let (chosen_opponent, first_player) =
          if game.player_zero = creator
          then (Option.get game.player_one, Firebase.Config_room.First_player.chosen_player)
          else (game.player_zero, Firebase.Config_room.First_player.creator) in
        let rematch_config_room =
          Firebase.Config_room.rematch config_room first_player creator chosen_opponent in
        let rematch_game = Firebase.Game.rematch game.type_game rematch_config_room  in
        let* rematch_id = Firebase_ops.Game.create request rematch_game in
        let user = Auth.get_minimal_user request in
        let* _ = Firebase_ops.Config_room.create request rematch_id config_room in
        let* _ = Firebase_ops.Chat.create request rematch_id in
        let accept_event = Firebase.Game.Event.(Reply (Reply.accept user "Rematch")) in
        let* _ = Firebase_ops.Game.add_event request game_id accept_event in
        let start_event = Firebase.Game.Event.(Action (Action.start_game user)) in
        let* _ = Firebase_ops.Game.add_event request game_id start_event in
        let* response = json_response `Created (`Assoc [("id", `String game_id)]) in
        Lwt.return (Ok response)

  let accept_take_back (request : Dream.request) (game_id : string) =
    let* game_doc = Firebase_ops.Game.get request game_id in
    match Option.to_result ~none:"does not exist" game_doc >>= Firebase.Game.of_yojson with
    | Error _ -> fail_transaction `Not_Found "Game not found"
    | Ok game ->
      let user = Auth.get_minimal_user request in
      let player_value = if game.player_zero = user then 0 else 1 in
      let new_turn =
        if game.turn mod 2 == player_value
        then game.turn - 2 (* Need to take back two turns to let the requester take back their move *)
        else game.turn -1 in
      let event = Firebase.Game.Event.(Reply (Reply.accept user "TakeBack")) in
      let* _ = Firebase_ops.Game.add_event request game_id event in
      let update = Firebase.Game.Updates.TakeBack.get new_turn in
      let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.TakeBack.to_yojson update) in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)

  let add_time (request : Dream.request) (game_id : string) (kind : [ `Turn | `Global ]) =
    let user = Auth.get_minimal_user request in
    let event = Firebase.Game.Event.(Action (Action.add_time user kind)) in
    let* _ = Firebase_ops.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let scores_from_request (request : Dream.request) : (int * int) option =
    match (Dream.query request "score0", Dream.query request "score1") with
    | (Some score0, Some score1) -> Some (int_of_string score0, int_of_string score1)
    | _ -> None

  let end_turn (request : Dream.request) (game_id : string) =
    let* game_doc = Firebase_ops.Game.get request game_id in
    match Option.to_result ~none:"does not exist" game_doc >>= Firebase.Game.of_yojson with
    | Error _ -> fail_transaction `Not_Found "Game not found"
    | Ok game ->
      let scores = scores_from_request request in
      let update = Firebase.Game.Updates.EndTurn.get ?scores game.turn in
      let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.EndTurn.to_yojson update) in
      let* response = Dream.empty `OK in
      Lwt.return (Ok response)

  let draw (request : Dream.request) (game_id : string) =
    let scores = scores_from_request request in
    let update = Firebase.Game.Updates.End.get ?scores Firebase.Game.Game_result.hard_draw in
    let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.End.to_yojson update) in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let victory (request : Dream.request) (game_id : string) (winner : Firebase.Minimal_user.t) (loser : Firebase.Minimal_user.t) =
    let scores = scores_from_request request in
    let update = Firebase.Game.Updates.End.get ~winner ~loser ?scores Firebase.Game.Game_result.victory in
    let* _ = Firebase_ops.Game.update request game_id (Firebase.Game.Updates.End.to_yojson update) in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let move (request : Dream.request) (game_id : string) (move : Yojson.Safe.t) =
    let user = Auth.get_minimal_user request in
    let event = Firebase.Game.Event.(Move (Move.of_json user move)) in
    let* _ = Firebase_ops.Game.add_event request game_id event in
    let* response = Dream.empty `OK in
    Lwt.return (Ok response)

  let get_json_param (request : Dream.request) (field : string) : (Yojson.Safe.t, string) result =
    match Dream.query request field with
    | None -> Error "parameter missing"
    | Some value ->
      try Ok (Yojson.Safe.from_string value)
      with Yojson.Json_error error -> Error error

  let change : Dream.route = Dream.post "game/:game_id" @@ fun request ->
    let game_id = Dream.param request "game_id" in
    match Dream.query request "action" with
    | None -> fail `Bad_Request "Missing action"
    | Some action ->
      Stats.set_action request (Printf.sprintf "POST game %s" action);
      Firebase_ops.transaction request @@ fun () ->
      match action with
      | "acceptConfig" -> accept_config request game_id
      | "resign" -> resign request game_id
      | "notifyTimeout" ->
        let winner = get_json_param request "winner" >>= Firebase.Minimal_user.of_yojson in
        let loser = get_json_param request "loser" >>= Firebase.Minimal_user.of_yojson in
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
        let winner = get_json_param request "winner" >>= Firebase.Minimal_user.of_yojson in
        let loser = get_json_param request "loser" >>= Firebase.Minimal_user.of_yojson in
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

open Utils
open DreamUtils
open Domain

(** The /game/ endpoint, dealing with ongoing games *)
module type GAME_ENDPOINT = sig

    (** The routes of this endpoint *)
    val routes : Dream.route list
end

module Make
        (External : External.EXTERNAL)
        (Auth : Auth.AUTH)
        (Firestore : Firestore.FIRESTORE)
        (Stats : Stats.STATS)
    : GAME_ENDPOINT = struct

    (** The list of available games *)
    let games_list =
        let read_file = fun (filename : string) : string ->
            let ch = open_in_bin filename in
            let s = really_input_string ch (in_channel_length ch) in
            close_in ch;
            s in
        read_file "games.txt"
        |> String.split_on_char '\n'
        |> List.filter (fun x -> String.length x > 0)

    (** Respond with some JSON to the client *)
    let json_response = fun (status : Dream.status) (response : JSON.t) : Dream.response Lwt.t ->
        let headers = [("Content-Type", "application/json")] in
        Dream.respond ~headers ~status (JSON.to_string response)

    (** Create a game. Perform 3 writes. *)
    let create : Dream.route = Dream.post "game" @@ fun request ->
        Stats.set_action request "CREATE game";
        (* Does the game name correspond to a game we have? *)
        match Dream.query request "gameName" with
        | None ->
            raise (BadInput "Missing gameName in query")
        | Some game_name when List.mem game_name games_list = false ->
            raise (BadInput "gameName does not correspond to an existing game")
        | Some game_name ->
            (* Is the user allowed to create a game? That is, the user should not have a current game *)
            let user = Auth.get_user request in
            match user.current_game with
            | Some _ -> raise (BadInput "User is already in a game")
            | None ->
                let uid = Auth.get_uid request in
                let creator = User.to_minimal_user uid user in
                (* Create the game, then the config room, then the chat room *)
                let game = Game.initial game_name creator in
                (* Write 1: create the game *)
                let* game_id = Firestore.Game.create ~request ~game in
                Stats.set_game_id request game_id;
                let config_room = ConfigRoom.initial creator in
                (* Write 2: create the config room *)
                let* _ = Firestore.ConfigRoom.create ~request ~id:game_id ~config_room in
                (* Write 3: create the chat *)
                let* _ = Firestore.Chat.create ~request ~id:game_id in
                json_response `Created (`Assoc [("id", `String game_id)])

    (** Get a game, or only its name. Performs 1 read. *)
    let get : Dream.route = Dream.get "game/:game_id" @@ fun request ->
        let game_id = Dream.param request "game_id" in
        Stats.set_action request "GET game";
        Stats.set_game_id request game_id;
        match Dream.query request "onlyGameName" with
        | None ->
            (* Read 1: get the game *)
            let* game = Firestore.Game.get ~request ~id:game_id in
            json_response `OK (Game.to_yojson game)
        | Some _ ->
            (* Read 1: get only the game name *)
            let* name = Firestore.Game.get_name ~request ~id:game_id in
            json_response `OK (`Assoc [("gameName", `String name)])

    (** Delete a game. Performs 3 writes. *)
    let delete : Dream.route = Dream.delete "game/:game_id" @@ fun request ->
        let game_id = Dream.param request "game_id" in
        Stats.set_action request "DELETE game";
        Stats.set_game_id request game_id;
        (* Write 1: delete the game *)
        let* _ = Firestore.Game.delete ~request ~id:game_id in
        (* Write 2: delete the chat *)
        let* _ = Firestore.ConfigRoom.delete ~request ~id:game_id in
        (* Write 3: delete the config room *)
        let* _ = Firestore.Chat.delete ~request ~id:game_id in
        Dream.empty `OK

    (** Resign from a game. Perform 1 read and 2 writes. *)
    let resign = fun (request : Dream.request) (game_id : string) ->
        (* Read 1: retrieve the game *)
        let* game = Firestore.Game.get ~request ~id:game_id in
        let minimal_user = Auth.get_minimal_user request in
        let player_zero = game.player_zero in
        match game.player_one with
        | None -> raise (BadInput "game has no opponent")
        | Some player_one ->
            Stats.end_game ();
            let winner = if minimal_user = game.player_zero then player_one else player_zero in
            let loser = minimal_user in
            let update = Game.Updates.End.get ~winner ~loser Game.GameResult.Resign in
            (* Write 1: end the game  *)
            let* _ = Firestore.Game.update ~request ~id:game_id ~update:(Game.Updates.End.to_yojson update) in
            let resigner = Auth.get_minimal_user request in
            let now = External.now_ms () in
            (* Write 2: add the end action *)
            let game_end = GameEvent.(Action (Action.end_game resigner now)) in
            let* _ = Firestore.Game.add_event ~request ~id:game_id ~event:game_end in
            Dream.empty `OK

    (** End the game by a timeout from one player. Perform 1 read and 2 writes. *)
    let notify_timeout = fun (request : Dream.request) (game_id : string) (winner : MinimalUser.t) (loser : MinimalUser.t) ->
        Stats.end_game ();
        (* Read 1: retrieve the game *)
        let update = Game.Updates.End.get ~winner ~loser Game.GameResult.Timeout in
        (* Write 1: end the game *)
        let* _ = Firestore.Game.update ~request ~id:game_id ~update:(Game.Updates.End.to_yojson update) in
        let requester = Auth.get_minimal_user request in
        let now = External.now_ms () in
        let game_end = GameEvent.(Action (Action.end_game requester now)) in
        (* Write 2: add the end action *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event:game_end in
        Dream.empty `OK

    (** Propose something to the opponent in-game. Perform 1 write. *)
    let propose = fun (request : Dream.request) (game_id : string) (proposition : string) ->
        let user = Auth.get_minimal_user request in
        let now = External.now_ms () in
        let event = GameEvent.(Request (Request.make user proposition now)) in
        (* Write 1: add the request event *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event in
        Dream.empty `OK

    (** Reject a request from the opponent. Perform 1 write. *)
    let reject = fun (request : Dream.request) (game_id : string) (proposition : string) ->
        let user = Auth.get_minimal_user request in
        let now = External.now_ms () in
        let event = GameEvent.(Reply (Reply.refuse user proposition now)) in
        (* Write 1: add the response *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event in
        Dream.empty `OK

    (** Accept a draw request from the opponent. Perform 1 read and 3 writes. *)
    let accept_draw = fun (request : Dream.request) (game_id : string) ->
        Stats.end_game ();
        (* Read 1: retrieve the game *)
        let* game = Firestore.Game.get ~request ~id:game_id in
        let user = Auth.get_minimal_user request in
        let now = External.now_ms () in
        let accept = GameEvent.(Reply (Reply.accept user "Draw" now)) in
        (* Write 1: add response *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event:accept in
        let player = if user = game.player_zero then Player.Zero else Player.One in
        let update = Game.Updates.End.get (Game.GameResult.AgreedDrawBy player) in
        (* Write 2: end the game *)
        let* _ = Firestore.Game.update ~request ~id:game_id ~update:(Game.Updates.End.to_yojson update) in
        let game_end = GameEvent.(Action (Action.end_game user now)) in
        (* Write 3: add the end event *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event:game_end in
        Dream.empty `OK

    (** Accept a rematch request from the opponent. Perform 2 read and 3 writes. *)
    let accept_rematch = fun (request : Dream.request) (game_id : string) ->
        Stats.new_game ();
        (* Read 1: retrieve the game *)
        let* game = Firestore.Game.get ~request ~id:game_id in
        (* Read 2: retrieve the config room *)
        let* config_room = Firestore.ConfigRoom.get ~request:request ~id:game_id in
        (* The user accepting the rematch becomes the creator *)
        let creator = Auth.get_minimal_user request in
        let (chosen_opponent, first_player) =
            if game.player_zero = creator
            then (Option.get game.player_one, ConfigRoom.FirstPlayer.ChosenPlayer)
            else (game.player_zero, ConfigRoom.FirstPlayer.Creator) in
        let rematch_config_room =
            ConfigRoom.rematch config_room first_player creator chosen_opponent in
        let now = External.now_ms () in
        let rematch_game = Game.rematch game.type_game rematch_config_room now External.rand_bool in
        (* Write 1: create the rematch game *)
        let* rematch_id = Firestore.Game.create ~request ~game:rematch_game in
        let user = Auth.get_minimal_user request in
        (* Write 2: create the rematch config room *)
        let* _ = Firestore.ConfigRoom.create ~request ~id:rematch_id ~config_room:rematch_config_room in
        (* Write 3: create the rematch chat *)
        let* _ = Firestore.Chat.create ~request ~id:rematch_id in
        let accept_event = GameEvent.(Reply (Reply.accept user "Rematch" ~data:(`String rematch_id) now)) in
        (* Write 4: add the acceptance of the request in the previous game *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event:accept_event in
        let start_event = GameEvent.(Action (Action.start_game user now)) in
        (* Write 5: start the rematch *)
        let* _ = Firestore.Game.add_event ~request ~id:rematch_id ~event:start_event in
        json_response `Created (`Assoc [("id", `String game_id)])

    (** Accept a take back request from the opponent. Perform 1 read and 2 writes. *)
    let accept_take_back = fun (request : Dream.request) (game_id : string) ->
        (* Read 1: retrieve the game *)
        let* game = Firestore.Game.get ~request ~id:game_id in
        let user = Auth.get_minimal_user request in
        let requester_player_value = if game.player_zero = user then 1 else 0 in
        let new_turn =
            if requester_player_value = game.turn mod 2
            then game.turn - 2 (* Need to take back two turns to let the requester take back their move *)
            else game.turn - 1 in
        let now = External.now_ms () in
        let event = GameEvent.(Reply (Reply.accept user "TakeBack" now)) in
        (* Write 1: accept take back *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event in
        let update = Game.Updates.TakeBack.get new_turn in
        (* Write 2: Change turn *)
        let* _ = Firestore.Game.update ~request ~id:game_id ~update:(Game.Updates.TakeBack.to_yojson update) in
        Dream.empty `OK

    (** Add time to the opponent. Perform 1 write. *)
    let add_time = fun (request : Dream.request) (game_id : string) (kind : [ `Turn | `Global ]) ->
        let user = Auth.get_minimal_user request in
        let now = External.now_ms () in
        let event = GameEvent.(Action (Action.add_time user kind now)) in
        (* Write 1: add time *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event in
        Dream.empty `OK

    let scores_from_request = fun (request : Dream.request) : (int * int) option ->
        match (Dream.query request "score0", Dream.query request "score1") with
        | (Some score0, Some score1) -> Some (int_of_string score0, int_of_string score1)
        | _ -> None

    (** Perform a move. Perform 1 read and 2 writes. *)
    let move = fun (request : Dream.request) (game_id : string) (move : Yojson.Safe.t) ->
        Stats.new_move ();
        (* Read 1: retrieve the game for the current turn *)
        let* game = Firestore.Game.get ~request ~id:game_id in
        let user = Auth.get_minimal_user request in
        let now = External.now_ms () in
        let event = GameEvent.(Move (Move.of_json user move now)) in
        (* Write 1: add the move *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event in
        let scores = scores_from_request request in
        let update = Game.Updates.EndTurn.get ?scores game.turn in
        (* Write 2: end the turn and update the scores *)
        let* _ = Firestore.Game.update ~request ~id:game_id ~update:(Game.Updates.EndTurn.to_yojson update) in
        Dream.empty `OK

    (** Similar to [move], but also ends the game. Perform 1 read and 3 writes *)
    let move_and_end = fun (request : Dream.request) (game_id : string) (move : Yojson.Safe.t) ->
        Stats.new_move ();
        Stats.end_game ();
        (* Read 1: retrieve the game to have the current turn *)
        let* game = Firestore.Game.get ~request ~id:game_id in
        let user = Auth.get_minimal_user request in
        let now = External.now_ms () in
        let event = GameEvent.(Move (Move.of_json user move now)) in
        (* Write 1: add the move *)
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event in
        let scores = scores_from_request request in
        let (result, winner, loser) = match Dream.query request "winner" with
            | Some "0" -> (Game.GameResult.Victory, Some game.player_zero, game.player_one)
            | Some "1" -> (Game.GameResult.Victory, game.player_one, Some game.player_zero)
            | None -> (Game.GameResult.HardDraw, None, None)
            | _ -> raise (BadInput "Invalid winner") in
        let update = Game.Updates.EndWithMove.get ?scores ?winner ?loser result (game.turn + 1) in
        (* Write 2: end the turn and game, update the scores *)
        let* _ = Firestore.Game.update ~request ~id:game_id ~update:(Game.Updates.EndWithMove.to_yojson update) in
        (* Write 3: add the game end action *)
        let game_end = Domain.GameEvent.(Action (Action.end_game user now)) in
        let* _ = Firestore.Game.add_event ~request ~id:game_id ~event:game_end in
        Dream.empty `OK

    let change : Dream.route = Dream.post "game/:game_id" @@ fun request ->
        let ( >>= ) = Result.bind in (* for convenience *)
        match Dream.query request "action" with
        | None -> raise (BadInput "Missing action")
        | Some action ->
            let game_id = Dream.param request "game_id" in
            Stats.set_action request (Printf.sprintf "POST game %s" action);
            Stats.set_game_id request game_id;
            match action with
            | "resign" -> resign request game_id
            | "notifyTimeout" ->
                let winner = get_json_param request "winner" >>= MinimalUser.of_yojson in
                let loser = get_json_param request "loser" >>= MinimalUser.of_yojson in
                begin match (winner, loser) with
                    | (Ok winner, Ok loser) -> notify_timeout request game_id winner loser
                    | _ -> raise (BadInput "Missing or invalid winner or loser parameter")
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
            | "move" ->
                begin match get_json_param request "move" with
                    | Ok move_json -> move request game_id move_json
                    | _ -> raise (BadInput "Missing or invalid move parameter")
                end
            | "moveAndEnd" ->
                begin match get_json_param request "move" with
                    | Ok move_json -> move_and_end request game_id move_json
                    | _ -> raise (BadInput "Missing or invalid move parameter")
                end
            | _ -> raise (BadInput "Unknown action")

    let routes = [create; get; delete; change]
end

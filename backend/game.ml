open Utils

let games_list = ["P4"] (* TODO: fill in with the rest, or extract automatically *)

module type GAME = sig
  val routes : Dream.route list
end

module Make
    (Auth : Auth.AUTH)
    (Token_refresher : Token_refresher.TOKEN_REFRESHER)
    (Firebase_ops : Firebase_ops.FIREBASE_OPS)
    : GAME = struct

  let create : Dream.route = Dream.post "game" @@ fun request ->
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
        let* token = Token_refresher.get_token request in
        let minimal_user = Firebase.User.to_minimal_user uid user in
        (* Create the game, then the config room, then the chat room *)
        let* game_id = Firebase_ops.Game.create token game_name minimal_user in
        let* _ = Firebase_ops.Config_room.create token game_id minimal_user in
        let* _ = Firebase_ops.Chat.create token game_id in
        json_response `Created (`Assoc [("id", `String game_id)])

  let get : Dream.route = Dream.get "game/:game_id" @@ fun request ->
    let* token = Token_refresher.get_token request in
    let game_id = Dream.param request "game_id" in
    match Dream.query request "onlyGameName" with
    | None ->
      let* game = Firebase_ops.Game.get token game_id in
      begin match game with
        | None -> fail `Not_Found "There is no game with this id"
        | Some game_json -> json_response `OK game_json
      end
    | Some _ ->
      let* game_name : string option = Firebase_ops.Game.get_name token game_id in
      match game_name with
      | None -> fail `Not_Found "There is no game with this id"
      | Some name -> json_response `OK (`Assoc [("gameName", `String name)])

  let delete : Dream.route = Dream.delete "game/:game_id" @@ fun request ->
    let* token = Token_refresher.get_token request in
    let game_id = Dream.param request "game_id" in
    let* _ = Firebase_ops.Game.delete token game_id in
    Dream.empty `OK

  let change : Dream.route = Dream.post "game/:game_id" @@ fun request ->
    let* token = Token_refresher.get_token request in
    let game_id = Dream.param request "game_id" in
    Firebase_ops.transaction token @@ fun () ->
    match Dream.query request "action" with
    | Some "acceptConfig" ->
      let* config_room_doc = Firebase_ops.Config_room.get token game_id in
      begin match Result.bind (Option.to_result ~none:"does not exist" config_room_doc) Firebase.Config_room.of_yojson with
        | Error _ -> fail_transaction `Not_Found "Game does not exist"
        | Ok config_room ->
          let* _ = Firebase_ops.Config_room.accept token game_id in
          let starting_config = Firebase.Game.Updates.Starting.get config_room in
          let accepter = if config_room.creator = starting_config.player_zero then 1 else 0 in
          let* _ = Firebase_ops.Game.update token game_id (Firebase.Game.Updates.Starting.to_yojson starting_config) in
          let event = Firebase.Game.Event.(Action (Action.start_game accepter)) in
          let* _ = Firebase_ops.Game.add_event token game_id event in
          let* response = Dream.empty `OK in
          Lwt.return (Ok response)
      end
    | Some "resign" ->
      let* game_doc = Firebase_ops.Game.get token game_id in
      begin match Result.bind (Option.to_result ~none:"does not exist" game_doc) Firebase.Game.of_yojson with
        | Error _ -> fail_transaction `Not_Found "Game not found"
        | Ok game ->
          let minimal_user = Auth.get_minimal_user request in
          let player_zero = game.player_zero in
          let player_one = Option.get game.player_one in
          let winner = if minimal_user = game.player_zero then player_one else player_zero in
          let update = Firebase.Game.Updates.Finishing.get winner minimal_user Firebase.Game.Game_result.resign in
          let* _ = Firebase_ops.Game.update token game_id (Firebase.Game.Updates.Finishing.to_yojson update) in
          let resigner_player = if minimal_user = game.player_zero then 0 else 1 in
          let event = Firebase.Game.Event.(Action (Action.end_game resigner_player)) in
          let* _ = Firebase_ops.Game.add_event token game_id event in
          let* response = Dream.empty `OK in
          Lwt.return (Ok response)
      end
    | _ -> failwith "TODO"


  let routes = [create; get; delete; change]
end

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
        let* game_id = Firebase_ops.create_game token game_name minimal_user in
        let* _ = Firebase_ops.create_config_room token game_id minimal_user in
        let* _ = Firebase_ops.create_chat token game_id in
        json_response `Created (`Assoc [("id", `String game_id)])

  let get : Dream.route = Dream.get "game/:game_id" @@ fun request ->
    let* token = Token_refresher.get_token request in
    let game_id = Dream.param request "game_id" in
    match Dream.query request "onlyGameName" with
    | None -> failwith "TODO"
    | Some _ ->
      let* game_name : string option = Firebase_ops.get_game_name token game_id in
      match game_name with
      | None -> fail `Not_Found "There is no game with this id"
      | Some name -> json_response `OK (`Assoc [("gameName", `String name)])

  let routes = [create; get]
end

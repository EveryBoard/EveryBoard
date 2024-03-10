open Utils

let ( >>= ) = Result.bind

module type CONFIG_ROOM = sig
  val routes : Dream.route list
end

module Make
    (External : External.EXTERNAL)
    (Auth : Auth.AUTH)
    (Firestore : Firestore.FIRESTORE)
    (Stats : Stats.STATS)
    : CONFIG_ROOM = struct

  (** Join a game. Perform 1 read and up to 1 write *)
  let join_game : Dream.route =
    Dream.post "config-room/:game_id/candidates" @@ fun request ->
    let game_id = Dream.param request "game_id" in
    Stats.set_action request (Printf.sprintf "POST config-room/candidates");
    Stats.set_game_id request game_id;
    let user = Auth.get_minimal_user request in
    (* Check if game exists, if it does not this will throw Not_found *)
    (* Read 1: retrieve the config room *)
    let* config_room = Firestore.ConfigRoom.get request game_id in
    Printf.printf "add candidate, creator is %s, user is %s\n" config_room.creator.id user.id;
    let* _ = if config_room.creator.id <> user.id then begin
        (* Write 1: User is candidate, add it to candidate list *)
        (* No need for a transaction here, we are just creating a new document *)
        Printf.printf "user is candidate\n";
        Firestore.ConfigRoom.add_candidate request game_id user
      end else
        Lwt.return () in
    Dream.empty `OK

  (** Remove a candidate. Perform 1 read and up to 2 writes. *)
  let remove_candidate : Dream.route =
    Dream.delete "config-room/:game_id/candidates/:candidate_id" @@ fun request ->
    let game_id = Dream.param request "game_id" in
    let candidate_id = Dream.param request "candidate_id" in
    Stats.set_action request (Printf.sprintf "DELETE config-room/candidates");
    Stats.set_game_id request game_id;
    (* Read 1: get config room *)
    let* config_room = Firestore.ConfigRoom.get request game_id in
    (* Write 1: remove candidate *)
    let* _ = Firestore.ConfigRoom.remove_candidate request game_id candidate_id in
    (* Write 2: set to "created" if it was the chosen opponent *)
    let* _ = match config_room.chosen_opponent with
        | Some opponent when candidate_id = opponent.id ->
          let update = Domain.ConfigRoom.Updates.ReviewConfigAndRemoveOpponent.(to_yojson get) in
          Firestore.ConfigRoom.update request game_id update
        | _ -> Lwt.return () in
    Dream.empty `OK

  (** Propose a config to the opponent. Perform 1 write. *)
  let propose_config (request : Dream.request) (game_id : string) =
    match get_json_param request "config" >>= Domain.ConfigRoom.Updates.Proposal.of_yojson with
    | Error _ -> raise (BadInput "Invalid config proposal")
    | Ok update ->
      (* Write 1: update the config *)
      let update_json = Domain.ConfigRoom.Updates.Proposal.to_yojson update in
      let* _ = Firestore.ConfigRoom.update request game_id update_json in
      Dream.empty `OK

  (** Accept a config and start the game. Perform 1 read and 3 writes. *)
  let accept_config (request : Dream.request) (game_id : string) =
    (* Read 1: retrieve the config room *)
    let* config_room = Firestore.ConfigRoom.get request game_id in
    (* Write 1: accept the config room *)
    let* _ = Firestore.ConfigRoom.accept request game_id in
    let now = External.now_ms () in
    let starting_config = Domain.Game.Updates.Start.get config_room now External.rand_bool in
    let accepter = Auth.get_minimal_user request in
    (* Write 2: start the game *)
    let* _ = Firestore.Game.update request game_id (Domain.Game.Updates.Start.to_yojson starting_config) in
    let event = Domain.Game.Event.(Action (Action.start_game accepter now)) in
    (* Write 3: add a start action *)
    let* _ = Firestore.Game.add_event request game_id event in
    Dream.empty `OK

  (** Select the opponent in a config. Perform 1 write. *)
  let select_opponent (request : Dream.request) (game_id : string) =
    match get_json_param request "opponent" >>= Domain.MinimalUser.of_yojson with
    | Error _ -> raise (BadInput "Invalid opponent")
    | Ok opponent ->
      (* Write 1: update the config *)
      let update = Domain.ConfigRoom.Updates.SelectOpponent.(to_yojson (get opponent)) in
      let* _ = Firestore.ConfigRoom.update request game_id update in
      Dream.empty `OK

  (** Review a config. Perform 1 write. *)
  let review_config (request : Dream.request) (game_id : string) =
    let update = Domain.ConfigRoom.Updates.ReviewConfig.(to_yojson get) in
    let* _ = Firestore.ConfigRoom.update request game_id update in
    Dream.empty `OK

  (** Review a config and removes the opponent. Perform 1 write. *)
  let review_config_and_remove_opponent (request : Dream.request) (game_id : string) =
    let update = Domain.ConfigRoom.Updates.ReviewConfigAndRemoveOpponent.(to_yojson get) in
    let* _ = Firestore.ConfigRoom.update request game_id update in
    Dream.empty `OK

  let change : Dream.route =
    Dream.post "config-room/:game_id" @@ fun request ->
    match Dream.query request "action" with
    | None -> raise (BadInput "Missing action")
    | Some action ->
      let game_id = Dream.param request "game_id" in
      Stats.set_action request (Printf.sprintf "POST config-room %s" action);
      Stats.set_game_id request game_id;
      match action with
      | "propose" -> propose_config request game_id
      | "selectOpponent" -> select_opponent request game_id
      | "review" -> review_config request game_id
      | "accept" -> accept_config request game_id
      | "reviewConfigAndRemoveOpponent" -> review_config_and_remove_opponent request game_id
      | _ -> raise (BadInput "Unknown action")

  let routes = [join_game; remove_candidate; change]
end

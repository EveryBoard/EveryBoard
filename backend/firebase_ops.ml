open Utils

type token = string

module type FIREBASE_OPS = sig
  (** Retrieve an user. If the user does not exist, return None *)
  val get_user : token -> string -> Firebase.User.t option Lwt.t

  (** Create an unstarted game of the given game type *)
  val create_game : token -> string -> Firebase.Minimal_user.t -> string Lwt.t

  (** Create an initial config room, with the given id and creator *)
  val create_config_room : token -> string -> Firebase.Minimal_user.t -> unit Lwt.t

  (** Create an initial chat root *)
  val create_chat : token -> string -> unit Lwt.t

  (** Get the name of a game if the game exists *)
  val get_game_name : token -> string -> string option Lwt.t
end

module Make (Firebase_primitives : Firebase_primitives.FIREBASE_PRIMITIVES) : FIREBASE_OPS = struct
  let get_user (token : string) (uid : string) : Firebase.User.t option Lwt.t =
    try
      let* doc : Yojson.Safe.t = Firebase_primitives.get_doc token ("users/" ^ uid) in
      Dream.log "%s" @@ Yojson.Safe.to_string doc;
      match Firebase.User.of_yojson doc with
      | Ok user -> Lwt.return (Some user)
      | Error e -> raise (Error ("Cannot parse user from firestore: " ^ e))
    with Error _ -> Lwt.return None

  let create_game (token : string) (game_name : string) (creator : Firebase.Minimal_user.t) : string Lwt.t =
    let game_json : Yojson.Safe.t = Firebase.Game.(to_yojson (initial game_name creator)) in
    Firebase_primitives.create_doc token "parts" game_json

  let create_config_room (token : string) (id : string) (creator : Firebase.Minimal_user.t) : unit Lwt.t =
    let config_room = Firebase.Config_room.(to_yojson (initial creator)) in
    let* _ = Firebase_primitives.create_doc token "config-room" ~id config_room in
    Lwt.return ()

  let create_chat (token : string) (id : string) : unit Lwt.t =
    let chat = `Assoc [] in (* We don't model chats in the backend *)
    let* _ = Firebase_primitives.create_doc token "chats" ~id chat in
    Lwt.return ()

  let get_game_name (token : string) (game_id : string) : string option Lwt.t =
    try
      let* doc : Yojson.Safe.t = Firebase_primitives.get_doc token ("parts/" ^ game_id ^ "?mask=typeGame") in
      let game_name = Yojson.Safe.Util.to_string (Yojson.Safe.Util.member "typeGame" doc) in
      Lwt.return (Some game_name)
    with Error _ -> Lwt.return None


end

open Utils

type token = string

(** A getter takes a token and an id, and returns the JSON document if found, None otherwise *)
type getter = token -> string -> JSON.t option Lwt.t
(** An updater takes a token, an id, and a document update. It updates the corresponding document *)
type updater = token -> string -> JSON.t -> unit Lwt.t
(** A deleter takes a token and an id, and deletes the corresponding document *)
type deleter = token -> string -> unit Lwt.t

(** This is the high-level firebase operations for the various data types *)
module type FIREBASE_OPS = sig
  (** Perform a firestore transaction to bundle multiple reads and writes together.
      Firestore's doc states that all reads have to be performed before the writes. *)
  val transaction : token -> (unit -> ('a, 'a) result Lwt.t) -> 'a Lwt.t

  module User : sig
    (** Retrieve an user as a JSON document, from its id *)
    val get : getter
  end

  module Game : sig
    (** Retrieve a full game as a JSON document, from its id *)
    val get : getter

    (** Get the name of a game if the game exists *)
    val get_name : token -> string -> string option Lwt.t

    (** Create a game  *)
    val create : token -> Firebase.Game.t -> string Lwt.t

    (** Delete a game *)
    val delete : deleter

    (** Update the game with partial modifications *)
    val update : updater

    (** Add a game event to a game*)
    val add_event : token -> string -> Firebase.Game.Event.t -> unit Lwt.t

  end

  module Config_room : sig
    (** Retrieve a config room as a JSON document, from its id *)
    val get : getter

    (** Create a config room, with a given id *)
    val create : token -> string -> Firebase.Config_room.t -> unit Lwt.t

    (** Accept a proposed game configuration *)
    val accept : token -> string -> unit Lwt.t

  end


  module Chat : sig
    (** Create an initial chat root *)
    val create : token -> string -> unit Lwt.t
  end

end

module Make (Firebase_primitives : Firebase_primitives.FIREBASE_PRIMITIVES) : FIREBASE_OPS = struct

  (* This will be called in request handlers. We want to return a response even in case of failure, hence the
     result type. We also catch any exception and rethrow it, as we need to rollback the transaction. *)
  let transaction (token : token) (body : unit -> ('a, 'a) result Lwt.t) : 'a Lwt.t =
    let* transaction_id = Firebase_primitives.begin_transaction token in
    try
      let* result = body () in
      match result with
      | Ok result ->
        let* _ = Firebase_primitives.commit token transaction_id in
        Lwt.return result
      | Error result ->
        let* _ = Firebase_primitives.rollback token transaction_id in
        Lwt.return result
    with e ->
      let* _ = Firebase_primitives.rollback token transaction_id in
      raise e

  let get (token : token) (path : string) : JSON.t option Lwt.t =
    try
      let* doc : JSON.t = Firebase_primitives.get_doc token path in
      Lwt.return (Some doc)
    with Error _ -> Lwt.return None

  module User = struct

    let get (token : token) (uid : string) : JSON.t option Lwt.t =
      get token ("users/" ^ uid)
  end

  module Game = struct

    let get (token : token) (game_id : string) : JSON.t option Lwt.t =
      get token ("parts/" ^ game_id)

    let get_name (token : token) (game_id : string) : string option Lwt.t =
      let* doc = get token ("parts/" ^ game_id ^ "?mask=typeGame") in
      let game_name_opt = Option.map (fun json -> JSON.Util.to_string (JSON.Util.member "typeGame" json)) doc in
      Lwt.return game_name_opt

    let create (token : token) (game : Firebase.Game.t) : string Lwt.t =
      let json : JSON.t = Firebase.Game.to_yojson game in
      Firebase_primitives.create_doc token "parts" json

    let delete (token : token) (game_id : string) : unit Lwt.t =
      Firebase_primitives.delete_doc token ("parts/" ^ game_id)

    let update (token : token) (game_id : string) (update : JSON.t) : unit Lwt.t =
      Firebase_primitives.update_doc token ("parts/" ^ game_id) update

    let add_event (token : token) (game_id : string) (event : Firebase.Game.Event.t) : unit Lwt.t =
      let json = Firebase.Game.Event.to_yojson event in
      let* _ = Firebase_primitives.create_doc token ("parts/" ^ game_id ^ "/events") json in
      Lwt.return ()
  end

  module Config_room = struct

    let get (token : token) (game_id : string) : JSON.t option Lwt.t =
      get token ("config-room/" ^ game_id)

    let create (token : token) (id : string) (config_room : Firebase.Config_room.t) : unit Lwt.t =
      let json = Firebase.Config_room.to_yojson config_room in
      let* _ = Firebase_primitives.create_doc token "config-room" ~id json in
      Lwt.return ()

    let accept (token : token) (game_id : string) : unit Lwt.t =
      let update = `Assoc
          [("partStatus", Firebase.Config_room.Game_status.(to_yojson started))] in
      Firebase_primitives.update_doc token ("config-room/" ^ game_id) update

  end

  module Chat = struct

    let create (token : token) (id : string) : unit Lwt.t =
      let chat = `Assoc [] in (* chats are empty, messages are in a sub collection *)
      let* _ = Firebase_primitives.create_doc token "chats" ~id chat in
      Lwt.return ()
  end

end

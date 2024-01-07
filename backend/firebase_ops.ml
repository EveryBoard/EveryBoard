open Utils

(** A getter takes a contextual request and an id, and returns the JSON document if found, None otherwise *)
type getter = Dream.request -> string -> JSON.t option Lwt.t
(** An updater takes a contextual request, an id, and a document update. It updates the corresponding document *)
type updater = Dream.request -> string -> JSON.t -> unit Lwt.t
(** A deleter takes a contextual request and an id, and deletes the corresponding document *)
type deleter = Dream.request -> string -> unit Lwt.t

(** This is the high-level firebase operations for the various data types *)
module type FIREBASE_OPS = sig
  (** Perform a firestore transaction to bundle multiple reads and writes together.
      Firestore's doc states that all reads have to be performed before the writes. *)
  val transaction : Dream.request -> (unit -> ('a, 'a) result Lwt.t) -> 'a Lwt.t

  module User : sig
    (** Retrieve an user as a JSON document, from its id *)
    val get : getter
  end

  module Game : sig
    (** Retrieve a full game as a JSON document, from its id *)
    val get : getter

    (** Get the name of a game if the game exists *)
    val get_name : Dream.request -> string -> string option Lwt.t

    (** Create a game  *)
    val create : Dream.request -> Firebase.Game.t -> string Lwt.t

    (** Delete a game *)
    val delete : deleter

    (** Update the game with partial modifications *)
    val update : updater

    (** Add a game event to a game*)
    val add_event : Dream.request -> string -> Firebase.Game.Event.t -> unit Lwt.t

  end

  module Config_room : sig
    (** Retrieve a config room as a JSON document, from its id *)
    val get : getter

    (** Create a config room, with a given id *)
    val create : Dream.request -> string -> Firebase.Config_room.t -> unit Lwt.t

    (** Accept a proposed game configuration *)
    val accept : Dream.request -> string -> unit Lwt.t

  end


  module Chat : sig
    (** Create an initial chat root *)
    val create : Dream.request -> string -> unit Lwt.t
  end

end

module Make (Firebase_primitives : Firebase_primitives.FIREBASE_PRIMITIVES) : FIREBASE_OPS = struct

  (* This will be called in request handlers. We want to return a response even in case of failure, hence the
     result type. We also catch any exception and rethrow it, as we need to rollback the transaction. *)
  let transaction (request : Dream.request) (body : unit -> ('a, 'a) result Lwt.t) : 'a Lwt.t =
    let* transaction_id = Firebase_primitives.begin_transaction request in
    try
      let* result = body () in
      match result with
      | Ok result ->
        let* _ = Firebase_primitives.commit request transaction_id in
        Lwt.return result
      | Error result ->
        let* _ = Firebase_primitives.rollback request transaction_id in
        Lwt.return result
    with e ->
      let* _ = Firebase_primitives.rollback request transaction_id in
      raise e

  let get (request : Dream.request) (path : string) : JSON.t option Lwt.t =
    try
      let* doc : JSON.t = Firebase_primitives.get_doc request path in
      Lwt.return (Some doc)
    with Error _ -> Lwt.return None

  module User = struct

    let get (request : Dream.request) (uid : string) : JSON.t option Lwt.t =
      get request ("users/" ^ uid)
  end

  module Game = struct

    let get (request : Dream.request) (game_id : string) : JSON.t option Lwt.t =
      get request ("parts/" ^ game_id)

    let get_name (request : Dream.request) (game_id : string) : string option Lwt.t =
      let* doc = get request ("parts/" ^ game_id ^ "?mask=typeGame") in
      let game_name_opt = Option.map (fun json -> JSON.Util.to_string (JSON.Util.member "typeGame" json)) doc in
      Lwt.return game_name_opt

    let create (request : Dream.request) (game : Firebase.Game.t) : string Lwt.t =
      let json : JSON.t = Firebase.Game.to_yojson game in
      Firebase_primitives.create_doc request "parts" json

    let delete (request : Dream.request) (game_id : string) : unit Lwt.t =
      Firebase_primitives.delete_doc request ("parts/" ^ game_id)

    let update (request : Dream.request) (game_id : string) (update : JSON.t) : unit Lwt.t =
      Firebase_primitives.update_doc request ("parts/" ^ game_id) update

    let add_event (request : Dream.request) (game_id : string) (event : Firebase.Game.Event.t) : unit Lwt.t =
      let json = Firebase.Game.Event.to_yojson event in
      let* _ = Firebase_primitives.create_doc request ("parts/" ^ game_id ^ "/events") json in
      Lwt.return ()
  end

  module Config_room = struct

    let get (request : Dream.request) (game_id : string) : JSON.t option Lwt.t =
      get request ("config-room/" ^ game_id)

    let create (request : Dream.request) (id : string) (config_room : Firebase.Config_room.t) : unit Lwt.t =
      let json = Firebase.Config_room.to_yojson config_room in
      let* _ = Firebase_primitives.create_doc request "config-room" ~id json in
      Lwt.return ()

    let accept (request : Dream.request) (game_id : string) : unit Lwt.t =
      let update = `Assoc
          [("partStatus", Firebase.Config_room.Game_status.(to_yojson started))] in
      Firebase_primitives.update_doc request ("config-room/" ^ game_id) update

  end

  module Chat = struct

    let create (request : Dream.request) (id : string) : unit Lwt.t =
      let chat = `Assoc [] in (* chats are empty, messages are in a sub collection *)
      let* _ = Firebase_primitives.create_doc request "chats" ~id chat in
      Lwt.return ()
  end

end

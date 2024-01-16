open Utils

let ( >>= ) = Result.bind

(** A getter takes a contextual request and an id, and returns the document if found, and raises an error otherwise *)
type 'a getter = Dream.request -> string -> 'a Lwt.t
(** An updater takes a contextual request, an id, and a document update. It updates the corresponding document *)
type updater = Dream.request -> string -> JSON.t -> unit Lwt.t
(** A deleter takes a contextual request and an id, and deletes the corresponding document *)
type deleter = Dream.request -> string -> unit Lwt.t

(** This is the high-level firestore operations for the various data types *)
module type FIRESTORE = sig
  (** Perform a firestore transaction to bundle multiple reads and writes together.
      Firestore's doc states that all reads have to be performed before the writes. *)
  val transaction : Dream.request -> (unit -> ('a, 'a) result Lwt.t) -> 'a Lwt.t

  module User : sig
    (** Retrieve an user from its id *)
    val get : Domain.User.t getter
  end

  module Game : sig
    (** Retrieve a full game, from its id *)
    val get : Domain.Game.t getter

    (** Get the name of a game if the game exists *)
    val get_name : Dream.request -> string -> string Lwt.t

    (** Create a game  *)
    val create : Dream.request -> Domain.Game.t -> string Lwt.t

    (** Delete a game *)
    val delete : deleter

    (** Update the game with partial modifications *)
    val update : updater

    (** Add a game event to a game*)
    val add_event : Dream.request -> string -> Domain.Game.Event.t -> unit Lwt.t

  end

  module ConfigRoom : sig
    (** Retrieve a config room as a JSON document, from its id *)
    val get : Domain.ConfigRoom.t getter

    (** Create a config room, with a given id *)
    val create : Dream.request -> string -> Domain.ConfigRoom.t -> unit Lwt.t

    (** Accept a proposed game configuration *)
    val accept : Dream.request -> string -> unit Lwt.t

  end


  module Chat : sig
    (** Create an initial chat root *)
    val create : Dream.request -> string -> unit Lwt.t
  end

end

module Make (FirestorePrimitives : FirestorePrimitives.FIRESTORE_PRIMITIVES) : FIRESTORE = struct

  (* This will be called in request handlers. We want to return a response even in case of failure, hence the
     result type. We also catch any exception and rethrow it, as we need to rollback the transaction. *)
  let transaction (request : Dream.request) (body : unit -> ('a, 'a) result Lwt.t) : 'a Lwt.t =
    let* transaction_id = FirestorePrimitives.begin_transaction request in
    try
      let* result = body () in
      match result with
      | Ok result ->
        let* _ = FirestorePrimitives.commit request transaction_id in
        Lwt.return result
      | Error result ->
        let* _ = FirestorePrimitives.rollback request transaction_id in
        Lwt.return result
    with e ->
      let* _ = FirestorePrimitives.rollback request transaction_id in
      raise e


  let get (request : Dream.request) (path : string) (of_yojson : JSON.t -> ('a, 'b) result) : 'a Lwt.t =
    let get_or_fail (maybe_value : ('a, 'b) result)  : 'a =
      match maybe_value with
      | Ok value -> value
      | Error _ -> raise (DocumentInvalid path) in
    let* doc = FirestorePrimitives.get_doc request path in
    doc
    |> of_yojson
    |> get_or_fail
    |> Lwt.return

  module User = struct

    let get (request : Dream.request) (uid : string) : Domain.User.t Lwt.t =
      get request ("users/" ^ uid) Domain.User.of_yojson
  end

  module Game = struct

    let get (request : Dream.request) (game_id : string) : Domain.Game.t Lwt.t =
      get request ("parts/" ^ game_id) Domain.Game.of_yojson

    let get_name (request : Dream.request) (game_id : string) : string Lwt.t =
      try
        let* doc = FirestorePrimitives.get_doc request ("parts/" ^ game_id ^ "?mask=typeGame") in
        let open JSON.Util in
        doc
        |> member "typeGame"
        |> to_string
        |> Lwt.return
      with JSON.Util.Type_error _ -> raise (DocumentInvalid ("parts/" ^ game_id))

    let create (request : Dream.request) (game : Domain.Game.t) : string Lwt.t =
      let json : JSON.t = Domain.Game.to_yojson game in
      FirestorePrimitives.create_doc request "parts" json

    let delete (request : Dream.request) (game_id : string) : unit Lwt.t =
      FirestorePrimitives.delete_doc request ("parts/" ^ game_id)

    let update (request : Dream.request) (game_id : string) (update : JSON.t) : unit Lwt.t =
      FirestorePrimitives.update_doc request ("parts/" ^ game_id) update

    let add_event (request : Dream.request) (game_id : string) (event : Domain.Game.Event.t) : unit Lwt.t =
      let json = Domain.Game.Event.to_yojson event in
      let* _ = FirestorePrimitives.create_doc request ("parts/" ^ game_id ^ "/events") json in
      Lwt.return ()
  end

  module ConfigRoom = struct

    let get (request : Dream.request) (game_id : string) : Domain.ConfigRoom.t Lwt.t =
      get request ("config-room/" ^ game_id) Domain.ConfigRoom.of_yojson

    let create (request : Dream.request) (id : string) (config_room : Domain.ConfigRoom.t) : unit Lwt.t =
      let json = Domain.ConfigRoom.to_yojson config_room in
      let* _ = FirestorePrimitives.create_doc request "config-room" ~id json in
      Lwt.return ()

    let accept (request : Dream.request) (game_id : string) : unit Lwt.t =
      let update = `Assoc
          [("partStatus", Domain.ConfigRoom.GameStatus.(to_yojson Started))] in
      FirestorePrimitives.update_doc request ("config-room/" ^ game_id) update

  end

  module Chat = struct

    let create (request : Dream.request) (id : string) : unit Lwt.t =
      let chat = `Assoc [] in (* chats are empty, messages are in a sub collection *)
      let* _ = FirestorePrimitives.create_doc request "chats" ~id chat in
      Lwt.return ()
  end

end

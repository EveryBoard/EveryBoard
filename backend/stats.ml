open Utils
open Domain

module type STATS = sig
  (** Remember which action we are doing in order to track reads and writes *)
  val set_action : Dream.request -> string -> unit

  (** Remember which user is doing something in order to track reads and writes *)
  val set_user : Dream.request -> MinimalUser.t -> unit

  (** Remember on which game we are doing the requests *)
  val set_game_id : Dream.request -> string -> unit

  (** Record a read *)
  val read : Dream.request -> unit

  (** Record a write being done on an action by a user *)
  val write : Dream.request -> unit

  (** Endpoint to access the statistics *)
  val summary : Dream.handler
end

module Impl : STATS = struct
  let action_field : string Dream.field =
    Dream.new_field ~name:"action" ()

  let set_action (request : Dream.request) (action : string) =
    Dream.set_field request action_field action

  let user_field : MinimalUser.t Dream.field =
    Dream.new_field ~name:"user" ()

  let set_user (request : Dream.request) (user : MinimalUser.t) =
    Dream.set_field request user_field user

  let game_id_field : string Dream.field =
    Dream.new_field ~name:"game_id" ()

  let set_game_id (request : Dream.request) (game_id : string) =
    Dream.set_field request game_id_field game_id

  type rw_info = {
    reads : int;
    writes : int;
  }
  [@@deriving to_yojson]

  let add_read (rw : rw_info) : rw_info =
    { rw with reads = rw.reads + 1 }

  let add_write (rw : rw_info) : rw_info =
    { rw with writes = rw.writes + 1 }

  type t = {
    total : rw_info ref;
    per_action : (string, rw_info) Hashtbl.t;
    per_user : (string, rw_info) Hashtbl.t;
    per_game : (string, rw_info) Hashtbl.t;
  }

  let to_yojson (stats : t) =
    let hashtbl_to_yojson (h : ('a, rw_info) Hashtbl.t) : JSON.t =
      `Assoc (List.map (fun (k, v) -> (k, rw_info_to_yojson v)) (List.of_seq (Hashtbl.to_seq h))) in
    `Assoc [
      "total", rw_info_to_yojson !(stats.total);
      "per_action", hashtbl_to_yojson stats.per_action;
      "per_user", hashtbl_to_yojson stats.per_user;
      "per_game", hashtbl_to_yojson stats.per_game;
    ]

  let update_hashtbl (h : (string, rw_info) Hashtbl.t) (key : string) (update : rw_info -> rw_info) : unit =
    let new_value = match Hashtbl.find_opt h key with
      | None -> update { reads = 0; writes = 0 }
      | Some rw -> update rw in
    Hashtbl.replace h key new_value

  let state : t = {
      total = ref { reads = 0; writes = 0 };
      per_action = Hashtbl.create 100;
      per_user = Hashtbl.create 100;
      per_game = Hashtbl.create 100;
    }

  let get_field (request : Dream.request) (field : 'a Dream.field) (default : 'a) : 'a =
    Dream.field request field
    |> Option.value ~default

  let no_user : MinimalUser.t = {
    id = "none";
    name = "none";
  }

  let update (update : rw_info -> rw_info) (request : Dream.request) : unit =
    let action = get_field request action_field "none" in
    let user = get_field request user_field no_user in
    let game_id = get_field request game_id_field "none" in
    state.total := update !(state.total);
    update_hashtbl state.per_action action update;
    update_hashtbl state.per_user user.id update;
    update_hashtbl state.per_game game_id update

  let read = update add_read

  let write = update add_write

  let summary : Dream.handler = fun _ ->
    Dream.json ~status:`OK (JSON.to_string (to_yojson state))

end

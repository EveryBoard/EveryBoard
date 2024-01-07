open Utils

module type STATS = sig
  (** Remember which action we are doing in order to track reads and writes *)
  val set_action : Dream.request -> string -> unit

  (** Remember which user is doing something in order to track reads and writes *)
  val set_user : Dream.request -> Firebase.Minimal_user.t -> unit

  (** Record a read *)
  val read : Dream.request -> unit

  (** Record a write being done on an action by a user *)
  val write : Dream.request -> unit

  (** Provide a REST API to access the statistics *)
  val routes : Dream.route list
end

module Impl : STATS = struct
  let action_field : string Dream.field =
    Dream.new_field ~name:"action" ()

  let set_action (request : Dream.request) (action : string) =
    Dream.set_field request action_field action

  let user_field : Firebase.Minimal_user.t Dream.field =
    Dream.new_field ~name:"user" ()

  let set_user (request : Dream.request) (user : Firebase.Minimal_user.t) =
    Dream.set_field request user_field user

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
  }

  let to_yojson (stats : t) =
    let hashtbl_to_yojson h =
      `Assoc (List.map (fun (k, v) -> (k, rw_info_to_yojson v)) (List.of_seq (Hashtbl.to_seq h))) in
    `Assoc [
      "total", rw_info_to_yojson !(stats.total);
      "per_action", hashtbl_to_yojson stats.per_action;
      "per_user", hashtbl_to_yojson stats.per_user;
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
    }

  let get_action (request : Dream.request) : string =
    match Dream.field request action_field with
    | None -> raise (Error "Unexpected: no action stored")
    | Some action -> action

  let get_user (request : Dream.request) : Firebase.Minimal_user.t =
    match Dream.field request user_field with
    | None -> raise (Error "Unexpected: no action stored")
    | Some user -> user

  let read (request : Dream.request) : unit =
    let action = get_action request in
    let user = get_user request in
    state.total := add_read !(state.total);
    update_hashtbl state.per_action action add_read;
    update_hashtbl state.per_user user.name add_read

  let write (request : Dream.request) : unit =
    let action = get_action request in
    let user = get_user request in
    state.total := add_write !(state.total);
    update_hashtbl state.per_action action add_write;
    update_hashtbl state.per_user user.name add_write

  let summary : Dream.route = Dream.get "stats" @@ fun _ ->
    Dream.json ~status:`OK (JSON.to_string (to_yojson state))

  let routes = [summary]
end

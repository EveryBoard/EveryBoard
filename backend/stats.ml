open Utils

module type STATS = sig
  (** Record a read being done on an action by a user *)
  val read : string -> Firebase.Minimal_user.t -> unit

  (** Record a write being done on an action by a user *)
  val write : string -> Firebase.Minimal_user.t -> unit

  (** Provide a summary of the reads and writes as a JSON object *)
  val summary : unit -> JSON.t
end

module Stats : STATS = struct
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

  let read (action : string) (user : Firebase.Minimal_user.t) : unit =
    state.total := add_read !(state.total);
    update_hashtbl state.per_action action add_read;
    update_hashtbl state.per_user user.name add_read

  let write (action : string) (user : Firebase.Minimal_user.t) : unit =
    state.total := add_write !(state.total);
    update_hashtbl state.per_action action add_write;
    update_hashtbl state.per_user user.name add_write

  let summary () =
    to_yojson state
end

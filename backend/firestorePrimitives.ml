open Utils

(** These are the primitive operations that we need to perform on firestore.
    It is a low-level API. *)
module type FIRESTORE_PRIMITIVES = sig

  (** A field that can be added to a request to perform the Firestore action within a transaction *)
  val transaction_field : string Dream.field

  (** Get a document from its path and return it as a JSON *)
  val get_doc : Dream.request -> string -> JSON.t Lwt.t

  (** Create a document, potentially with a specific id (otherwise an id will be assigned by firestore).
      In either case, the document id is returned *)
  val create_doc : Dream.request -> string -> JSON.t -> string Lwt.t

  (** Set a document. Like create, but with an id *)
  val set_doc : Dream.request -> string -> string -> JSON.t -> unit Lwt.t

  (** Update a document from its path and a partial update in JSON *)
  val update_doc : Dream.request -> string -> JSON.t -> unit Lwt.t

  (** Delete a document from its path *)
  val delete_doc : Dream.request -> string -> unit Lwt.t

  (** Begin a transaction and return the transaction id *)
  val begin_transaction : Dream.request -> string Lwt.t

  (** Commit the transaction with the given id *)
  val commit : Dream.request -> string -> unit Lwt.t

  (** Roll back a transaction to cancel everything in it *)
  val rollback : Dream.request -> string -> unit Lwt.t
end

module Make
    (External : External.EXTERNAL)
    (TokenRefresher : TokenRefresher.TOKEN_REFRESHER)
    (Stats : Stats.STATS)
  : FIRESTORE_PRIMITIVES = struct

  let logger = Dream.sub_log "firestore"

  (* We need to keep transaction writes until the transaction is commited. We store them as endpoints and methods.*)
  type transaction_write =
    | Delete of string
    | Update of string * JSON.t

  (* This is where in-progress transactions are stored. Indexed by transaction id. *)
  let transactions : (string, transaction_write list) Hashtbl.t =
    (* We don't expect to have much concurrent transactions, so 4 should be a good guess *)
    Hashtbl.create 4

  let get_transaction (transaction_id : string) : transaction_write list =
    Hashtbl.find transactions transaction_id

  let remove_transaction (transaction_id : string) : unit =
    Hashtbl.remove transactions transaction_id

  let new_transaction (transaction_id : string) : unit =
    Hashtbl.add transactions transaction_id []

  let record_transaction_write (transaction_id : string) (write : transaction_write) =
    let previous_writes = Hashtbl.find transactions transaction_id in
    Hashtbl.add transactions transaction_id (write :: previous_writes)

  let transaction_field : string Dream.field =
    Dream.new_field ~name:"transaction" ()

  let is_error (response : Cohttp.Response.t) =
    Cohttp.Code.is_error (Cohttp.Code.code_of_status response.status)

  let transaction_params (request : Dream.request) : (string * string) list =
    match Dream.field request transaction_field with
    | None -> []
    | Some id -> [("transaction", id)]

  let get_doc (request : Dream.request) (path : string) : JSON.t Lwt.t =
    Stats.read request;
    logger.info (fun log -> log ~request "Getting %s" path);
    let* headers = TokenRefresher.header request in
    let params =
      if !Options.emulator
      then [] (* Somehow, reading in a transaction with the emulator does not work *)
      else transaction_params request in
    let* (response, body) = External.Http.get (endpoint path ~params) headers in
    logger.debug (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (DocumentNotFound path)
    else Lwt.return (of_firestore (JSON.from_string body))

  let get_id_from_firestore_document_name (doc : JSON.t) : string =
    let name = JSON.Util.(doc |> member "name" |> to_string) in
    let elements = String.split_on_char '/' name in
    let id = List.nth elements (List.length elements - 1) in
    id

  let create_doc (request : Dream.request) (collection : string) (doc : JSON.t) : string Lwt.t =
    Stats.write request;
    logger.info (fun log -> log ~request "Creating %s: %s" collection (JSON.to_string doc));
    let* headers = TokenRefresher.header request in
    let firestore_doc = to_firestore doc in
    (* By asking only for _, firestore will not give us the document back, which is what we want *)
    let params = [("mask.fieldPaths", "_")] in
    let endpoint = endpoint ~params collection in
    (* Note: We *can't* create a doc and retrieve its id in a transaction, so we just ignore whether we are in a transaction *)
    let* (response, body) = External.Http.post_json endpoint headers firestore_doc in
    logger.debug (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (UnexpectedError (Printf.sprintf "error on document creation for %s: %s" collection body))
    else Lwt.return (get_id_from_firestore_document_name (JSON.from_string body))

  let update_to_fields_and_firestore (update : JSON.t) : string list * JSON.t =
    let fields = match update with
      | `Assoc key_values -> List.map fst key_values
      | _ -> raise (UnexpectedError "invalid update: should be a Assoc") in
    (fields, to_firestore update)

  let update_doc (request : Dream.request) (path : string) (update : JSON.t) : unit Lwt.t =
    Stats.write request;
    logger.info (fun log -> log ~request "Updating %s with %s" path (JSON.to_string update));
    (* We want only to update what we provide, and we don't care about the response so we provide an empty mask *)
    match Dream.field request transaction_field with
    | Some transaction_id ->
      record_transaction_write transaction_id (Update (path, update));
      Lwt.return ()
    | None ->
      (* Not in a transaction, perform the write *)
      let (fields, firestore_update) = update_to_fields_and_firestore update in
      let update_params = List.map (fun field -> ("updateMask.fieldPaths", field)) fields in
      let params = ("mask.fieldPaths", "_") :: update_params in
      let endpoint = endpoint ~params path in
      let* headers = TokenRefresher.header request in
      let* (response, body) = External.Http.patch_json endpoint headers firestore_update in
      logger.debug (fun log -> log ~request "Response: %s" body);
      if is_error response
      then raise (UnexpectedError (Printf.sprintf "error on document update for %s: %s" path body))
      else Lwt.return ()

  let set_doc (request : Dream.request) (path : string) (id : string) (doc : JSON.t) : unit Lwt.t =
    update_doc request (Printf.sprintf "%s/%s" path id) doc

  let delete_doc (request : Dream.request) (path : string) : unit Lwt.t =
    Stats.write request;
    logger.info (fun log -> log ~request "Deleting %s" path);
    match Dream.field request transaction_field with
    | Some transaction_id ->
      record_transaction_write transaction_id (Delete path);
      Lwt.return ()
    | None ->
      (* Not in a transaction, perform the write *)
      let* headers = TokenRefresher.header request in
      let* (response, body) = External.Http.delete (endpoint path) headers in
      if is_error response
      then raise (UnexpectedError (Printf.sprintf "error on document deletion for %s: %s" path body))
      else Lwt.return ()

  let begin_transaction (request : Dream.request) : string Lwt.t =
    logger.info (fun log -> log ~request "Beginning transaction");
    let* headers = TokenRefresher.header request in
    let endpoint = endpoint ~last_separator:":" "beginTransaction" in
    let* (response, body) = External.Http.post_json endpoint headers (`Assoc []) in
    logger.debug (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (UnexpectedError (Printf.sprintf "error when beginning transaction: %s" body))
    else
      let transaction_id = body
                           |> JSON.from_string
                           |> JSON.Util.member "transaction"
                           |> JSON.Util.to_string in
      new_transaction transaction_id;
      Lwt.return transaction_id

  let commit (request : Dream.request) (transaction_id : string) : unit Lwt.t =
    logger.info (fun log -> log ~request "Committing transaction");
    let transaction = get_transaction transaction_id in
    let* headers = TokenRefresher.header request in
    let endpoint = endpoint ~last_separator:":" "commit" in
    let writes = List.map (function
        | Update (path, json) ->
          let (fields, firestore_update) = update_to_fields_and_firestore json in
          `Assoc [
            "updateMask", `Assoc [
              "fieldPaths", `List (List.map (fun x -> `String x) fields);
            ];
            "update", `Assoc [
              "name", `String (path_in_project path);
              "fields", firestore_update;
            ]
          ]
        | Delete path ->
          `Assoc ["delete", `String (path_in_project path)]
      ) transaction in
    let json = `Assoc [
        "transaction", `String transaction_id;
        "writes", `List writes
      ]  in
    remove_transaction transaction_id;
    let* (response, body) = External.Http.post_json endpoint headers json in
    logger.debug (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (UnexpectedError (Printf.sprintf "error when committing transaction: %s" body))
    else Lwt.return ()

  let rollback (request : Dream.request) (transaction_id : string) : unit Lwt.t =
    logger.info (fun log -> log ~request "Committing transaction");
    remove_transaction transaction_id;
    let* headers = TokenRefresher.header request in
    let endpoint = endpoint ~last_separator:":" "rollback" in
    let json = `Assoc [("transaction", `String transaction_id)] in
    let* (response, body) = External.Http.post_json endpoint headers json in
    logger.debug (fun log -> log ~request "Response: %s" body);
    if is_error response
    then raise (UnexpectedError (Printf.sprintf "error when rolling back transaction: %s" body))
    else Lwt.return ()
end

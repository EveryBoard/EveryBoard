open Utils
module External = External.Impl
module Stats = Stats.Impl
module GoogleCertificates = GoogleCertificates.Make(External)
module Jwt = Jwt.Make(External)
module TokenRefresher = TokenRefresher.Make(External)(Jwt)
module Firestore = Firestore.Make(FirestorePrimitives.Make(External)(TokenRefresher)(Stats))
module Auth = Auth.Make(Firestore)(GoogleCertificates)(Stats)(Jwt)
module Game = Game.Make(External)(Auth)(Firestore)(Stats)
module ConfigRoom = ConfigRoom.Make(External)(Auth)(Firestore)(Stats)

(** A specific endpoint to know the current time of the server *)
let server_time = Dream.get "/time" @@ fun _ ->
    let now = External.now_ms () in
    let response = `Assoc ["time", `Int now] in
    Dream.json ~status:`OK (JSON.to_string response)

(** Catches errors and transforms them before sending them back *)
let error_handler : Dream.error_handler =
    Dream.error_template (fun _error debug_info suggested_response ->
        let body =
            match !Options.show_errors with
            | true -> debug_info
            | false -> Dream.status_to_string (Dream.status suggested_response)
        in
        Dream.set_body suggested_response body;
        Lwt.return suggested_response)

(** The actual backend server, dispatching to various endpoints *)
let start () =
    let api = [
        Dream.scope "/" [TokenRefresher.middleware !Options.service_account_file; Auth.middleware]
        @@ List.concat [
            Game.routes;
            ConfigRoom.routes;
            [server_time];
        ];
    ] in
    Mirage_crypto_rng_lwt.initialize (module Mirage_crypto_rng.Fortuna); (* Required for token refresher and JWT *)
    Dream.initialize_log ~level:`Info ();
    Dream.run ~interface:!Options.address ~error_handler ~port:!Options.port
    @@ Dream.logger
    @@ Cors.middleware
    @@ Dream.router (List.concat [
        [Dream.get "/stats" Stats.summary];
        api])

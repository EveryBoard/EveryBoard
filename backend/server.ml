module External = External.Impl
module ServerUtils = ServerUtils.Make(External)
module Stats = Stats.Impl
module GoogleCertificates = GoogleCertificates.Make(External)
module Jwt = Jwt.Make(External)
module TokenRefresher = TokenRefresher.Make(External)(Jwt)
module Firestore = Firestore.Make(FirestorePrimitives.Make(External)(TokenRefresher)(Stats))
module Auth = Auth.Make(Firestore)(GoogleCertificates)(Stats)(Jwt)
module GameEndpoint = GameEndpoint.Make(External)(Auth)(Firestore)(Stats)
module ConfigRoomEndpoint = ConfigRoomEndpoint.Make(External)(Auth)(Firestore)(Stats)

(** The actual backend server, dispatching to various endpoints *)
let start = fun () : unit ->
    let api = [
        Dream.scope "/" [TokenRefresher.middleware !Options.service_account_file; Auth.middleware]
        @@ List.concat [
            GameEndpoint.routes;
            ConfigRoomEndpoint.routes;
            [Dream.get "/time" ServerUtils.server_time];
        ];
    ] in
    Mirage_crypto_rng_lwt.initialize (module Mirage_crypto_rng.Fortuna); (* Required for token refresher and JWT *)
    Dream.initialize_log ~level:`Info ();
    Dream.run ~interface:!Options.address ~error_handler:ServerUtils.error_handler ~port:!Options.port ~adjust_terminal:false
    @@ Dream.logger
    @@ Cors.middleware
    @@ Dream.router (List.concat [
        [Dream.get "/stats" Stats.summary];
        api])

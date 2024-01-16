open Utils
module External = External.Impl
module Stats = Stats.Impl
module GoogleCertificates = GoogleCertificates.Make(External)
module Jwt = Jwt.Make(External)
module TokenRefresher = TokenRefresher.Make(External)(Jwt)
module Firestore = Firestore.Make(FirestorePrimitives.Make(External)(TokenRefresher)(Stats))
module Auth = Auth.Make(Firestore)(GoogleCertificates)(Stats)(Jwt)
module Game = Game.Make(External)(Auth)(Firestore)(Stats)

let server_time = Dream.get "/time" @@ fun _ ->
    let now = External.now () in
    let response = `Assoc ["time", `Int now] in
    Dream.json ~status:`OK (JSON.to_string response)

let error_catcher : Dream.middleware = fun handler request ->
  try handler request
  with
  | UnexpectedError e ->
    Dream.error (fun log -> log "Encountered unexpected error: %s" e);
    Dream.empty `Internal_Server_Error
  | DocumentInvalid path ->
    Dream.error (fun log -> log "Encountered invalid document: %s" path);
    Dream.empty `Internal_Server_Error
  | DocumentNotFound _ -> Dream.empty `Not_Found
  | BadInput _ -> Dream.empty `Bad_Request

let api = [
    Dream.scope "/" [error_catcher; TokenRefresher.middleware !Options.service_account_file; Auth.middleware]
    @@ List.concat [
      Game.routes;
      [server_time];
    ];
  ]

let start () =
  Mirage_crypto_rng_lwt.initialize (module Mirage_crypto_rng.Fortuna); (* Required for token refresher and JWT *)
  Dream.initialize_log ~level:`Info ();
  Dream.run ~interface:!Options.address ~port:!Options.port
  @@ Dream.logger
  @@ Cors.middleware
  @@ Dream.router (List.concat [
      [Dream.get "/stats" Stats.summary];
      api])

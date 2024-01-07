module GoogleCertificates = GoogleCertificates.Impl
module Jwt = Jwt.Impl
module TokenRefresher = TokenRefresher.Make(Jwt)
module Firestore = Firestore.Make(FirestorePrimitives.Make(TokenRefresher)(Stats.Impl))
module Stats = Stats.Impl
module Auth = Auth.Make(Firestore)(GoogleCertificates)(Stats)(Jwt)
module Game = Game.Make(Auth)(Firestore)(Stats)

let api = [
    Dream.scope "/" [TokenRefresher.middleware !Options.service_account_file; Auth.middleware]
    @@ List.concat [
      Game.routes;
    ];
  ]

let start () =
  Mirage_crypto_rng_lwt.initialize (module Mirage_crypto_rng.Fortuna); (* Required for token refresher and JWT *)
  Dream.initialize_log ~level:`Debug ();
  Dream.run ~interface:!Options.address ~port:!Options.port
  @@ Dream.logger
  @@ Cors.middleware
  @@ Dream.router (List.concat [Stats.routes; api])

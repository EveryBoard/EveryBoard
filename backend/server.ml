module Google_certificates = Google_certificates.Impl
module Jwt = Jwt.Impl
module Token_refresher = Token_refresher.Make(Jwt)
module Firebase_ops = Firebase_ops.Make(Firebase_primitives.Make(Token_refresher)(Stats.Impl))
module Stats = Stats.Impl
module Auth = Auth.Make(Firebase_ops)(Google_certificates)(Stats)(Jwt)
module Game = Game.Make(Auth)(Firebase_ops)(Stats)

let api = [
    Dream.scope "/" [Token_refresher.middleware !Options.service_account_file; Auth.middleware]
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

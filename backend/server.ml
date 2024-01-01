module Google_certificates = Google_certificates.Impl
module Jwt = Jwt.Impl
module Token_refresher = Token_refresher.Make(Jwt)
module Firebase_ops = Firebase_ops.Make(Firebase_primitives.Impl)
module Auth = Auth.Make(Firebase_ops)(Token_refresher)(Google_certificates)(Jwt)
module Game = Game.Make(Auth)(Token_refresher)(Firebase_ops)

let api = [
    Dream.scope "/" [Token_refresher.middleware !Options.service_account_file; Auth.middleware]
    @@ List.concat [
      Game.routes;
    ];
  ]

let start () =
  Mirage_crypto_rng_lwt.initialize (); (* Required for token refresher and jwt *)
  Dream.initialize_log ~level:`Debug ();
  Dream.run ~interface:!Options.address ~port:!Options.port
  @@ Dream.logger
  @@ Cors.middleware
  @@ Dream.router api

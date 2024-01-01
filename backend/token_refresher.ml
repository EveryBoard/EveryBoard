open Utils

module type TOKEN_REFRESHER = sig

  val get_token : Dream.request -> string Lwt.t
  (** Return the access token that can be used to make firebase requests. Refreshes it before if needed *)

  val middleware : string -> Dream.middleware
  (** The middleware that has to be installed in order to use the token refresher *)

end

module Make (Jwt : Jwt.JWT) : TOKEN_REFRESHER = struct

  type token = {
    access_token : string;
    expiration_date : float;
  }

  type service_account = {
    email : string;
    private_key : Mirage_crypto_pk.Rsa.priv;
  }

  let read_service_account_from_file (file : string) : service_account =
    let open Yojson.Basic.Util in
    let json =
      try Yojson.Basic.from_file file
      with Sys_error e -> raise (Error e)
    in
    let private_key = json
                      |> member "private_key"
                      |> to_string
                      |> Cstruct.of_string
                      |> X509.Private_key.decode_pem in
    match private_key with
    | Ok (`RSA pk) ->
      let email = json |> member "client_email" |> to_string in
      { email ; private_key = pk }
    | _ -> raise (Error "Cannot read private key from service account file")

  let request_token (sa : service_account) : token Lwt.t =
    let open Yojson.Basic.Util in
    let scopes = ["https://www.googleapis.com/auth/datastore"] in
    let audience = "https://www.googleapis.com/oauth2/v4/token" in
    let jwt = Jwt.make sa.email sa.private_key scopes audience in
    let endpoint = Uri.of_string "https://oauth2.googleapis.com/token" in
    let params = [("grant_type", ["urn:ietf:params:oauth:grant-type:jwt-bearer"]);
                  ("assertion", [Jwt.to_string jwt])] in
    let now = !External.now () in
    let* (_response, body) = !External.Http.post_form endpoint params in
    let json = Yojson.Basic.from_string body in
    let access_token = json |> member "access_token" |> to_string in
    let expires_in = json |> member "expires_in" |> to_number in
    let expiration_date = now +. expires_in in
    Lwt.return { access_token; expiration_date }

  let request_token_if_outdated (sa : service_account) (token : token) : token Lwt.t =
    let now = !External.now () in
    if now > token.expiration_date then
      request_token sa
    else
      Lwt.return token

  let get_token_field : (unit -> string Lwt.t) Dream.field =
    Dream.new_field ~name:"token" ~show_value:(fun _ -> "ACCESS_TOKEN") ()

  let get_token (request : Dream.request) : string Lwt.t =
    match Dream.field request get_token_field with
    | None -> raise (Error "get_token_field not set, the middleware is probably missing")
    | Some f -> f ()

  let middleware (service_account_file : string) : Dream.middleware =
    let service_account = read_service_account_from_file service_account_file in
    let token_ref = ref None in
    (fun handler request ->
       match Dream.method_ request with
       | `OPTIONS ->
         (* OPTIONS requests are allowed without needing a token *)
         handler request
       | _ ->
         Dream.set_field request get_token_field (fun () ->
             if !Options.emulator then
               (* No need to fetch a google token if we're dealing with the emulator, the string "owner" is sufficient *)
               Lwt.return "owner"
             else
               let* token = match !token_ref with
                 | Some token -> request_token_if_outdated service_account token
                 | None -> request_token service_account in
               token_ref := Some token;
               Lwt.return token.access_token
           );
         handler request)

  end

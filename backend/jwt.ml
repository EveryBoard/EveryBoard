open Utils

module type JWT = sig

  (* A JWT token *)
  type t = {
    header: Yojson.Basic.t; (** The header of the token *)
    payload: Yojson.Basic.t; (** The payload of the token *)
    signature: string; (** The signature of the header + payload *)
  }

  val to_string : t -> string

  val make : string -> Mirage_crypto_pk.Rsa.priv -> string list -> string -> t

  val parse : string -> t

  val verify_and_get_uid : t -> string -> (string * X509.Certificate.t) list -> string
end

module Impl : JWT = struct
  (* A JWT token *)
  type t = {
    header: Yojson.Basic.t; (** The header of the token *)
    payload: Yojson.Basic.t; (** The payload of the token *)
    signature: string; (** The signature of the header + payload *)
  }

  let b64 = Dream.to_base64url

  (** Sign a string with RS256 *)
  let sign (private_key : Mirage_crypto_pk.Rsa.priv) (content : string) : string =
    let pkcs1_sha256 m =  Mirage_crypto_pk.Rsa.PKCS1.sign ~hash:`SHA256 ~key:private_key (`Message m) in
    content
    |> Cstruct.of_string
    |> pkcs1_sha256
    |> Cstruct.to_string

  (** Construct a JWT from an email (iss) private key (pk), a client email, a set of scopes and an audience *)
  let make (iss : string) (pk : Mirage_crypto_pk.Rsa.priv) (scopes : string list) (audience : string) : t =
    let open Yojson.Basic in
    let now = !External.now () in
    Printf.printf "It is now %f\n" now;
    let exp = now +. 3600. in
    let header = `Assoc [
        ("alg", `String "RS256");
        ("typ", `String "JWT");
      ] in
    let header_b64 = b64 (to_string header) in
    let payload = `Assoc [
        ("iss", `String iss);
        ("scope", `String (String.concat " " scopes));
        ("aud", `String audience);
        ("exp", `Float exp);
        ("iat", `Float now);
      ] in
    let payload_b64 = b64 (to_string payload) in
    let header_and_payload = header_b64 ^ "." ^ payload_b64 in
    Printf.printf "%s\n" header_and_payload;
    let signature = sign pk header_and_payload in
    { header; payload; signature }

  (** Transform the token into its string representation *)
  let to_string (token : t) : string =
    Printf.sprintf "%s.%s.%s"
      (Dream.to_base64url (Yojson.Basic.to_string token.header))
      (Dream.to_base64url (Yojson.Basic.to_string token.payload))
      (Dream.to_base64url token.signature)

  (** Parse a token from its string representation. Does NOT validate the signature. *)
  let parse (token : string) : t =
    match String.split_on_char '.' token |> List.map Dream.from_base64url  with
    | [Some header_json; Some payload_json; Some signature] ->
      let header = Yojson.Basic.from_string header_json in
      let payload = Yojson.Basic.from_string payload_json in
      { header; payload; signature }
    | _ -> raise (Error "Invalid token")

  let verify_signature (token : t) (cert : X509.Certificate.t) : bool =
    let only_sha256 = function
      | `SHA256 -> true
      | _ -> false in
    let pkcs1_sha256_verify m signature =
      Mirage_crypto_pk.Rsa.PKCS1.verify ~hashp:only_sha256 ~key:(certificate_key cert) ~signature:signature (`Message m) in
    let header_and_content_b64 = (token.header |> Yojson.Basic.to_string |> b64) ^ "." ^ (token.payload |> Yojson.Basic.to_string |> b64) in
    pkcs1_sha256_verify (Cstruct.of_string header_and_content_b64) (Cstruct.of_string token.signature)

  (** Verify the signature of a JWT according to https://firebase.google.com/docs/auth/admin/verify-id-tokens.
      Depends on the public keys listed at https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
      In case of success, the uid ("sub" field) is returned. *)
  let verify_and_get_uid (token : t) (project_id : string) (certificates : (string * X509.Certificate.t) list) : string =
    let check (field : string) (cond : unit -> bool) : unit =
      Dream.log "checking field %s" field;
      if cond () then () else raise (Error (Printf.sprintf "Token verification failed, field %s is invalid" field)) in
    let now = !External.now () in
    let open Yojson.Basic.Util in
    let number (json : Yojson.Basic.t) (field : string) : float = to_number (member field json) in
    let str (json : Yojson.Basic.t) (field : string) : string = to_string (member field json) in
    Dream.log "token is %s %s" (Yojson.Basic.to_string token.header) (Yojson.Basic.to_string token.payload);
    (* algorithm must be RS256 *)
    check "alg" (fun () ->
        if !Options.emulator then
          (* The emulator doesn't sign the tokens *)
          str token.header "alg" = "none"
        else
          str token.header "alg" = "RS256");
    (* key must be one of the valid keys *)
    check "kid" (fun () ->
        if !Options.emulator then
          (* The emulator doesn't provide a key with the token *)
          true
        else
          List.mem (str token.header "kid") (List.map fst certificates));
    (* expiration must be in the future *)
    check "exp" (fun () -> now <= number token.payload "exp");
    (* "issued-at-time" must be in the past *)
    check "iat" (fun () -> number token.payload "iat" <= now);
    (* audience must be the firebase project id *)
    check "aud" (fun () -> str token.payload "aud" = project_id);
    (* issuer must be a specific url *)
    check "iss" (fun () -> str token.payload "iss" =  ("https://securetoken.google.com/" ^ project_id));
    (* subject must be a non empty string *)
    check "sub" (fun () -> String.length (str token.payload "sub") > 0);
    (* authentication time must be in the past *)
    check "auth_time" (fun () -> number token.payload "auth_time" <= now);
    (* check the signature against the key *)
    check "signature" (fun () ->
        (* We know the kid corresponds to an actual certificate from the kid check *)
        if !Options.emulator then
          (* The emulator doesn't sign the tokens *)
          true
        else
          let cert = List.assoc (str token.header "kid") certificates in
          verify_signature token cert);
    (* If everything has succeeded, we can extract the uid from the "sub" field *)
    str token.payload "sub"
end

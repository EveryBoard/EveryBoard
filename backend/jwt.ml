open Utils
open CryptoUtils

(** This module manages JSON Web Tokens (JWT), which are used to authentify
    ourselves to the firestore server, and to authentify users to ourselves. *)
module type JWT = sig

  (** [InvalidToken] is raised if at some point we encounter an invalid token *)
  exception InvalidToken

  (* A JWT token *)
  type t = {
    header: JSON.t; (** The header of the token *)
    payload: JSON.t; (** The payload of the token *)
    signature: string; (** The signature of the header + payload *)
  }

  (** [to_string token] converts a token to its string representation that is
      suitable to be passed around to another service *)
  val to_string : t -> string

  (** [make email private_key scopes audience] creates a new token from an
      email, a private key, a set of scopes, and an audience *)
  val make : string -> private_key -> string list -> string -> t

  (** [parse str] parses an existing token from its string representation.
      Raises [InvalidToken] in case the token can't be parsed. The signature of
      the token is NOT validated at this point. *)
  val parse : string -> t

  (** [verify_and_get_uid token kid certificates] verifies that a token has been
      signed by the certificates with key id [kid]. Raises [InvalidToken] in
      case it is not valid. *)
  val verify_and_get_uid : t -> string -> (string * CryptoUtils.public_key) list -> string
end

module Make (External : External.EXTERNAL) : JWT = struct
  exception InvalidToken

  type t = {
    header: JSON.t; (** The header of the token *)
    payload: JSON.t; (** The payload of the token *)
    signature: string; (** The signature of the header + payload *)
  }

  let b64 = Dream.to_base64url

  (** Sign a string with RS256 *)
  let sign (private_key : private_key) (content : string) : string =
    let pkcs1_sha256 m =  Mirage_crypto_pk.Rsa.PKCS1.sign ~hash:`SHA256 ~key:private_key (`Message m) in
    content
    |> Cstruct.of_string
    |> pkcs1_sha256
    |> Cstruct.to_string

  (** Construct a JWT from an email [iss] private key [pk], a set of scopes
      [scopes] and an audience [audience] *)
  let make (iss : string) (pk : private_key) (scopes : string list) (audience : string) : t =
    let open JSON in
    let now = External.now () in
    let exp = now + 3600 in
    let header = `Assoc [
        ("alg", `String "RS256");
        ("typ", `String "JWT");
      ] in
    let header_b64 = b64 (to_string header) in
    let payload = `Assoc [
        ("iss", `String iss);
        ("scope", `String (String.concat " " scopes));
        ("aud", `String audience);
        ("exp", `Int exp);
        ("iat", `Int now);
      ] in
    let payload_b64 = b64 (to_string payload) in
    let header_and_payload = header_b64 ^ "." ^ payload_b64 in
    let signature = sign pk header_and_payload in
    { header; payload; signature }

  (** Transform the token into its string representation *)
  let to_string (token : t) : string =
    Printf.sprintf "%s.%s.%s"
      (Dream.to_base64url (JSON.to_string token.header))
      (Dream.to_base64url (JSON.to_string token.payload))
      (Dream.to_base64url token.signature)

  (** Parse a token from its string representation. Does NOT validate the signature. *)
  let parse (token : string) : t =
    match String.split_on_char '.' token |> List.map Dream.from_base64url  with
    | [Some header_json; Some payload_json; Some signature] ->
      let header = JSON.from_string header_json in
      let payload = JSON.from_string payload_json in
      { header; payload; signature }
    | _ -> raise InvalidToken

  let verify_signature (token : t) (pk : CryptoUtils.public_key) : bool =
    let only_sha256 = function
      | `SHA256 -> true
      | _ -> false in
    let pkcs1_sha256_verify m signature =
      Mirage_crypto_pk.Rsa.PKCS1.verify ~hashp:only_sha256 ~key:pk ~signature:signature (`Message m) in
    let header_and_content_b64 = (token.header |> JSON.to_string |> b64) ^ "." ^ (token.payload |> JSON.to_string |> b64) in
    pkcs1_sha256_verify (Cstruct.of_string header_and_content_b64) (Cstruct.of_string token.signature)

  (** Verify the signature of a JWT according to https://firebase.google.com/docs/auth/admin/verify-id-tokens.
      Depends on the public keys listed at https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
      In case of success, the uid ("sub" field) is returned. *)
  let verify_and_get_uid (token : t) (project_id : string) (pks : (string * CryptoUtils.public_key) list) : string =
    let check (_field : string) (cond : unit -> bool) : unit =
      if cond () then () else raise InvalidToken in
    let now = External.now () in
    let open JSON.Util in
    let number (json : JSON.t) (field : string) : int = to_int (member field json) in
    let str (json : JSON.t) (field : string) : string = to_string (member field json) in
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
          List.mem_assoc (str token.header "kid") pks);
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
          let pk = List.assoc (str token.header "kid") pks in
          verify_signature token pk);
    (* If everything has succeeded, we can extract the uid from the "sub" field *)
    str token.payload "sub"
end

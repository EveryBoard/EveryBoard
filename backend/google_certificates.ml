open Utils

module type GOOGLE_CERTIFICATES = sig

  val get : unit -> (string * X509.Certificate.t) list Lwt.t
  (** Retrieve the Google certificates. Uses cached versions if there are any *)

  val clear : unit -> unit
  (** Clear the cached certificates. Useful for tests only *)
end

module Impl : GOOGLE_CERTIFICATES = struct

  (** Parses the Cache-Control header of a response to extract the max-age field *)
  let parse_max_age (cache_control : string) : float =
    let extract (regexp : Str.regexp) (s : string) : string =
      if Str.string_match regexp s 0 then
        Str.matched_group 1 s
      else raise (Error "missing or invalid max-age") in
    cache_control
    |> extract (Str.regexp ".*max-age=\\([0-9]+\\),.*")
    |> Float.of_string

  (** Fetches the certificates listed at https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
      Returns the certificates and their expiration time (as a unix timestamp). *)
  let get_certificates () : ((string * X509.Certificate.t) list * float) Lwt.t =
    let endpoint = Uri.of_string "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com" in
    let no_headers = Cohttp.Header.init () in
    let* (response, body_string) = !External.Http.get endpoint no_headers in
    let body_content = Yojson.Basic.from_string body_string in
    let max_age : float = match Cohttp.Header.get response.headers "Cache-Control" with
      | Some cache_control ->
        parse_max_age cache_control
      | None -> raise (Error "No cache-control in response") in
    let certificates = match body_content with
      | `Assoc assoc when List.length assoc > 1 ->
        List.map (fun (id, cert) -> (id, read_certificate (Yojson.Basic.Util.to_string cert))) assoc
      | _ -> raise (Error "No certificates returned") in
    Lwt.return (certificates, !External.now () +. max_age)

  (** This contains the certificates that will be used when verifying a token *)
  let certificates_ref : ((string * X509.Certificate.t) list * float) ref =
    ref ([], 0.)

  (** Update the certificates stored in certificates_ref *)
  let update_certificates () : (string * X509.Certificate.t) list Lwt.t =
    let* (keys, expiration) = get_certificates () in
    certificates_ref := (keys, expiration);
    Lwt.return keys

  let get () : (string * X509.Certificate.t) list Lwt.t =
    let now = !External.now () in
    match !certificates_ref with
    | (_, expiration) when expiration < now ->
      update_certificates ()
    | (certificates, _) ->
      Lwt.return certificates

  let clear () =
    certificates_ref := ([], 0.)
end

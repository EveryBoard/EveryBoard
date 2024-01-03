exception Error of string

module JSON = struct
  include Yojson.Safe
  let to_yojson (json : t) : t = json
  let of_yojson (json : t) : (t, string) result = Ok json
end

let ( let* ) = Lwt.bind

let read_certificate (pem : string) : X509.Certificate.t =
  let public_key = pem
                   |> Cstruct.of_string
                   |> X509.Certificate.decode_pem
                   in
  match public_key with
  | Ok cert ->
    begin match X509.Certificate.public_key cert with
      | `RSA _ -> cert
      | _ -> raise (Error "Certificate does not contain an RSA public key")
    end
  | _ -> raise (Error "Invalid certificate")

let certificate_key (cert : X509.Certificate.t) : Mirage_crypto_pk.Rsa.pub =
  match X509.Certificate.public_key cert with
  | `RSA key -> key
  | _ -> raise (Error "Certificate does not contain an RSA public key")


let fail (status : Dream.status) (reason : string) : Dream.response Lwt.t =
  Dream.respond ~status
    (JSON.to_string (`Assoc [
        "reason", `String reason
      ]))

let fail_transaction (status : Dream.status) (reason : string) : (Dream.response, Dream.response) result Lwt.t =
  let* response = fail status reason in
  Lwt.return (Result.Error response)

let json_response (status : Dream.status) (response : JSON.t) : Dream.response Lwt.t =
  let headers = [("Content-Type", "application/json")] in
  Dream.respond ~headers ~status (JSON.to_string response)

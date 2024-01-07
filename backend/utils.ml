exception Error of string

type public_key = Mirage_crypto_pk.Rsa.pub
type private_key = Mirage_crypto_pk.Rsa.priv

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

let certificate_key (cert : X509.Certificate.t) : public_key =
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


let endpoint ?(version = "v1beta1") ?(params = []) ?(last_separator = "/") (path : string) : Uri.t =
  let url = Uri.of_string (!Options.base_endpoint ^ "/" ^ version ^
                           "/projects/" ^ !Options.project_name ^
                           "/databases/" ^ !Options.database_name ^
                           "/documents" ^ last_separator ^ path) in
  Uri.with_query' url params


let authorization_header (access_token : string) : string * string =
  ("Authorization", "Bearer " ^ access_token)

let rec of_firestore (json : JSON.t) : JSON.t =
  let extract_field ((key, value) : (string * JSON.t)) : (string * JSON.t) = (key, match value with
    | `Assoc [("mapValue", v)] -> of_firestore v
    | `Assoc [(_, v)] -> v (* We just rely on the real type contained, not on the type name from firestore *)
    | _-> raise (Error ("Invalid firestore JSON: unexpected value when extracting field: " ^ (JSON.to_string value)))) in
  match JSON.Util.member "fields" json with
  | `Assoc fields -> `Assoc (List.map extract_field fields)
  | _ -> raise (Error ("Invalid firestore JSON: not an object: " ^ (JSON.to_string json)))

let to_firestore ?(path : string option) (doc : JSON.t) : JSON.t  =
  (* Types of values are documented here: https://cloud.google.com/firestore/docs/reference/rest/Shared.Types/ArrayValue#Value *)
  let rec transform_field (v : JSON.t) : JSON.t = match v with
      | `String v -> `Assoc [("stringValue", `String v)]
      | `Bool v -> `Assoc [("boolValue", `Bool v)]
      | `Intlit v -> `Assoc [("integerValue", `String v)]
      | `Null -> `Assoc [("nullValue", `Null)]
      | `Assoc fields -> `Assoc [("mapValue", `Assoc [("fields", `Assoc (List.map transform_key_and_field fields))])]
      | `List v -> `Assoc [("arrayValue", `Assoc [("values", `List (List.map transform_field v))])]
      | `Float v -> `Assoc [("doubleValue", `Float v)]
      | `Int v -> `Assoc [("integerValue", `String (string_of_int v))]
      | _ -> raise (Error ("Invalid object for firestore: unsupported field: " ^ (JSON.to_string v)))
  and transform_key_and_field (key, field) : (string * JSON.t) = (key, transform_field field) in
  let doc_with_fields : JSON.t = match doc with
    | `Assoc fields -> `Assoc (List.map transform_key_and_field fields)
    | _ -> raise (Error "Invalid object for firestore") in
  let name = match path with
    | Some p -> [("name", `String ("projects/" ^ !Options.project_name ^ "/databases/" ^ !Options.database_name ^ "/documents/" ^ p))]
    | None -> [] in
  `Assoc (name @ [("fields", doc_with_fields)])

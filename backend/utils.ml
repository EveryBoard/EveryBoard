(** [UnexpectedError reason] is raised upon unexpected errors *)
exception UnexpectedError of string

(** [DocumentNotFound path] is raised when a firestore document is missing. This will
    result in a [`Not_Found] response from our end *)
exception DocumentNotFound of string

(** [DocumentInvalid path] is raised when a firestore document exists but can't be
    converted to the proper type. This will result in a [`Not_Found] response from
    our end, as it's like the document does not exist. *)
exception DocumentInvalid of string

(** [BadInput input] is raised when the client did not include the correct information
    as part of their request *)
exception BadInput of string

type public_key = Mirage_crypto_pk.Rsa.pub
type private_key = Mirage_crypto_pk.Rsa.priv

module JSON = struct
  include Yojson.Safe
  let to_yojson (json : t) : t = json
  let of_yojson (json : t) : (t, string) result = Ok json

  (** Helper to define conversion for enum-like variants, as ppx-yojson's conversion is not what we want here *)
  let for_enum (values : ('a * string) list) : ('a -> t) * (t -> ('a, string) result) =
    let inversed_values = List.map (fun (x, y) -> (y, x)) values in
    let enum_to_yojson v = `String (List.assoc v values) in
    let enum_of_yojson json = match json with
      | `String json_string ->
        begin match List.assoc_opt json_string inversed_values with
          | Some v -> Ok v
          | None -> Error "not a member of the enum"
        end
      | _ -> Error "not a string" in
    (enum_to_yojson, enum_of_yojson)

  (** Helper similar to [for_enum], but for conversion to ints *)
  let for_enum_int (values : ('a * int) list) : ('a -> t) * (t -> ('a, string) result) =
    let inversed_values = List.map (fun (x, y) -> (y, x)) values in
    let enum_to_yojson v = `Int (List.assoc v values) in
    let enum_of_yojson json = match json with
      | `Int json_int ->
        begin match List.assoc_opt json_int inversed_values with
          | Some v -> Ok v
          | None -> Error "not a member of the enum"
        end
      | _ -> Error "not a string" in
    (enum_to_yojson, enum_of_yojson)
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
      | _ -> raise (UnexpectedError "Certificate does not contain an RSA public key")
    end
  | _ -> raise (UnexpectedError "Invalid certificate")

let certificate_key (cert : X509.Certificate.t) : public_key =
  match X509.Certificate.public_key cert with
  | `RSA key -> key
  | _ -> raise (UnexpectedError "Certificate does not contain an RSA public key")


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
    | `Assoc [("integerValue", `String v)] -> `Int (int_of_string v)
    | `Assoc [(_, v)] -> v (* We just rely on the real type contained, not on the type name from firestore *)
    | _-> raise (UnexpectedError ("Invalid firestore JSON: unexpected value when extracting field: " ^ (JSON.to_string value)))) in
  match json with
  | `Assoc [] -> `Assoc []
  | `Assoc _ -> begin match JSON.Util.member "fields" json with
      | `Assoc fields -> `Assoc (List.map extract_field fields)
      | _ -> raise (UnexpectedError ("Invalid firestore JSON: not an object: " ^ (JSON.to_string json)))
    end
  | _ -> raise (UnexpectedError ("Invalid firestore JSON: not an object: " ^ (JSON.to_string json)))

let to_firestore ?(path : string option) (doc : JSON.t) : JSON.t  =
  (* Types of values are documented here: https://cloud.google.com/firestore/docs/reference/rest/Shared.Types/ArrayValue#Value *)
  let rec transform_field (v : JSON.t) : JSON.t = match v with
      | `String v -> `Assoc [("stringValue", `String v)]
      | `Bool v -> `Assoc [("booleanValue", `Bool v)]
      | `Intlit v -> `Assoc [("integerValue", `String v)]
      | `Null -> `Assoc [("nullValue", `Null)]
      | `Assoc fields -> `Assoc [("mapValue", `Assoc [("fields", `Assoc (List.map transform_key_and_field fields))])]
      | `List v -> `Assoc [("arrayValue", `Assoc [("values", `List (List.map transform_field v))])]
      | `Float v -> `Assoc [("doubleValue", `Float v)]
      | `Int v -> `Assoc [("integerValue", `String (string_of_int v))]
      | _ -> raise (UnexpectedError ("Invalid object for firestore: unsupported field: " ^ (JSON.to_string v)))
  and transform_key_and_field (key, field) : (string * JSON.t) = (key, transform_field field) in
  let doc_with_fields : JSON.t = match doc with
    | `Assoc fields -> `Assoc (List.map transform_key_and_field fields)
    | _ -> raise (UnexpectedError "Invalid object for firestore") in
  let name = match path with
    | Some p -> [("name", `String ("projects/" ^ !Options.project_name ^ "/databases/" ^ !Options.database_name ^ "/documents/" ^ p))]
    | None -> [] in
  `Assoc (name @ [("fields", doc_with_fields)])


let get_json_param (request : Dream.request) (field : string) : (Yojson.Safe.t, string) result =
  match Dream.query request field with
  | None -> Error "parameter missing"
  | Some value ->
    try Ok (Yojson.Safe.from_string value)
    with Yojson.Json_error error -> Error error

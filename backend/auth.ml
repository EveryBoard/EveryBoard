open Utils
open DreamUtils

(** This module provides a middleware that ensures that the user making a request to the backend is authenticated. *)
module type AUTH = sig

  (** Return the user that has made the request *)
  val get_user : Dream.request -> (string * Domain.User.t)

  (** Return the minimal user of the user that has made the request *)
  val get_minimal_user : Dream.request -> Domain.MinimalUser.t

  (** The middleware that checks authentication *)
  val middleware : Dream.middleware

end

module Make
    (Firestore : Firestore.FIRESTORE)
    (GoogleCertificates : GoogleCertificates.GOOGLE_CERTIFICATES)
    (Stats : Stats.STATS)
    (Jwt : Jwt.JWT)
    : AUTH = struct

  (** This field contains the Firebase user that has been authenticated for the current request *)
  let user_field : (string * Domain.User.t) Dream.field =
    Dream.new_field ~name:"user" ()

  let get_user (request : Dream.request) : (string * Domain.User.t) =
    match Dream.field request user_field with
    | None -> raise (UnexpectedError "No user stored. Is the Auth middleware missing?")
    | Some user -> user

  let get_minimal_user (request : Dream.request) : Domain.MinimalUser.t =
    let (uid, user) = get_user request in
    Domain.User.to_minimal_user uid user

  let middleware : Dream.middleware = fun handler request ->
    (* The client should make a request with a token that was generated as follows:
        var token = await FirebaseAuth.instance.currentUser().getIdToken(); *)
    (* Check that we received a token from the client. *)
    match Dream.header request "Authorization" with
    | None ->
      fail `Unauthorized "Authorization token is missing"
    | Some authorization ->
      (* Check the token validity *)
      match String.split_on_char ' ' authorization with
      | ["Bearer"; user_token] ->
        let* certificates = GoogleCertificates.get () in
        begin match Jwt.verify_and_get_uid (Jwt.parse user_token) !Options.project_id certificates with
          | exception Jwt.InvalidToken ->
            fail `Unauthorized "Authorization token is invalid"
          | uid ->
            try
              let* user = Firestore.User.get request uid in
              if user.verified then begin
                (* The user has a verified account, so we can finally call the handler *)
                Dream.set_field request user_field (uid, user);
                Stats.set_user request (Domain.User.to_minimal_user uid user);
                handler request
              end else
                fail `Unauthorized "User is not verified"
            with DocumentNotFound _ | DocumentInvalid _ ->
              fail `Unauthorized "User is invalid"
        end
      | _ -> fail `Unauthorized "Authorization header is invalid"

end

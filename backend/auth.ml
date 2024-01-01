open Utils

module type AUTH = sig

  val get_user : Dream.request -> (string * Firebase.User.t)

  val middleware : Dream.middleware

end

module Make
    (Firebase_ops : Firebase_ops.FIREBASE_OPS)
    (Token_refresher : Token_refresher.TOKEN_REFRESHER)
    (Google_certificates : Google_certificates.GOOGLE_CERTIFICATES)
    (Jwt : Jwt.JWT)
    : AUTH = struct

  (** This field contains the Firebase user that has been authenticated for the current request *)
  let user_field : (string * Firebase.User.t) Dream.field =
    Dream.new_field ~name:"user" ()

  let get_user (request : Dream.request) : (string * Firebase.User.t) =
    match Dream.field request user_field with
    | None -> raise (Error "Unexpected: no user stored. Is the Auth middleware missing?")
    | Some user -> user

  let middleware : Dream.middleware = fun handler request ->
  (* The client will make a request with a token that was generated as follows:
        var token = await FirebaseAuth.instance.currentUser().getIdToken();
  *)
    (* Check that we received a token from the client. *)
    match Dream.header request "Authorization" with
    | None ->
      fail `Unauthorized "Authorization token is missing"
    | Some authorization ->
      (* Check the token validity *)
      match String.split_on_char ' ' authorization with
      | ["Bearer"; user_token] ->
        Dream.log "Checking token";
        let* certificates = Google_certificates.get () in
        begin match Jwt.verify_and_get_uid (Jwt.parse user_token) !Options.project_id certificates with
          | exception _ ->
            fail `Unauthorized "Authorization token is invalid"
          | uid ->
            Dream.log "Checking user";
            let* token = Token_refresher.get_token request in
            let* user = Firebase_ops.get_user token uid in
            Dream.log "Got user user";
            match user with
            | None ->
              Dream.log "not exists ";
              fail `Unauthorized "User does not exist"
            | Some user when user.verified = false ->
              Dream.log "not verified ";
              fail `Unauthorized "User is not verified"
            | Some user ->
              (* The user has a verified account, so we can finally call the handler *)
              Dream.set_field request user_field (uid, user);
              Dream.log "Authorized!";
              handler request
        end
      | _ -> fail `Unauthorized "Authorization header is invalid"

end

open Backend
open Utils

module External = External.Impl

let create_user (email : string) : unit Lwt.t =
    let url = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=unknown" in
    let credential_json = `Assoc [
        "sub", `String email;
        "email", `String email;
        "email_verified", `Bool true;
    ] in
    let credential = Dream.to_percent_encoded (JSON.to_string credential_json) in
    let json = `Assoc [
        "requestUri", `String "http://localhost";
        "returnSecureToken", `Bool true;
        "postBody", `String ("&id_token=" ^ credential ^ "&providerId=google.com");
    ] in
    let no_headers = Cohttp.Header.init () in
    let* response = External.Http.post_json (Uri.of_string url) no_headers json in
    Printf.printf "%s\n" (snd response);
    Lwt.return ()

let tests = [
    (* Register user https://firebase.google.com/docs/reference/rest/auth *)
    (* Set user to verified with admin? Check ConnectedUserService.spec.ts *)

    (*    await userDAO.set(credential.user.uid, { verified: false, currentGame: null });
          if (username != null) {
            // This needs to happen in multiple updates to match the security rules
            await userDAO.update(credential.user.uid, { username });
            await userDAO.update(credential.user.uid, { verified: true }); *)
    (* Perform a request on a dummy route but with the full stack of middlewares *)
]

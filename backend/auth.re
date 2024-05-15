open Utils;
open DreamUtils;

/** This module provides a middleware that ensures that the user making a
    request to the backend is authenticated. */
module type AUTH = {
  /** [get_user request] returns the user that has made the request */
  let get_user: Dream.request => Domain.User.t;

  /** [get_minimal_user request] returns the minimal user of the user that has made the request */
  let get_minimal_user: Dream.request => Domain.MinimalUser.t;

  /** [get_uid] returns the user id of the user that has made the request */
  let get_uid: Dream.request => string;

  /** The middleware that checks authentication */
  let middleware: Dream.middleware;
};

module Make =
       (
         Firestore: Firestore.FIRESTORE,
         GoogleCertificates: GoogleCertificates.GOOGLE_CERTIFICATES,
         Stats: Stats.STATS,
         Jwt: Jwt.JWT,
       )
       : AUTH => {
  /** This field contains the Firebase user that has been authenticated for the current request, as well as its id */
  let user_field: Dream.field((string, Domain.User.t)) =
    // This is just a tag that we will store with a value alongside requests when handling them
    Dream.new_field(~name="user", ());

  let get_user_field = (request: Dream.request): (string, Domain.User.t) => {
    switch (Dream.field(request, user_field)) {
    | None => raise(UnexpectedError("No user stored. Is the Auth middleware missing?"));
    | Some(uid_and_user) => uid_and_user;
    };
  };

  let get_user = (request: Dream.request): Domain.User.t => {
    let (_, user) = get_user_field(request);
    user;
  };

  let get_uid = (request: Dream.request): string => {
    let (uid, _) = get_user_field(request);
    uid;
  };

  let get_minimal_user = (request: Dream.request): Domain.MinimalUser.t => {
    let (uid, user) = get_user_field(request);
    Domain.User.to_minimal_user(uid, user);
  };

  exception AuthError(string);
  /* This is the middleware. It receives a handler that will handle the request after us, and the request itself */
  let middleware: Dream.middleware = (handler: Dream.handler, request: Dream.request) => {
    /* The client should make a request with a token that was generated as follows:
       var token = await FirebaseAuth.instance.currentUser().getIdToken(); */
    /* Extract the Authorization header */
    let check_everything_and_process_request = () => {
      let authorization_header = switch (Dream.header(request, "Authorization")) {
        | None => raise(AuthError("Authorization token is missing"));
        | Some(authorization) => authorization;
      };
      /* Extract the bearer token from the header */
      let user_token = switch (String.split_on_char(' ', authorization_header)) {
        | ["Bearer", user_token] => user_token;
        | _ => raise(AuthError("Authorization header is invalid"));
      };
      /* Parse the token */
      let parsed_token = switch (Jwt.parse(user_token)) {
        | None => raise(AuthError("Authorization token is invalid"));
        | Some(token) => token;
      };
      /* Check the token validity */
      let* certificates = GoogleCertificates.get();
      let uid = switch (Jwt.verify_and_get_uid(parsed_token, Options.project_id^, certificates)) {
        | None => raise(AuthError("Authorization token is invalid"));
        | Some(uid) => uid;
      };
      /* Get the user and check its verification status */
      let* user = Firestore.User.get(request, uid);
      if (user.verified) {
        /* The user has a verified account, so we can finally call the handler */
        Dream.set_field(request, user_field, (uid, user));
        Stats.set_user(request, Domain.User.to_minimal_user(uid, user));
        handler(request);
      } else {
        raise(AuthError("User is not verified"));
      }
    };
    try (check_everything_and_process_request ()) {
      | AuthError(reason) => fail(`Unauthorized, reason);
      | DocumentNotFound(_) | DocumentInvalid(_) => fail(`Unauthorized, "User is invalid");
    }
  };
};

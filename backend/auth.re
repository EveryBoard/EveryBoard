open Utils;
open DreamUtils;

/** This module provides a middleware that ensures that the user making a
    request to the backend is authenticated. */
module type AUTH = {
  /** Return the user that has made the request */
  let get_user: Dream.request => (string, Domain.User.t);

  /** Return the minimal user of the user that has made the request */
  let get_minimal_user: Dream.request => Domain.MinimalUser.t;

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
  /** This field contains the Firebase user that has been authenticated for the current request */
  let user_field: Dream.field((string, Domain.User.t)) =
    Dream.new_field(~name="user", ());

  let get_user = (request: Dream.request): (string, Domain.User.t) => {
    switch (Dream.field(request, user_field)) {
    | None =>
      raise(
        UnexpectedError("No user stored. Is the Auth middleware missing?"),
      )
    | Some(user) => user
    };
  };

  let get_minimal_user = (request: Dream.request): Domain.MinimalUser.t => {
    let (uid, user) = get_user(request);
    Domain.User.to_minimal_user(uid, user);
  };

  let middleware: Dream.middleware =
    (handler: Dream.handler, request: Dream.request) => {
      /* The client should make a request with a token that was generated as follows:
         var token = await FirebaseAuth.instance.currentUser().getIdToken(); */
      /* Check that we received a token from the client. */
      switch (Dream.header(request, "Authorization")) {
      | None => fail(`Unauthorized, "Authorization token is missing")
      | Some(authorization) =>
        switch (String.split_on_char(' ', authorization)) {
        | ["Bearer", user_token] =>
          /* Check the token validity */
          let* certificates = GoogleCertificates.get();
          switch (
            Jwt.verify_and_get_uid(
              Jwt.parse(user_token),
              Options.project_id^,
              certificates,
            )
          ) {
          | exception Jwt.InvalidToken =>
            fail(`Unauthorized, "Authorization token is invalid")
          | uid =>
            let extract_user = () => {
              /* Check that the user exists and is verified */
              let* user = Firestore.User.get(request, uid);
              if (user.verified) {
                /* The user has a verified account, so we can finally call the handler */
                Dream.set_field(request, user_field, (uid, user));
                Stats.set_user(
                  request,
                  Domain.User.to_minimal_user(uid, user),
                );
                handler(request);
              } else {
                fail(`Unauthorized, "User is not verified");
              };
            };
            try(extract_user()) {
            | DocumentNotFound(_)
            | DocumentInvalid(_) => fail(`Unauthorized, "User is invalid")
            };
          };
        | _ => fail(`Unauthorized, "Authorization header is invalid")
        }
      };
    };
};

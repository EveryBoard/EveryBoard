open Utils

(** This middleware is used for Cross-Origin Request Sharing (CORS). It lets the
    clients know which HTTP methods are authorized when they do preflight
    requests. We have to allow CORS requests because the backend and frontend
    are not on the same domain (i.e., origin). *)
let middleware : Dream.middleware = fun handler request ->
  match Dream.method_ request with
  | `OPTIONS ->
    let headers = [
      ("Access-Control-Allow-Origin", !Options.frontend_origin);
      ("Access-Control-Allow-Methods", "GET, POST, HEAD, PATCH, DELETE");
      ("Access-Control-Allow-Headers", "Authorization");
      (* This enables browsers to cache this response for up to 24 hours, avoiding many OPTIONS requests *)
      ("Access-Control-Max-Age", "86400");
    ] in
    Dream.empty ~headers `No_Content
  | _ ->
    let* response = handler request in
    Dream.add_header response "Access-Control-Allow-Origin" !Options.frontend_origin;
    Lwt.return (response)

open Utils

let middleware : Dream.middleware = fun handler request ->
  match Dream.method_ request with
  | `OPTIONS ->
    (* We allow CORS requests as the backend and frontend are not on the same domain *)
    let headers = [
      (* TODO: should probably add some caching stuff here *)
      ("Access-Control-Allow-Origin", !Options.frontend_origin);
      ("Access-Control-Allow-Methods", "GET, POST, HEAD, PATCH");
      ("Access-Control-Allow-Headers", "Authorization");
    ] in
    Dream.respond ~status:`No_Content ~headers ""
  | _ ->
    let* response = handler request in
    Dream.add_header response "Access-Control-Allow-Origin" !Options.frontend_origin;
    Lwt.return (response)

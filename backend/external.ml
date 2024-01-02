open Utils
(** This module contains functions that rely on the external world.
    This allows us to mock them in our test *)

let now : (unit -> float) ref = ref Unix.time

(** These are functions to perform HTTP requests *)
module Http = struct
  let get : (Uri.t -> Cohttp.Header.t -> (Cohttp.Response.t * string) Lwt.t) ref = ref (fun endpoint headers ->
      (* Printf.printf "curl '%s' -H '%s'" (Uri.to_string endpoint) (Cohttp.Header.to_string headers); *)
      let* (response, body) = Cohttp_lwt_unix.Client.get ~headers endpoint in
      let* body_string = Cohttp_lwt.Body.to_string body in
      Lwt.return (response, body_string))

  let post_form : (Uri.t -> (string * string list) list -> (Cohttp.Response.t * string) Lwt.t) ref = ref (fun endpoint params ->
      let* (response, body) = Cohttp_lwt_unix.Client.post_form ~params endpoint in
      let* body_string = Cohttp_lwt.Body.to_string body in
      Lwt.return (response, body_string))

  let post_json : (Uri.t -> Cohttp.Header.t -> Yojson.Safe.t -> (Cohttp.Response.t * string) Lwt.t) ref = ref (fun endpoint headers json ->
      let headers = Cohttp.Header.add headers "Content-Type" "application/json" in
      let body = `String (Yojson.Safe.to_string json) in
      let* (response, body) = Cohttp_lwt_unix.Client.post ~headers endpoint ~body in
      let* body_string = Cohttp_lwt.Body.to_string body in
      Lwt.return (response, body_string))

  let patch_json : (Uri.t -> Cohttp.Header.t -> Yojson.Safe.t -> (Cohttp.Response.t * string) Lwt.t) ref = ref (fun endpoint headers json ->
      let headers = Cohttp.Header.add headers "Content-Type" "application/json" in
      let body = `String (Yojson.Safe.to_string json) in
      let* (response, body) = Cohttp_lwt_unix.Client.patch ~headers endpoint ~body in
      let* body_string = Cohttp_lwt.Body.to_string body in
      Lwt.return (response, body_string))

  let delete : (Uri.t -> Cohttp.Header.t -> unit Lwt.t) ref = ref (fun endpoint headers ->
      let _ = Cohttp_lwt_unix.Client.delete ~headers endpoint in
      Lwt.return ())
end

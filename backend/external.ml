open Utils
(** This module contains functions that rely on the external world.
    This allows us to mock them in our test *)

module type EXTERNAL = sig
  (** Provide the current timestamp in seconds *)
  val now : unit -> int

  (** Provide a random boolean *)
  val rand_bool : unit -> bool

  module Http : sig
    (** Perform a GET request and return the response with its body *)
    val get : Uri.t -> Cohttp.Header.t -> (Cohttp.Response.t  * string) Lwt.t

    (** Perform a POST request for a form, with the given params and return the response with its body *)
    val post_form : Uri.t -> (string * string list) list -> (Cohttp.Response.t * string) Lwt.t

    (** Perform a POST request with a JSON body and return the response with its body *)
    val post_json : Uri.t -> Cohttp.Header.t -> JSON.t -> (Cohttp.Response.t * string) Lwt.t

    (** Perform a PATCH request with a JSON body and return the response with its body *)
    val patch_json : Uri.t -> Cohttp.Header.t -> JSON.t -> (Cohttp.Response.t * string) Lwt.t

    (** Perform a DELETE request *)
    val delete : Uri.t -> Cohttp.Header.t -> Cohttp.Response.t Lwt.t

  end
end

module Impl : EXTERNAL = struct

  let now () = int_of_float (Unix.time ())

  let rand_bool () = Random.bool ()

  module Http = struct
    let get (endpoint : Uri.t) (headers : Cohttp.Header.t) : (Cohttp.Response.t * string) Lwt.t =
      let* (response, body) = Cohttp_lwt_unix.Client.get ~headers endpoint in
      let* body_string = Cohttp_lwt.Body.to_string body in
      Lwt.return (response, body_string)

    let post_form (endpoint : Uri.t) (params : (string * string list) list) : (Cohttp.Response.t * string) Lwt.t =
        let* (response, body) = Cohttp_lwt_unix.Client.post_form ~params endpoint in
        let* body_string = Cohttp_lwt.Body.to_string body in
        Lwt.return (response, body_string)

    let post_json (endpoint : Uri.t) (headers : Cohttp.Header.t) (json : JSON.t) : (Cohttp.Response.t * string) Lwt.t =
        let headers = Cohttp.Header.add headers "Content-Type" "application/json" in
        let body = `String (JSON.to_string json) in
        let* (response, body) = Cohttp_lwt_unix.Client.post ~headers endpoint ~body in
        let* body_string = Cohttp_lwt.Body.to_string body in
        Lwt.return (response, body_string)

    let patch_json (endpoint : Uri.t) (headers : Cohttp.Header.t) (json : JSON.t) : (Cohttp.Response.t * string) Lwt.t =
      let headers = Cohttp.Header.add headers "Content-Type" "application/json" in
      let body = `String (JSON.to_string json) in
      let* (response, body) = Cohttp_lwt_unix.Client.patch ~headers endpoint ~body in
      let* body_string = Cohttp_lwt.Body.to_string body in
      Lwt.return (response, body_string)

    let delete (endpoint : Uri.t) (headers : Cohttp.Header.t) : Cohttp.Response.t Lwt.t =
        let* (response, _) = Cohttp_lwt_unix.Client.delete ~headers endpoint in
        Lwt.return response
  end
end
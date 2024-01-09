open Alcotest
open Alcotest_lwt
open Backend
open Utils

let test (name : string) (f : unit -> unit) =
  test_case name `Quick (fun _ () -> Lwt.return (f ()))

let lwt_test (name : string) (f : unit -> unit Lwt.t) =
  test_case name `Quick (fun _ -> f)

let lwt_check_raises (name : string) (exn : exn) (f : unit -> unit Lwt.t) =
  try
    Lwt.bind (f ()) (fun _ ->
        Lwt.fail (Failure (Printf.sprintf "test %s should have failed but succeeded" name)))
  with
  | exn' when exn' = exn -> Lwt.return () (* all good! *)
  | exn' -> Lwt.fail (Failure (Printf.sprintf "test %s should have failed with %s but failed with %s"
                              name
                              (Printexc.to_string exn)
                              (Printexc.to_string exn')))

let status : Dream.status testable =
  let pp ppf status = Fmt.pf ppf "%s" (Dream.status_to_string status) in
  testable pp (=)

let certificate : X509.Certificate.t testable =
  let pp ppf cert = Fmt.pf ppf "%s" (X509.Certificate.encode_pem cert |> Cstruct.to_string) in
  testable pp (=)

let json : JSON.t testable =
  let pp ppf json = Fmt.pf ppf "%s" (JSON.to_string json) in
  testable pp (=)

let user : Domain.User.t testable =
  let pp ppf user = Fmt.pf ppf "%s" (Option.value ~default:"" Domain.User.(user.username)) in
  testable pp (=)

let minimal_user : Domain.MinimalUser.t testable =
  let pp (ppf : Format.formatter) (user : Domain.MinimalUser.t) : unit =
    Fmt.pf ppf "%s:%s" user.id user.name in
  testable pp (=)

let lwt_check_response (name : string) (expected : Dream.response) (actual : Dream.response) : unit Lwt.t =
  let actual_status = Dream.status actual in
  let* actual_body = Dream.body actual in
  let expected_status = Dream.status expected in
  let* expected_body = Dream.body expected in
  check status name expected_status actual_status;
  check string name expected_body actual_body;
  Lwt.return ()


(* TODO: remove  *)
let get_mock response_headers response_status body = fun _ _ ->
  Lwt.return
    (Cohttp.Response.make ~version:(`Other "2") ~status:response_status ~headers:response_headers (),
     body)

(* TODO remove *)
let post_form_mock headers body : (Uri.t -> (string * string list) list -> (Cohttp.Response.t * string) Lwt.t) = fun _ _ ->
  Lwt.return
    (Cohttp.Response.make ~version:(`Other "2") ~status:`OK ~headers (),
     body)

type 'a mock = {
  number_of_calls: int ref;
  calls : 'a list ref
}

let ok_response headers =
  Cohttp.Response.make ~version:(`Other "2") ~status:`OK ~headers ()

let not_found_response =
  Cohttp.Response.make ~version:(`Other "2") ~status:`Not_found ()

let http_query : (Dream.method_ * Uri.t) testable =
  let pp ppf (method_, url) = Fmt.pf ppf "%s at %s" (Dream.method_to_string method_) (Uri.to_string url) in
  testable pp (=)

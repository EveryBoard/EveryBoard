open Alcotest
open Alcotest_lwt
open Backend
open Utils

let test (name : string) (f : unit -> unit) =
    test_case name `Quick (fun _ () -> Lwt.return (f ()))

let lwt_test (name : string) (f : unit -> unit Lwt.t) =
    test_case name `Quick (fun _ -> f)

let lwt_check_raises (name : string) (check_exn : exn -> bool) (f : unit -> unit Lwt.t) =
    try
        Lwt.bind (f ()) (fun _ ->
            Lwt.fail (Failure (Printf.sprintf "test %s should have failed but succeeded" name)))
    with
    | exn when check_exn exn  -> Lwt.return () (* all good! *)
    | exn -> Lwt.fail (Failure (Printf.sprintf "test %s failed but with the wrong exception: %s"
                                    name
                                    (Printexc.to_string exn)))

let status : Dream.status testable =
    let pp ppf status = Fmt.pf ppf "%s" (Dream.status_to_string status) in
    testable pp (=)

let public_key : CryptoUtils.public_key testable =
    let pp ppf _cert = Fmt.pf ppf "<public key>" in
    testable pp (=)

let json_eq : JSON.t testable =
    let pp ppf json = Fmt.pf ppf "%s" (JSON.to_string json) in
    testable pp (=)

let user_eq : Domain.User.t testable =
    let pp ppf user = Fmt.pf ppf "%s" (Option.value ~default:"" Domain.User.(user.username)) in
    testable pp (=)

let game_eq : Domain.Game.t testable =
    let pp ppf game = Fmt.pf ppf "%s" (JSON.to_string (Domain.Game.to_yojson game)) in
    testable pp (=)

let config_room_eq : Domain.ConfigRoom.t testable =
    let pp ppf game = Fmt.pf ppf "%s" (JSON.to_string (Domain.ConfigRoom.to_yojson game)) in
    testable pp (=)

let minimal_user_eq : Domain.MinimalUser.t testable =
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

type 'a mock = {
    number_of_calls: int ref;
    calls : 'a list ref
}

let response ?(headers:Cohttp.Header.t = Cohttp.Header.init ()) status =
    Cohttp.Response.make ~version:(`Other "2") ~status ~headers ()

let http_query : (Dream.method_ * Uri.t * JSON.t option) testable =
    let pp ppf (method_, url, body) =
        Fmt.pf ppf "%s at %s with %s"
            (Dream.method_to_string method_)
            (Uri.to_string url)
            (body |> Option.map JSON.to_string |> Option.value ~default:"nothing")
    in
    testable pp (=)

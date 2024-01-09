open Backend
open Utils
open TestUtils

module type MOCK = sig
  include External.EXTERNAL

  (** Override this to change the current time *)
  val current_time : float ref

  module Http : sig
    include module type of Http
    val mock_response : (Cohttp.Response.t * string) -> (Dream.method_ * Uri.t) mock
  end
end

module Mock : MOCK = struct

  let current_time = ref 0.

  let now () = !current_time

  module Http = struct
    let mock = { number_of_calls = ref 0; calls = ref [] }
    let response = ref (Cohttp.Response.make ~version:(`Other "2") ~status:`OK ~headers:(Cohttp.Header.init ()) (), "")

    let mock_response mocked_response =
      mock.number_of_calls := 0;
      mock.calls := [];
      response := mocked_response;
      mock

    let mocked request endpoint () =
      mock.number_of_calls := !(mock.number_of_calls) + 1;
      mock.calls := (request, endpoint) :: !(mock.calls);
      Lwt.return !response
    let get endpoint _ = mocked `GET endpoint ()
    let post_form endpoint _ = mocked `POST endpoint ()
    let post_json endpoint _ _ = mocked `POST endpoint ()
    let patch_json endpoint _ _ =  mocked `PATCH endpoint ()
    let delete endpoint _ =
      let* _ = mocked `DELETE endpoint () in
      Lwt.return ()
  end

end


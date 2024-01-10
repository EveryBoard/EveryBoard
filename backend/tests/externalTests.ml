open Backend
open Utils
open TestUtils

module type MOCK = sig
  include External.EXTERNAL

  (** Override this to change the current time *)
  val current_time : float ref

  module Http : sig
    include module type of Http
    (* When mocking a response, a mock is created and holds the method, the endpoint called,
       and the provided JSON body if one was provided *)
    val mock_response : (Cohttp.Response.t * string) -> (Dream.method_ * Uri.t * JSON.t option) mock
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

    let mocked request endpoint body =
      mock.number_of_calls := !(mock.number_of_calls) + 1;
      mock.calls := (request, endpoint, body) :: !(mock.calls);
      Lwt.return !response
    let get endpoint _ = mocked `GET endpoint None
    let post_form endpoint _ = mocked `POST endpoint None
    let post_json endpoint _ body = mocked `POST endpoint (Some body)
    let patch_json endpoint _ body =  mocked `PATCH endpoint (Some body)
    let delete endpoint _ =
      let* (response, _) = mocked `DELETE endpoint None in
      Lwt.return response
  end

end


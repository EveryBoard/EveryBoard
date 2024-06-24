open Backend
open Utils
open TestUtils

module type MOCK = sig
    include External.EXTERNAL

    (** The current time in seconds, returned by [now] *)
    val current_time_seconds : int ref

    (** The random boolean returned by [rand_bool] *)
    val bool : bool ref

    module Http : sig
        include module type of Http
        (* When mocking a response, a mock is created and holds the method, the endpoint called,
           and the provided JSON body if one was provided *)
        val mock_response : (Cohttp.Response.t * string) -> (Dream.method_ * Uri.t * JSON.t option) mock
    end
end

module Mock : MOCK = struct

    let current_time_seconds = ref 0

    let bool = ref true

    let now () = !current_time_seconds

    let now_ms () = !current_time_seconds * 1000

    let rand_bool () = !bool

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
        let get ?headers:_ endpoint = mocked `GET endpoint None
        let post_form ~params:_ endpoint = mocked `POST endpoint None
        let post_json ?headers:_ body endpoint  = mocked `POST endpoint (Some body)
        let patch_json ?headers:_ body endpoint =  mocked `PATCH endpoint (Some body)
        let delete ?headers:_ endpoint = mocked `DELETE endpoint None
    end

end


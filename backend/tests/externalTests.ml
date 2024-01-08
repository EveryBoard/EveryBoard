open Backend
open Utils
open TestUtils

module type MOCK = sig
  include External.EXTERNAL

  (** Override this to change the current time *)
  val current_time : float ref

  module Http : sig
    include module type of Http
    val mock_response : (Cohttp.Response.t * string) -> mock
  end
end

module Mock : MOCK = struct

  let current_time = ref 0.

  let now () = !current_time

  module Http = struct
    let mock = { number_of_calls = ref 0 }
    let response = ref (Cohttp.Response.make ~version:(`Other "2") ~status:`OK ~headers:(Cohttp.Header.init ()) (), "")

    let mock_response mocked_response =
      mock.number_of_calls := 0;
      response := mocked_response;
      mock


    let mocked () =
      mock.number_of_calls := !(mock.number_of_calls) + 1;
      Lwt.return !response
    let get _ _ = mocked ()
    let post_form _ _ = mocked ()
    let post_json _ _ _ = mocked ()
    let patch_json _ _ _ =  mocked()
    let delete _ _ =
      let* _ = mocked () in
      Lwt.return ()
  end

end

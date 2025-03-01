open Utils

module type SERVER_UTILS = sig
    (** [error_handler] is an error handler that catches exception and puts them in a nice JSON *)
    val error_handler : Dream.error_handler
end

module Make (External : External.EXTERNAL) : SERVER_UTILS = struct

    (** Catches errors and transforms them before sending them back *)
    let error_handler : Dream.error_handler =
        Dream.error_template (fun (error : Dream.error) (debug_info : string) (suggested_response : Dream.response) : Dream.response Lwt.t ->
            let debug =
                if !Options.show_errors then
                    [("debug", `String debug_info)]
                else
                    [] in
            let* suggested_body = Dream.body suggested_response in
            let response = match error.condition with
                | `Exn (Errors.BadInput reason) ->
                    Dream.set_status suggested_response `Bad_Request;
                    [("reason", `String reason)]
                | `Exn (Errors.DocumentNotFound document) ->
                    Dream.set_status suggested_response `Not_Found;
                    [("reason", `String "not_found"); ("document", `String document)]
                | `Exn (Errors.DocumentInvalid document) ->
                    Dream.set_status suggested_response `Internal_Server_Error;
                    [("reason", `String "invalid_doc"); ("document", `String document)]
                | _ ->
                    [("reason", `String suggested_body)] in
            Dream.set_body suggested_response (JSON.to_string (`Assoc (response @ debug)));
            Lwt.return suggested_response)
end

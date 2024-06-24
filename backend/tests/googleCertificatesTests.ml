open Alcotest
open TestUtils
open Backend
open Utils

module type MOCK = sig
    include GoogleCertificates.GOOGLE_CERTIFICATES
    val certificates : (string * string) list ref
end

module Mock : MOCK = struct
    type certificates = (string * CryptoUtils.public_key) list

    let certificates = ref [
        ("be7823ef01bd4d2b962741658d20807efee6de5c",
         "-----BEGIN CERTIFICATE-----\nMIIDHDCCAgSgAwIBAgIIM+9g59Wj+1QwDQYJKoZIhvcNAQEFBQAwMTEvMC0GA1UE\nAwwmc2VjdXJldG9rZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wHhcNMjMx\nMjA4MDczMjAzWhcNMjMxMjI0MTk0NzAzWjAxMS8wLQYDVQQDDCZzZWN1cmV0b2tl\nbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBAJiHnPHbqpbAAgt/iNO2CqFWdt47JugLIQ62v06OoCdoJq8t\nquqZGWmbp8H9g4R9onLZzwy6h8MzJrev0JZqYaQ2e1cjygOv7jDU3mf/B0rVuRw7\nkopAjgFDBS9yTa3FeqIfYDGq54rI0+A0vmVJHIKbyvu5BhUK1nyfWw8WXc1NrXb6\nyLl6WDJl3EA7wRf4FzAjy9B47a+uxmE4L4tEp+QxrY5eY8+tZfAcqcQbinuNwnYI\nU5wQkBUc1fNyHXZyXIx+2WdGHrBdPNeUynbERtlYYDBY8RC43quPU6aHgzubxOwO\n89uoiI57dL/pny1eIwbfk5jU1cnuSKbvInGPUnECAwEAAaM4MDYwDAYDVR0TAQH/\nBAIwADAOBgNVHQ8BAf8EBAMCB4AwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwIwDQYJ\nKoZIhvcNAQEFBQADggEBAEtYpaWFwie3gj3Lgq3T7oYlsWrIlXSDiUE2XGdeSXIb\nfU/dMA1rMisGaqgzJ8fvMylQIggfPMNzef/ycu0SKmEvc5Dp7GuhfiBeOS67pAX2\n70NMkBjusv6J2N36N33rH0Qrzf7ok2JdR80JHDSBRY4MOmxfq4/HGyIuC1iP42Qb\nDoFqUenUEBZ81PzuD2QokgCInv8FxKDwjjFVnkHbaOTGMddxKF5lfPvJ8Tlgx7rj\n3AwRiKa9CIIrSGc+PKOIObLhybgUf/9SRAwAsNyRj3AkuQzgwhisQe5Wv6y45xBj\nQG6Dh5kTdw7/ECkweYRIB2G4qfnOuiLcz/H/kVv3AUM=\n-----END CERTIFICATE-----\n");
        ("032cc1cb289dd4626a435d72989ae43212defe78",
         "-----BEGIN CERTIFICATE-----\nMIIDHTCCAgWgAwIBAgIJAInoyDZA9itYMA0GCSqGSIb3DQEBBQUAMDExLzAtBgNV\nBAMMJnNlY3VyZXRva2VuLnN5c3RlbS5nc2VydmljZWFjY291bnQuY29tMB4XDTIz\nMTIxNjA3MzIwNFoXDTI0MDEwMTE5NDcwNFowMTEvMC0GA1UEAwwmc2VjdXJldG9r\nZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqGSIb3DQEBAQUA\nA4IBDwAwggEKAoIBAQDSXU+Cs60axpdXWc1He+K2ZN1ZMGFwae+gQejx0K6Vj1BW\nG/ZWXa7zwBHvkPjAfSUL7KWxbkTPWjMplUYKJwiQc8kXQffIBnp499m4EAuaq42k\nuLlxgDjgSRYIwNLTBsM3X97/ymcqfRNqQnKUAgsSSzmfYUqyNgbSQY7GrfdR9RSE\nNT2igff6613sn6lSiokZ/9mNxd3A4Gtf6J3inG8jNI4yTO4hdtqWoZ0AZt9E3cN3\n8KN7UWXkfWiuaKEfdpew3YsU9H31GO3EvWwpvonQBZOWik/ZhwkDRXjBnTLXel9+\nanpzZK1iWCRU2/BvdypDCgtTFDZYZGimEYeijnLNAgMBAAGjODA2MAwGA1UdEwEB\n/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMCMA0G\nCSqGSIb3DQEBBQUAA4IBAQCC86r0A58kd2zxsX5hbMONr1//eIbNTKppxQ9a5cyx\nXaddCiN/pu+RitXRjEdka24zskMXChjOa2eVDL+C4pGSp5q43v6W0qCjJZHFr/+K\nNGk6zvKrpLBVKspyzxu1g/A1GjI2XLt6Frbvt3MsQtvh4Ih6DSVEJG/8pRNa9UJs\nZ/MaSdwYC1xe1v1WlfwE7nJSWBV6xX/nGAE3Zg6sROmTLKKIsz99Uvi1A71CWyup\nLOf+P0R5q1k5jMPmVCx2Usd+V6esVWCudgRltgc7EsxwHkWQzt+vYIMOpZHcbedu\nwjwrEjOFdlk36dRwI8HWNecz4x2cn9bfr8ixAvzu6/ek\n-----END CERTIFICATE-----\n");
    ]

    let keys () = List.map (fun (kid, pem) -> (kid, CryptoUtils.public_key_of_certificate_string pem)) !certificates

    let get () = Lwt.return (keys ())

    let clear () = ()

end

module GoogleCertificates = GoogleCertificates.Make(ExternalTests.Mock)

let certificates = !Mock.certificates

let certificates_json =
    `Assoc (List.map (fun (kid, cert) ->
        (kid, `String cert))
        !Mock.certificates)

let tests = [

    "GoogleCertificates.get", [
        lwt_test "should request new certificates and return them" (fun () ->
            GoogleCertificates.clear ();
            (* Given a google server that will answer with some certificates *)
            ExternalTests.Mock.current_time_seconds := 42;
            let max_age = 22745 in
            let headers = Cohttp.Header.of_list [("Cache-Control",
                                                  Printf.sprintf "public, max-age=%d, must-revalidate, no-transform" max_age)] in
            let body = JSON.to_string certificates_json in
            let mock = ExternalTests.Mock.Http.mock_response (response ~headers `OK, body) in
            (* When calling get *)
            let* actual = GoogleCertificates.get () in
            (* Then it returns the certificates *)
            let* expected = Mock.get () in
            check int "number of requests" 1 !(mock.number_of_calls);
            check (list (pair string public_key)) "success" expected actual;
            Lwt.return ()
        );

        lwt_test "should return cached certificates if they are not expired" (fun () ->
            GoogleCertificates.clear ();
            (* Given a google server that will answer with some certificates that we have already retrieved *)
            ExternalTests.Mock.current_time_seconds := 42;
            let max_age = 22745 in
            let headers = Cohttp.Header.of_list [("Cache-Control",
                                                  Printf.sprintf "public, max-age=%d, must-revalidate, no-transform" max_age)] in
            let body = JSON.to_string certificates_json in
            let mock = ExternalTests.Mock.Http.mock_response (response ~headers `OK, body) in
            let* first_requested = GoogleCertificates.get () in
            (* When getting the certificates again *)
            let* second_requested = GoogleCertificates.get () in
            (* Then it should have made a single request, and should return the same certificates *)
            check (list (pair string public_key)) "values" first_requested second_requested;
            check int "number of requests" 1 !(mock.number_of_calls);
            Lwt.return ()
        );

        lwt_test "should fail if the server has no max-age in their cache-control" (fun () ->
            GoogleCertificates.clear ();
            (* Given a google server that will answer with some certificates but no max-age in their cache-control *)
            ExternalTests.Mock.current_time_seconds := 42;
            let headers = Cohttp.Header.of_list [("Cache-Control",
                                                  "public, must-revalidate, no-transform")] in
            let body = JSON.to_string certificates_json in
            let _ = ExternalTests.Mock.Http.mock_response (response ~headers `OK, body) in
            (* When getting the certificates *)
            (* Then it should fail *)
            lwt_check_raises "failure" ((=) (UnexpectedError "missing or invalid max-age")) (fun () ->
                let* _ = GoogleCertificates.get () in Lwt.return ())
        );

        lwt_test "should fail if max-age is not an int" (fun () ->
            GoogleCertificates.clear ();
            (* Given a google server that will answer with some certificates but an invalid max-age *)
            ExternalTests.Mock.current_time_seconds := 42;
            let headers = Cohttp.Header.of_list [("Cache-Control",
                                                  "public, max-age=lol, must-revalidate, no-transform")] in
            let body = JSON.to_string certificates_json in
            let _ = ExternalTests.Mock.Http.mock_response (response ~headers `OK, body) in
            (* When getting the certificates *)
            (* Then it should fail *)
            lwt_check_raises "failure" ((=) (UnexpectedError "missing or invalid max-age")) (fun () ->
                let* _ = GoogleCertificates.get () in Lwt.return ())
        );

        lwt_test "should fail if there is no cache-control" (fun () ->
            GoogleCertificates.clear ();
            (* Given a google server that will answer with some certificates but no cache-control *)
            ExternalTests.Mock.current_time_seconds := 42;
            let headers = Cohttp.Header.init () in
            let body = JSON.to_string certificates_json in
            let _ = ExternalTests.Mock.Http.mock_response (response ~headers `OK, body) in
            (* When getting the certificates *)
            (* Then it should fail *)
            lwt_check_raises "failure" ((=) (UnexpectedError "No cache-control in response")) (fun () ->
                let* _ = GoogleCertificates.get () in Lwt.return ())
        );

        lwt_test "should fail if the server doesn't return any certificate" (fun () ->
            GoogleCertificates.clear ();
            (* Given a google server that will answer with no certificates *)
            ExternalTests.Mock.current_time_seconds := 42;
            let max_age = 22745. in
            let headers = Cohttp.Header.of_list [("Cache-Control",
                                                  Printf.sprintf "public, max-age=%.0f, must-revalidate, no-transform" max_age)] in
            let body = "{}" in
            let _ = ExternalTests.Mock.Http.mock_response (response ~headers `OK, body) in
            (* When getting the certificates *)
            (* Then it should fail *)
            lwt_check_raises "failure" ((=) (UnexpectedError "No certificates returned")) (fun () ->
                let* _ = GoogleCertificates.get () in Lwt.return ())
        );

    ];

]

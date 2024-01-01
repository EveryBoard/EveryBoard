let () =
  Lwt_main.run (Alcotest_lwt.run "Backend" (List.concat [
      Google_certificates_tests.tests;
      Auth_tests.tests;
      Jwt_tests.tests;
      Token_refresher_tests.tests;
      Firebase_primitives_tests.tests;
      Firebase_ops_tests.tests;
      Firebase_tests.tests;
      Integration_tests.tests;
    ]))

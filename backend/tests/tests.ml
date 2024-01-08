let () =
  Lwt_main.run (Alcotest_lwt.run "Backend" (List.concat [
      GoogleCertificatesTests.tests;
      (* AuthTests.tests;
      JwtTests.tests;
      TokenRefresherTests.tests;
      FirestorePrimitivesTests.tests;
      FirestoreTests.tests;
      DomainTests.tests;
         IntegrationTests.tests; *)
    ]))

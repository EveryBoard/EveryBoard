let () =
  (* Need to initialize crypto for some tests *)
  Mirage_crypto_rng_lwt.initialize (module Mirage_crypto_rng.Fortuna);
  Backend.Options.emulator := false;
  Lwt_main.run (Alcotest_lwt.run "Backend" (List.concat [
      GoogleCertificatesTests.tests;
      JwtTests.tests;
      (* AuthTests.tests;
      TokenRefresherTests.tests;
      FirestorePrimitivesTests.tests;
      FirestoreTests.tests;
      DomainTests.tests;
         IntegrationTests.tests; *)
    ]))

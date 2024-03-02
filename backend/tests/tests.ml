let () =
  (* Need to initialize crypto for some tests *)
  Mirage_crypto_rng_lwt.initialize (module Mirage_crypto_rng.Fortuna);
  Backend.Options.emulator := false;
  Lwt_main.run @@ Alcotest_lwt.run "unit tests" @@ List.concat [
    UtilsTests.tests;
    DomainTests.tests;
    StatsTests.tests;
    GoogleCertificatesTests.tests;
    JwtTests.tests;
    TokenRefresherTests.tests;
    FirestorePrimitivesTests.tests;
    FirestoreTests.tests;
    AuthTests.tests;
    CorsTests.tests;
    ConfigRoomTests.tests;
    (* TODO: GameTests.tests *)
    (* TODO: server tests *)
  ]

    (* TODO: integration tests, basically check with emulator for jwt & firestore. The actual use cases should be handled by e2e tests probably?
  Alcotest_lwt.run "integration tests" @@ List.concat [
      JwtTests.tests;
      (* TODO: tests with emulators *)
      (* TODO: IntegrationTests.tests *)
    ]
 *)

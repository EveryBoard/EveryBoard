let () =
  (* Need to initialize crypto for some tests *)
  Mirage_crypto_rng_lwt.initialize (module Mirage_crypto_rng.Fortuna);
  Backend.Options.emulator := false;
  Lwt_main.run @@ Alcotest_lwt.run "unit tests" @@ List.concat [
    (* TODO: DomainTests.tests *)
    (* TODO: ExternalTests.tests *)
    StatsTests.tests;
    GoogleCertificatesTests.tests;
    JwtTests.tests;
    TokenRefresherTests.tests;
    FirestorePrimitivesTests.tests;
    (* TODO: FirestoreTests.tests *)
    (* TODO: AuthTests.tests *)
    (* TODO: GameTests.tests *)
  ]

(* TODO: integration tests
  Alcotest_lwt.run "integration tests" @@ List.concat [
      JwtTests.tests;
      (* TODO: tests with emulators *)
      (* TODO: IntegrationTests.tests *)
    ]
 *)

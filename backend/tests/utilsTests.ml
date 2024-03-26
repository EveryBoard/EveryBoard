open Alcotest
open TestUtils
open Backend
open Utils

let foobar : [`Foo | `Bar] testable =
  let pp ppf v = Fmt.pf ppf "%s" (match v with `Foo -> "Foo" | `Bar -> "Bar") in
  testable pp (=)

let describe (name, test) = (name, test)

let tests = [
  ("Utils.JSON.for_enum",
   let (to_yojson, of_yojson) = JSON.for_enum [
       `Foo, `String "Foo";
       `Bar, `Int 5;
     ] in [
     test "should provide JSON conversion for simple enums" (fun () ->
         List.iter (fun v ->
             check (result foobar string) "json conversion" (Ok v) (of_yojson (to_yojson v)))
           [`Foo; `Bar]
       );
     test "should fail to deserialize incorrect values" (fun () ->
         check (result foobar string) "failure" (Error "not a member of the enum") (of_yojson (`String "qux"));
         check (result foobar string) "failure" (Error "not a member of the enum") (of_yojson (`Int 42));
         check (result foobar string) "failure" (Error "not a member of the enum") (of_yojson `Null)
       );
   ]);

  ("Utils.CryptoUtils.public_key_of_certificate_string", [
      test "should fail if the certificate is invalid" (fun () ->
          check_raises "failure" (UnexpectedError "Invalid certificate") (fun () ->
              let _ = CryptoUtils.public_key_of_certificate_string "invalid pem" in
              ()
            )
        );
      test "should fail if the certificate isn't using RSA" (fun () ->
          check_raises "failure" (UnexpectedError "Certificate does not contain an RSA public key") (fun () ->
              let certificate = "-----BEGIN CERTIFICATE-----
MIIBnzCCAVGgAwIBAgIURJvvI57ez+uSk8oWmW7lUywU7KUwBQYDK2VwMEUxCzAJ
BgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5l
dCBXaWRnaXRzIFB0eSBMdGQwHhcNMjQwMzIyMDEzOTQyWhcNMjUwMzIyMDEzOTQy
WjBFMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwY
SW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMCowBQYDK2VwAyEAvAlgdS7/OJyxoVRg
hvJdPAyfTeHzLfRqR6e1x5svrDqjUzBRMB0GA1UdDgQWBBSLzQ4W4B0g7l9t4TgM
DinN1eMfyzAfBgNVHSMEGDAWgBSLzQ4W4B0g7l9t4TgMDinN1eMfyzAPBgNVHRMB
Af8EBTADAQH/MAUGAytlcANBAGWqeS2+lv79KmKcv65VH+kmd8ZBBB9FamiAg6+x
kKH8s3BZjxwN0cBo4dMsZO5ScTWBn9pqT4z/bz6xUf5RvQ0=
-----END CERTIFICATE-----" in
              let _ = CryptoUtils.public_key_of_certificate_string certificate in
              ()
            )
        );
    ]);

  ("Utils.FirestoreUtils.of_firestore", [
      test "should extract numbers" (fun () ->
          (* Given a document that firestore returned with an integer value *)
          let json = `Assoc [
              "fields", `Assoc [
                "someFloat", `Assoc [
                  "doubleValue", `Float 42.0;
                ];
                "someInt", `Assoc [
                  "integerValue", `String "37"; (* firestore represents ints as strings *)
                ]
              ]
            ] in
          (* When converting it to a "regular" JSON *)
          let actual = FirestoreUtils.of_firestore json in
          (* Then it should extract floats and ints *)
          let expected = `Assoc [
              "someFloat", `Float 42.0;
              "someInt", `Int 37;
            ] in
          check json_eq "success" expected actual
        );
    ]);
]

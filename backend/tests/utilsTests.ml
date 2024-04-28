open Alcotest
open TestUtils
open Backend
open Utils

let describe (name, test) = (name, test)

let tests = [
    ("Utils.JSON.for_enum",
     let foobar : [`Foo | `Bar] testable =
         let pp ppf v = Fmt.pf ppf "%s" (match v with `Foo -> "Foo" | `Bar -> "Bar") in
         testable pp (=) in
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

         test "should support empty document" (fun () ->
             (* Given an empty document, that firestore represents as {} *)
             let json = `Assoc [] in
             (* When converting it back to a regular JSON *)
             let actual = FirestoreUtils.of_firestore json in
             (* Then it should keep it as is *)
             check json_eq "success" json actual
         );

         test "should fail on broken values" (fun () ->
             check_raises "failure" (UnexpectedError "Invalid firestore JSON: not an object: 1") (fun () ->
                 let _ = FirestoreUtils.of_firestore (`Int 1) in
                 ());
             check_raises "failure" (UnexpectedError "Invalid firestore JSON: not an object: {\"foo\":1}") (fun () ->
                 let _ = FirestoreUtils.of_firestore (`Assoc ["foo", `Int 1]) in
                 ());
             check_raises "failure" (UnexpectedError "Invalid firestore JSON: unexpected value when extracting field: 1") (fun () ->
                 let _ = FirestoreUtils.of_firestore (`Assoc ["fields", `Assoc ["some field", `Int 1]]) in
                 ())
         );
     ]);

    ("Utils.FirestoreUtils.to_firestore", [
         test "should fail on broken values" (fun () ->
             check_raises "failure" (UnexpectedError "Invalid object for firestore") (fun () ->
                 let _ = FirestoreUtils.to_firestore (`Int 1) in
                 ());
             check_raises "failure" (UnexpectedError "Invalid object for firestore: unsupported field: (1)") (fun () ->
                 let _ = FirestoreUtils.to_firestore (`Assoc ["foo", `Tuple [`Int 1]]) in
                 ());
         );
     ]);

    ("Utils.FirestoreUtils.of_firestore with to_firestore", [
         test "should support all values" (fun () ->
             (* Given a document with a bit of everything *)
             let json = `Assoc [
                 "string", `String "hello";
                 "bool", `Bool true;
                 "int lit", `Intlit "1";
                 "null", `Null;
                 "record", `Assoc [];
                 "list", `List [`Int 1; `Int 2];
                 "float", `Float 1.0;
                 "int", `Int 42;
             ] in
             (* When converting it to firestore and back *)
             let actual = FirestoreUtils.(json |> to_firestore |> of_firestore) in
             (* Then it should return the same document (need to check their stringification because of the float) *)
             check string "success" (JSON.to_string json) (JSON.to_string actual)
         );
     ]);
]

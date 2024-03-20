open Alcotest
open TestUtils
open Backend
open Utils

module type MOCK = sig
  include Jwt.JWT

  val validate_token : bool ref

end

module Mock = struct
  include Jwt.Make(ExternalTests.Mock)

  let validate_token = ref false

  let verify_and_get_uid token _ _ =
    let open JSON.Util in
    if !validate_token
    then to_string (member "sub" token.payload)
    else raise InvalidToken
end

module Jwt = Jwt.Make(ExternalTests.Mock)

let jwt : Jwt.t testable =
  let pp_jwt ppf jwt = Fmt.pf ppf "%s, %s, %s"
      (JSON.to_string Jwt.(jwt.header))
      (JSON.to_string Jwt.(jwt.payload))
      (Dream.to_base64url Jwt.(jwt.signature))
  in
  testable pp_jwt (=)

(* Some identity token *)
let identity_token_str = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAzMmNjMWNiMjg5ZGQ0NjI2YTQzNWQ3Mjk4OWFlNDMyMTJkZWZlNzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZXZlcnlib2FyZC10ZXN0IiwiYXVkIjoiZXZlcnlib2FyZC10ZXN0IiwiYXV0aF90aW1lIjoxNjc3OTM2MTQ5LCJ1c2VyX2lkIjoid0VDY3VNUFZRSE85VlNzN2JnT0w1ckx4bVBEMiIsInN1YiI6IndFQ2N1TVBWUUhPOVZTczdiZ09MNXJMeG1QRDIiLCJpYXQiOjE3MDI5NTI0MDEsImV4cCI6MTcwMjk1NjAwMSwiZW1haWwiOiJhYmNAZGVmLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJhYmNAZGVmLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.w356bi9Dwx9gGqORRfOwKSPLhq21XyiE7V1pmqnNxpUsQJeKRlHz9vi8QeJDwFT1dTkt79pVRacqd2w4G52tjNv7Khf6aRx6arbBtWfqLBNzbzD-US2iQFkPnXy_EkJma-YGTGbUSly6Ry9vd0axiUAvUkJ_DD1Ig1ySeYLMzeVkf501MZHshn7FO4Gx27DeLEQOLebNR9wJW4YnFN1lzyD4FM8KMpkgrpe7QQdoKNtG01aG96musc0YW0LofXN8_oQILg2Ocpnm9GLtSoUy7XNSqmQzgjiDvCR9xrPKMoPHmLcWZdrsTwTzLda9q4g0-RFGzA1yV1JMKzfY9qoRgQ"
let identity_token = Jwt.{
    header = `Assoc [
        "alg", `String "RS256";
        "kid", `String "032cc1cb289dd4626a435d72989ae43212defe78";
        "typ", `String "JWT";
      ];
    payload = `Assoc [
      "iss", `String "https://securetoken.google.com/everyboard-test";
      "aud", `String "everyboard-test";
      "auth_time", `Int 1677936149;
      "user_id", `String "wECcuMPVQHO9VSs7bgOL5rLxmPD2";
      "sub", `String "wECcuMPVQHO9VSs7bgOL5rLxmPD2";
      "iat", `Int 1702952401;
      "exp", `Int 1702956001;
      "email", `String "abc@def.com";
      "email_verified", `Bool false;
      "firebase", `Assoc [
        "identities", `Assoc [
          "email", `List [`String "abc@def.com"]
        ];
        "sign_in_provider", `String "password";
      ];
    ];
    signature = Option.get (Dream.from_base64url "w356bi9Dwx9gGqORRfOwKSPLhq21XyiE7V1pmqnNxpUsQJeKRlHz9vi8QeJDwFT1dTkt79pVRacqd2w4G52tjNv7Khf6aRx6arbBtWfqLBNzbzD-US2iQFkPnXy_EkJma-YGTGbUSly6Ry9vd0axiUAvUkJ_DD1Ig1ySeYLMzeVkf501MZHshn7FO4Gx27DeLEQOLebNR9wJW4YnFN1lzyD4FM8KMpkgrpe7QQdoKNtG01aG96musc0YW0LofXN8_oQILg2Ocpnm9GLtSoUy7XNSqmQzgjiDvCR9xrPKMoPHmLcWZdrsTwTzLda9q4g0-RFGzA1yV1JMKzfY9qoRgQ");
  }
(* The certificates that can be used to check the signature of the identity token *)
let cert_id = "032cc1cb289dd4626a435d72989ae43212defe78"
let cert_pem = "-----BEGIN CERTIFICATE-----\nMIIDHTCCAgWgAwIBAgIJAInoyDZA9itYMA0GCSqGSIb3DQEBBQUAMDExLzAtBgNV\nBAMMJnNlY3VyZXRva2VuLnN5c3RlbS5nc2VydmljZWFjY291bnQuY29tMB4XDTIz\nMTIxNjA3MzIwNFoXDTI0MDEwMTE5NDcwNFowMTEvMC0GA1UEAwwmc2VjdXJldG9r\nZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqGSIb3DQEBAQUA\nA4IBDwAwggEKAoIBAQDSXU+Cs60axpdXWc1He+K2ZN1ZMGFwae+gQejx0K6Vj1BW\nG/ZWXa7zwBHvkPjAfSUL7KWxbkTPWjMplUYKJwiQc8kXQffIBnp499m4EAuaq42k\nuLlxgDjgSRYIwNLTBsM3X97/ymcqfRNqQnKUAgsSSzmfYUqyNgbSQY7GrfdR9RSE\nNT2igff6613sn6lSiokZ/9mNxd3A4Gtf6J3inG8jNI4yTO4hdtqWoZ0AZt9E3cN3\n8KN7UWXkfWiuaKEfdpew3YsU9H31GO3EvWwpvonQBZOWik/ZhwkDRXjBnTLXel9+\nanpzZK1iWCRU2/BvdypDCgtTFDZYZGimEYeijnLNAgMBAAGjODA2MAwGA1UdEwEB\n/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMCMA0G\nCSqGSIb3DQEBBQUAA4IBAQCC86r0A58kd2zxsX5hbMONr1//eIbNTKppxQ9a5cyx\nXaddCiN/pu+RitXRjEdka24zskMXChjOa2eVDL+C4pGSp5q43v6W0qCjJZHFr/+K\nNGk6zvKrpLBVKspyzxu1g/A1GjI2XLt6Frbvt3MsQtvh4Ih6DSVEJG/8pRNa9UJs\nZ/MaSdwYC1xe1v1WlfwE7nJSWBV6xX/nGAE3Zg6sROmTLKKIsz99Uvi1A71CWyup\nLOf+P0R5q1k5jMPmVCx2Usd+V6esVWCudgRltgc7EsxwHkWQzt+vYIMOpZHcbedu\nwjwrEjOFdlk36dRwI8HWNecz4x2cn9bfr8ixAvzu6/ek\n-----END CERTIFICATE-----\n"
let cert = read_certificate cert_pem

(* Some private key used to sign tokens (not used anywhere in production) *)
let private_key_str = "-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCw1btIPHNumh1t
MtkJlTa8rEfazG7p/1SG6Efe2rkIJBqZEOLIBRVocUhDciBKwbujkntHiuUoe9N7
WFcUQWyx5XKZP5B050Tvwn6y4xHonXvcFK4UWSqKmGzKC1XA3BxrdUuHDSxRZmtg
HvW0vmqwACnogK36up83RYZYEuO971rJk70tVrnGCviieJmT40/lFI/KqYB4KFj+
ZxlOOaIQXNjDCvR9vyUjdoCWTkN1bNTc+S9FiWBxhi8FBTM6vkw/WJ+pDLWsep+O
PlnUL/FuuCk+ezBwCeED7WoroYVCzEY3B4Nc1z9Hu1lRNLs20amsdhQKyIgxcU7a
iz4AnCkNAgMBAAECggEAEeYYVkf0ISJNTzPB3yPwzekcPsvJgDrdaehR+f8mkmnh
HVQluDw3fgJVX6pKFXcFkJlvi/7FkjLyZX48FitHHryMPHHAI+0Sv7fujhnIwsRJ
+K1JL3sVAMFL5al/DQ3afI/7TJirPzQAM1L+6MQLVXQ2ybdYpNPF8NjDL9/9mEha
LL5cclSeZ1mAD8eVrBPHTl32jCGo/Year6kj1aBY2ijJmIzAEy0vD1ytYH4oJEHt
Adc6nbljz1P5DrYV55dIorwW52tNqtZzWEbenhe6IwDqzT4mNGaQSGXYH8C4uvuR
Vc3ziY2HJNU1pVJv1FAu8Fw5ZQcDNPkRYvmM0M2Q0QKBgQDniQCK/rQ2Ky0iZdzw
gchO6GecHxxXp8ejaGVwLrhz3muXgrE/G/2cOEbgPAZLSowUA+1Ng9iI4La4JzGm
hYGILNGJ74/JO13LaxzCUqag0KVGKgHN3XUXpEuRLx520gQhPC1q33ijC+xTOdvJ
tEvadeagy8Flp6rhWCu1xStxmQKBgQDDhRf71lV0xH3hnE+AQOGBm8euGroYWN++
7y4UiJpX38tAT+iv4qStni+UHMiScTqCEVLfndauIPW7kowSonlxbUmQWazj3nVe
9pGIL7ozveQLOpD8b9t65fJec/q7F9+nbP759pqTHKusojyhXSpHXhxg2O+zVf5L
i/JJS1hDlQKBgQCPXWGcr0HfGLUFy5UWxwXE9lrRbOIb1KPlJstIv2UvOdXdJuuh
bC+I/7/DMOekzzAVZKkXikAV4S7CsGIp/hjKvRWyF0gtDjlxr41LNeo/QXJVE8Wy
NyI91VmFOGvgnwI3og9tUZpdOxDGJ9lT9/PP/Zkkj4Xc8Aj7J6FJGCFiYQKBgQC3
HXin6UYh1UFcQmwG3z0UiRSLkAaIdPwgs5uBqap78GJIek6gI/E9lbBT1F1ZIei9
FoJ6YjZE4SOkKA0+CqMYw1Upd4M/6wIcDWuhk6mdehQRHCnb8tspECFdqtvBzAsw
oBlxfC+q5ig2x79nFX1aV97WKXbdjAVdNdWWJZWlvQKBgEjwoUPiV3cwf9L7qhHe
iXRkSzWYJsL3Kp3uZyPMwvgpu3nq6U6CzJIEvjMQKp+PGH1CpjbfAA8mHxZtFSVX
h9IaRp8KW+Z7gik0lu4UDkoeMc9HLdkG60LY5mMLSe64cObbZ8q1xwTidsY0Fw6+
a720UxBIZrGsdffHKHoyceuO
-----END PRIVATE KEY-----"

(* Some signed token *)
let signed_token = Jwt.{
    header = `Assoc [
        "alg", `String "RS256";
        "typ", `String "JWT";
      ];
    payload = `Assoc [
      "iss", `String "foo@bar.com";
      "scope", `String "scope1 scope2";
      "aud", `String "audience";
      "exp", `Int 1702956001;
      "iat", `Int 1702952401;
    ];
    (* signature produced by signing base64(header).base64(payload) (without padding)
       echo -ne '{"alg":"RS256","typ":"JWT"}' | basenc -w0 --base64 > headerandpayload.txt
       echo -ne '.' >> headerandpayload.txt
       echo -ne '{"iss":"foo@bar.com","scope":"scope1 scope2","aud":"audience","exp":1702956001,"iat":1702952401}' | basenc -w0 --base64
       and gets signed e.g. with openssl dgst -sha256 -sign priv.pem -out out.sign headerandpayload.txt
       and then transformed to base64url with basenc -w0 --base64url out.sign *)
    signature = Option.get (Dream.from_base64url "eD9JfdUZilJiJoLDy7HayU1nU-6XD1BxzDHtZRlNhxgmldIcMtWSt6RWPIsF259G9DzZAH6hBmWfKY5RqYyC0i98G6nbM443AcfyzVd8JRY-lGoz7f79k6XRHHp4Z0zutMKfW70O9ZTGKx4tQaCLW4H_9Pcc_FK-Ugv_yjc4Syn858pxPvlj7J6xC_QRn1sgQzey-2gCJNqRBGDVwsdGHdXBJcn5CfvBIauFPktImPCPajA6mhS8Z_wStEjSJ6t0BrCpTiPrCyJgAUNhhIKlTTlMR4eQ21Q5SJw_aMJ82moEbamRJsnTNnCbyuz57KoQZSp7iFI5nJZTmiaGzYa7xQ");
  }

let private_key = match private_key_str |> Cstruct.of_string |> X509.Private_key.decode_pem with
  | Ok (`RSA key) -> key
  | _ -> failwith "Invalid key"

let tests = [

  "Jwt.make", [
    test "should construct a token" (fun () ->
        ExternalTests.Mock.current_time := 1702952401;
        (* When constructing a token *)
        let actual = Jwt.make "foo@bar.com" private_key ["scope1"; "scope2"] "audience" in
        (* Then it should be constructed as expected *)
        let expected = signed_token in
        check jwt "success" expected actual
      );
  ];

  "Jwt.to_string", [
    test "should construct the expected string representation" (fun () ->
        (* Given a token *)
        (* When converting it to a string *)
        let actual = Jwt.to_string signed_token in
        (* Then it should provide the expected representation *)
        let expected = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmb29AYmFyLmNvbSIsInNjb3BlIjoic2NvcGUxIHNjb3BlMiIsImF1ZCI6ImF1ZGllbmNlIiwiZXhwIjoxNzAyOTU2MDAxLCJpYXQiOjE3MDI5NTI0MDF9.eD9JfdUZilJiJoLDy7HayU1nU-6XD1BxzDHtZRlNhxgmldIcMtWSt6RWPIsF259G9DzZAH6hBmWfKY5RqYyC0i98G6nbM443AcfyzVd8JRY-lGoz7f79k6XRHHp4Z0zutMKfW70O9ZTGKx4tQaCLW4H_9Pcc_FK-Ugv_yjc4Syn858pxPvlj7J6xC_QRn1sgQzey-2gCJNqRBGDVwsdGHdXBJcn5CfvBIauFPktImPCPajA6mhS8Z_wStEjSJ6t0BrCpTiPrCyJgAUNhhIKlTTlMR4eQ21Q5SJw_aMJ82moEbamRJsnTNnCbyuz57KoQZSp7iFI5nJZTmiaGzYa7xQ" in
        check string "success" expected actual
      );
  ];

  "Jwt.parse", [
    test "should succeed on a valid identity token" (fun () ->
        (* Given a valid identity token string representation *)
        (* When parsing it *)
        let actual = Jwt.parse identity_token_str in
        (* Then it should provide the expected token *)
        let expected = identity_token in
        check jwt "success" expected actual
      );

    test "should fail on an invalid identity token" (fun () ->
        (* Given an invalid idetnity token string representation *)
        let invalid_token = "invalid token!"  in
        (* When parsing it *)
        (* Then it should fail *)
        check_raises "failure" Jwt.InvalidToken (fun () ->
            let _ = Jwt.parse invalid_token in ()
          )
      );
  ];

  "Jwt.verify_and_get_uid",
  begin
    let now = 1702956000 in
    ExternalTests.Mock.current_time := now;
    let replace_assoc (json : JSON.t) (field : string) (replacement : JSON.t) : JSON.t = match json with
      | `Assoc assoc ->
        `Assoc ((field, replacement) :: (List.remove_assoc field assoc))
      | _ -> failwith "replace_assoc called without an assoc" in
    [
      test "should succeed on a valid token" (fun () ->
          (* Given a valid token *)
          (* When verifying it and extracting the uid *)
          let actual = Jwt.verify_and_get_uid identity_token "everyboard-test" [(cert_id, cert)] in
          (* Then it should provide the expected uid *)
          let expected = "wECcuMPVQHO9VSs7bgOL5rLxmPD2" in
          check string "success" expected actual
        );

      test "should succeed with emulator tokens" (fun () ->
          (* Given an emulator token, and the emulator mode beng on *)
          Options.emulator := true;
          (* When verifying it and extracting the uid *)
          let emulator_token : Jwt.t = {
            identity_token with
            header = `Assoc [
                "alg", `String "none";
                "typ", `String "JWT";
              ];
            signature = "";
          } in
          let actual = Jwt.verify_and_get_uid emulator_token "everyboard-test" [(cert_id, cert)] in
          (* Then it should provide the expected uid *)
          let expected = "wECcuMPVQHO9VSs7bgOL5rLxmPD2" in
          check string "success" expected actual;
          Options.emulator := false
        );

      test "should fail if alg is not RS256" (fun () ->
          (* Given an invalid token due to invalid algorithm used *)
          let token = { identity_token with header = replace_assoc identity_token.header "alg" (`String "foo") } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ())
        );

      test "should fail if kid is not a known key" (fun () ->
          (* Given no keys to use in verification *)
          let keys = [] in
          (* When verifying a token *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid identity_token "everyboard-test" keys in
              ())
        );

      test "should fail if token is expired" (fun () ->
          (* Given an expired token *)
          let token = { identity_token with payload = replace_assoc identity_token.payload "exp" (`Int (now - 100000)) } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ())
        );

      test "should fail if token is issued in the future" (fun () ->
          (* Given a token issued in the future *)
          let token = { identity_token with payload = replace_assoc identity_token.payload "iat" (`Int (now + 1000)) } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ())
        );

      test "should fail if audience is not the project id" (fun () ->
          (* Given a token with an audience different from the project id *)
          let project_id = "another-project" in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid identity_token project_id [(cert_id, cert)] in
              ())
        );

      test "should fail if issuer is not the expected url" (fun () ->
          (* Given a token with a wrong issuer url *)
          let token = { identity_token with payload = replace_assoc identity_token.payload "iss" (`String "http://other") } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ())
        );

      test "should fail if subject is empty" (fun () ->
          (* Given a token with an empty subject *)
          let token = { identity_token with payload = replace_assoc identity_token.payload "sub" (`String "") } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ())
        );

     test "should fail if authentication time is in the future" (fun () ->
          (* Given a token with an authentication time in the future *)
          let token = { identity_token with payload = replace_assoc identity_token.payload "auth_time" (`Int (now + 1000)) } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ())
       );

     test "should fail if signature is invalid" (fun () ->
          (* Given a token with an invalid signature *)
          let token = { identity_token with signature = "foo" } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ())
       );

      (*
      test "should fail if signature is not using SHA256" (fun () ->
          (* Given a token with a SHA-224 signature instead of SHA-256 *)
          (* TODO: need to use a cert that matches the private key. Also, need to recompute the signature, as it is not from an identity token *)
          let b64_signature = "mYh2u8dz0l9Uqtm7eHhRkbfgcGoJD7yIMNysHr-_58d-jGZzoD7LApj9lUyDBNqHcWRmMsvOT7IuAA4jajhudFiZNvVoyVw1CDcY22TsTUS7AsShtrAMegKjEy7h3ylidfvqmWvK_Ojb55dQoHHbn8vWrDq29qSrXng5sdxYznLxQbW28xncXMU8OHBSZPKAS4aNhPiexKODOpUBGym1ospOTxTq3r8u9MG3_HZJK7q0jg47XErf807B_qC8DQa6k5skPlHc7mXRkocJJbuAWWiioC7dSv2p7O8ffRgdmUfCbzxG4e8QR-sKv9BgQzgZS-RFGHK66Am6P1BBojQ_kA==" in
          let token = { identity_token with signature = Option.get (Dream.from_base64url b64_signature) } in
          (* When verifying it *)
          (* Then it should fail *)
          check_raises "failure" Jwt.InvalidToken (fun () ->
              let _ = Jwt.verify_and_get_uid token "everyboard-test" [(cert_id, cert)] in
              ());
          check_raises "failure" Jwt.InvalidToken (fun () -> ())
        );
      *)
  ]
  end;

]

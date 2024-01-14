open Alcotest
open TestUtils
open Backend

let tests = [
  "Utils.of_firestore", [
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
          let actual = Utils.of_firestore json in
          (* Then it should extract floats and ints *)
          let expected = `Assoc [
              "someFloat", `Float 42.0;
              "someInt", `Int 37;
            ] in
          check json_eq "success" expected actual
        );
    ];
]

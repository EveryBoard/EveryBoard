#!/bin/sh
ARGS="$@"
npx firebase emulators:exec --only firestore,auth,database --project 'testing' "ng test --configuration local --code-coverage $ARGS" --ui

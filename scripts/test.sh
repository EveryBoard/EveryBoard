#!/bin/sh
ARGS="$@"
npx firebase emulators:exec --only firestore --project 'testing' "ng test --configuration test --code-coverage $ARGS"

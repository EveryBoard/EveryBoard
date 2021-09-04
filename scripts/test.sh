#!/bin/sh
ARGS="$@"
npx firebase emulators:exec --only firestore --project 'testing' "ng test --code-coverage $ARGS"

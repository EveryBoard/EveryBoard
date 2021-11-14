#!/bin/sh
ARGS="$@"
npx firebase emulators:exec --only firestore,auth,database --import=./data/ --export-on-exit --project 'my-project' "ng serve --configuration local $ARGS" --ui  

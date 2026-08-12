#!/bin/sh
ARGS="$*"
if [ "${NO_COVERAGE:-false}" = "true" ]; then
  COVERAGE_OPTION=""
else
  COVERAGE_OPTION="--code-coverage"
fi
if [ "${NO_EMULATOR:-false}" = "true" ]; then
  npx ng test --configuration local $COVERAGE_OPTION $ARGS
else
  npx firebase emulators:exec --only firestore,auth,database --project 'my-project' "ng test --configuration local $COVERAGE_OPTION $ARGS" --ui
fi

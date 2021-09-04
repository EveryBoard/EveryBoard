#!/bin/sh
npx firebase emulators:exec --only firestore --project 'testing' 'ng test --code-coverage'
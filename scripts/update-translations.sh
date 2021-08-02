#!/bin/sh
npx ng extract-i18n --output-path=translations/
# Remove all context information, we do not need it and it complexifies the manual translation process
grep -v "</context>" translations/messages.xlf | grep -v "<context-group" | grep -v "</context-group" > tmp
mv tmp translations/messages.xlf

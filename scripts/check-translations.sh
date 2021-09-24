#!/bin/sh
python ./scripts/check-translations.py
if [ "$?" -eq 0 ]; then
    echo 'Translations are OK!'
    npx xlf-merge translations/messages.fr.xlf --convert json -o src/assets/fr.json
    rm -f translations/messages.fr.json
    exit 0 # Success
else
    echo 'Translations are not finalized'
    exit 1 # Failure
fi

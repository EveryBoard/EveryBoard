#!/bin/sh
ARGS="$@"
export CHROME_BIN="$CHROME_PATH"
echo $CHROME_PATH
ls -l $CHROME_PATH
python3 -m pip install lxml selenium pandas chromedriver || exit
echo "export const firebaseConfig = {
    apiKey: '$API_KEY',
    authDomain: '$AUTH_DOMAIN',
    databaseURL: '$DATABASE_URL',
    projectId: '$PROJECT_ID',
    storageBucket: '$STORAGE_BUCKET',
    messagingSenderId: '$MESSAGING_SENDER_ID',
};" > src/app/firebaseConfig.ts
bash ./scripts/update-images.sh || exit
bash ./scripts/update-translations.sh || exit
bash ./scripts/check-translations.sh || exit
npm run build:netlify $ARGS || exit

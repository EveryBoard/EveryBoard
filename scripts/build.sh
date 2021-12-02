#!/bin/sh
ARGS="$@"
echo $CHROME_PATH
ls -l $CHROME_PATH
python3 -m pip install lxml selenium pandas webdriver-manager
echo "export const firebaseConfig = {
    apiKey: '$API_KEY',
    authDomain: '$AUTH_DOMAIN',
    databaseURL: '$DATABASE_URL',
    projectId: '$PROJECT_ID',
    storageBucket: '$STORAGE_BUCKET',
    messagingSenderId: '$MESSAGING_SENDER_ID',
};" > src/app/firebaseConfig.ts
bash ./scripts/update-translations.sh
bash ./scripts/check-translations.sh
bash ./scripts/update-images.sh
npm run build:netlify $ARGS

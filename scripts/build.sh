#!/bin/sh
ARGS="$@"
pip install lxml selenium pandas
echo "export const firebaseConfig = {
    apiKey: '$API_KEY',
    authDomain: '$AUTH_DOMAIN',
    databaseURL: $DATABASE_URL',
    projectId: '$PROJECT_ID',
    storageBucket: '$STORAGE_BUCKET',
    messagingSenderId: '$MESSAGING_SENDER_ID',
};" > src/app/firebaseConfig.ts
bash ./scripts/update-translations.sh
bash ./scripts/check-translations.sh
bash ./scripts/update-images.sh
npm run build $ARGS

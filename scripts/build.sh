#!/bin/sh
$ARGS="$@"
gpg --quiet --batch --yes --decrypt --passphrase="$ENC_SECRET" --output src/app/firebaseConfig.ts .netlify/firebaseConfig.ts.gpg
pip install lxml selenium pandas
python ./scripts/update-translations.sh
bash ./scripts/check-translations.sh
bash ./scripts/update-images.sh
npm run build $ARGS

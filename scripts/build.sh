#!/bin/sh
ARGS="$@"
pip install lxml selenium pandas
cp ./.netlify/firebaseConfig.ts src/app/
python ./scripts/update-translations.sh
bash ./scripts/check-translations.sh
bash ./scripts/update-images.sh
npm run build $ARGS

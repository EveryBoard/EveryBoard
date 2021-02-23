#!/bin/sh

VERSION=$(git rev-parse HEAD | cut -c1-8)
sed -i "s/COMMIT/$VERSION/" src/index.html

openssl aes-256-cbc -K $encrypted_bdd73078a253_key -iv $encrypted_bdd73078a253_iv -in .travis/firebaseConfig.ts.enc -out src/app/firebaseConfig.ts -d
openssl aes-256-cbc -K $encrypted_f217180e22ee_key -iv $encrypted_f217180e22ee_iv -in .travis/id_rsa.enc -out id_rsa -d
npx ng build --base-href /gaviall/pantheonsgame/

eval "$(ssh-agent -s)"
chmod 600 id_rsa
ssh-add id_rsa
echo "Host $HOST" >> ~/.ssh/config
echo "StrictHostKeyChecking no" >> ~/.ssh/config

rsync -avz dist/pantheonsgame/ $USER@$HOST:$DEPLOY_PATH

#!/bin/sh

eval "$(ssh-agent -s)"
chmod 600 id_rsa
ssh-add id_rsa
echo "Host $HOST" >> ~/.ssh/config
echo "StrictHostKeyChecking no" >> ~/.ssh/config

#VERSION=$(git rev-parse HEAD | cut -c1-8)
#sed -i "s/Pantheon's Game/Pantheon's Game ($VERSION)"

rsync -avz dist/pantheonsgame/ $USER@$HOST:$DEPLOY_PATH

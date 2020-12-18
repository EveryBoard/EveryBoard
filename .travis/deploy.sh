#!/bin/sh

eval "$(ssh-agent -s)"
chmod 600 id_rsa
ssh-add id_rsa

#VERSION=$(git rev-parse HEAD | cut -c1-8)
#sed -i "s/Pantheon's Game/Pantheon's Game ($VERSION)"

rsync -avz dist/pantheonsgame/ $USER@$HOST:$DEPLOY_PATH

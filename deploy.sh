#!/bin/sh

eval "$(ssh-agent -s)"
chmod 600 .travis/id_rsa
ssh-add .travis/id_rsa

VERSION=$(git rev-parse HEAD | cut -c1-8)
sed -i "s/Pantheon's Game/Pantheon's Game ($VERSION)"

rsync -avz dist/ $USER@$HOST:$PATH

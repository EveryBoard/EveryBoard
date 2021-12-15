#!/bin/sh
npm start &
sleep 100 # wait until NPM has started
NPM="$!"
grep "new GameInfo" src/app/components/normal-component/pick-game/pick-game.component.ts | sed "s/.*new GameInfo([^,]*, '\([^']*\)'.*/\1/" > scripts/games.txt
python scripts/screenshot.py || exit
kill $NPM
mv *.png src/assets/images/
rm scripts/games.txt

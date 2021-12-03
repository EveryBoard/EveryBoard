#!/bin/sh
echo 'Make sure you are running npm start in parallel! Press enter when it is the case'
read
grep "new GameInfo" src/app/components/normal-component/pick-game/pick-game.component.ts | sed "s/.*new GameInfo([^,]*, '\([^']*\)'.*/\1/" > scripts/games.txt
python3 scripts/screenshot.py
mv *.png src/assets/images/
rm scripts/games.txt

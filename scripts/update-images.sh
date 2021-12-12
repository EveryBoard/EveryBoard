#!/bin/sh
grep "new GameInfo" src/app/components/normal-component/pick-game/pick-game.component.ts | sed "s/.*new GameInfo([^,]*, '\([^']*\)'.*/\1/" > scripts/games.txt
python scripts/screenshot.py
mv *.png src/assets/images/light/
# Change theme by simply copying the CSS
cp src/sass/dark.scss src/sass/light.scss
sleep 5 # Need to wait a bit for ng to refresh
python scripts/screenshot.py
mv *.png src/assets/images/dark/
# Restore the CSS
git checkout src/sass/light.scss
rm scripts/games.txt

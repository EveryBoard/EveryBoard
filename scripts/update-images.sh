#!/bin/sh
npm start&
NPM="$!"
sleep 100 # wait until npm has started

grep "new GameInfo" src/app/components/normal-component/pick-game/pick-game.component.ts | sed "s/.*new GameInfo([^,]*, '\([^']*\)'.*/\1/" > scripts/games.txt
python scripts/screenshot.py || exit
mv *.png src/assets/images/light/

# Change theme by simply copying the CSS
cp src/sass/light.scss src/sass/light.scss.tmp
cp src/sass/dark.scss src/sass/light.scss
sleep 10 # Need to wait a bit for ng to refresh

python scripts/screenshot.py
mv *.png src/assets/images/dark/
# Restore the CSS
mv src/sass/light.scss.tmp src/sass/light.scss
rm scripts/games.txt
for image in $(ls src/assets/images/dark/*.png src/assets/images/light/*.png); do
    python scripts/square-image.py $image
done

kill $NPM

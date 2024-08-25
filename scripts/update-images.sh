#!/bin/sh
#
# Get the list of games
grep "new GameInfo" src/app/components/normal-component/pick-game/pick-game.component.ts | sed -E "s/.*new GameInfo\([^,]+, +'([^']+)'.*/\1/" > scripts/games.txt

# Make backups of themes
cp src/sass/light.scss src/sass/light.scss.tmp
cp src/sass/dark.scss src/sass/dark.scss.tmp

# Force light mode by replacing the dark css
echo 'Switching to light mode'
cp src/sass/light.scss.tmp src/sass/dark.scss

# Screenshot the games
python scripts/screenshot.py || exit
mv ./*.png src/assets/images/light/

# Force dark mode by replacing everything by the dark css
echo 'Switching to dark mode'
cp src/sass/dark.scss.tmp src/sass/light.scss
cp src/sass/dark.scss.tmp src/sass/dark.scss
sleep 10 # Need to wait a bit for ng to refresh

# Screenshot the games
python scripts/screenshot.py
mv ./*.png src/assets/images/dark/

# Restore both CSS and remove temp files
mv src/sass/light.scss.tmp src/sass/light.scss
mv src/sass/dark.scss.tmp src/sass/dark.scss
rm scripts/games.txt

# And finally, square the images
for image in src/assets/images/dark/*.png src/assets/images/light/*.png; do
    python scripts/square-image.py "$image"
done

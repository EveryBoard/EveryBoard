#!/bin/sh
grep "new GameInfo" src/app/components/normal-component/pick-game/pick-game.component.ts | sed -E "s/.*new GameInfo\([^,]+, +'([^']+)'.*/\1/" > scripts/games.txt
FAILED=0
for GAME in $(cat scripts/games.txt); do
    if [ ! -f src/assets/images/dark/$GAME.png ]; then
        echo "Image is missing for game $GAME (dark theme)"
        FAILED=1
    fi
    if [ ! -f src/assets/images/light/$GAME.png ]; then
        echo "Image is missing for game $GAME (light theme)"
        FAILED=1
    fi
done

if [ $FAILED -eq 1 ]; then
    exit 1
fi

import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleState } from 'src/app/games/awale/AwaleState';
import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';

export class AwaleTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.anyMove(
            $localize`Sowing`,
            $localize`Awalé is a game of distribution (sowing) and capture. Its goal is to capture the most seeds.
         Let's see how seeds are sown. The spaces in Awalé are called the houses.
         As you're playing Dark, the 6 houses on the bottom are yours.<br/><br>
         Click on any of the bottom houses to sow the seeds it contains: they will be sown clockwise, one seed per house.`,
            AwaleState.getInitialState({ seed_by_house: 4, width: 4 }),
            AwaleMove.of(0),
            $localize`Look at the 4 houses that follow clockwise the one you picked, they now contain 5 seeds.
        This is how seeds are sown:
        one by one from the house next to the one they come from, clockwise.`,
        ),
        TutorialStep.anyMove(
            $localize`Big sowing`,
            $localize`When there are enough seeds to make a full turn, something else happens.<br/><br/>
        You're playing Dark.
        Sow the house that contains 12 seeds.`,
            new AwaleState([
                [0, 0, 0, 0, 0, 0],
                [0, 12, 0, 0, 0, 0],
            ], 0, [0, 0]),
            AwaleMove.of(1),
            $localize`See, the house that you sowed has not been refilled, and the sowing immediately continued to the next house (which therefore contains two seeds).`,
        ),
        TutorialStep.fromMove(
            $localize`Simple capture`,
            $localize`After sowing, if the last seed falls in an opponent's house and if there is now two or three seeds in this house, the player captures these two or three seeds.<br/><br/>You're playing Dark, do a capture!`,
            new AwaleState([
                [0, 1, 0, 0, 1, 0],
                [2, 0, 0, 0, 1, 0],
            ], 0, [0, 0]),
            [AwaleMove.of(0)],
            $localize`Well done! This was a simple capture, now let us see how to make multiple captures.`,
            $localize`Failed. Try again and sow from the leftmost house.`,
        ),
        TutorialStep.fromMove(
            $localize`Multiple captures`,
            $localize`By sowing from your leftmost house, you will end in the opponent's second leftmost house, which contains now 3, so this will be a capture. But now, the house right before it contains 2, which is also capturable, so, that house will get captured as well!<br/><br/>You're playing Dark, do a capture!`,
            new AwaleState([
                [2, 1, 0, 0, 1, 0],
                [2, 0, 0, 0, 1, 0],
            ], 0, [0, 0]),
            [AwaleMove.of(0)],
            $localize`Nice, you win 3 points from the first house, and 2 from the second!`,
            $localize`Failed. Try again.`,
        ),
        TutorialStep.fromMove(
            $localize`Interrupted capture`,
            $localize`By clicking on your leftmost house, you end up on the 3rd house, which is capturable.<br/><br/>You're playing Dark, do a capture!`,
            new AwaleState([
                [1, 0, 1, 0, 0, 1],
                [3, 0, 0, 0, 1, 0],
            ], 0, [0, 0]),
            [AwaleMove.of(0)],
            $localize`Notice that because the second house was not capturable, the capture was interrupted and you have not captured the first house.`,
            $localize`Failed. Try again.`,
        ),
        TutorialStep.fromMove(
            $localize`Capture on the other side only`,
            $localize`You're playing Dark. Try to capture the two leftmost houses of the opponent.`,
            new AwaleState([
                [2, 2, 0, 0, 1, 0],
                [1, 3, 0, 0, 0, 0],
            ], 0, [0, 0]),
            [AwaleMove.of(1)],
            $localize`Congratulations! Notice that the capture was interrupted when entering your territory: you cannot capture your own houses!`,
            $localize`You have only captured one house, try again!`,
        ),
        TutorialStep.fromMove(
            $localize`Do not starve`,
            $localize`You have a very nice capture that seems possible: it seems that you can capture all the opponent's seeds!<br/><br/>
        You're playing Dark. Try it.`,
            new AwaleState([
                [1, 1, 1, 1, 1, 0],
                [5, 0, 0, 1, 0, 0],
            ], 0, [0, 0]),
            [AwaleMove.of(0)],
            $localize`Sadly, you cannot capture here, otherwise the opponent could not play after you.
        When this happens, the move can be made, but no capture takes place!`,
            $localize`Failed. Try again.`,
        ),
        TutorialStep.anyMove(
            $localize`Feeding is mandatory`,
            $localize`You cannot let another player starve, meaning that if your opponent has no seeds anymore and if you can give them at least one, you have to do it.<br/><br/>You're playing Dark. Give a seed to your opponent!`,
            new AwaleState([
                [0, 0, 0, 0, 0, 0],
                [0, 1, 2, 4, 4, 5],
            ], 0, [0, 0]),
            AwaleMove.of(3),
            $localize`Congratulations! Note that you can choose to give your opponent the least number of seeds if it is better for you.
        It is often a good way to have easy captures!`,
        ),
        TutorialStep.anyMove(
            $localize`End of the game`,
            $localize`A game is won as soon as one player has captured 25 seeds, as that player has more than half of all the seeds.<br/><br/>You're playing Dark, sow the leftmost house.`,
            new AwaleState([
                [4, 4, 3, 2, 1, 0],
                [1, 0, 0, 0, 0, 0],
            ], 0, [0, 0]),
            AwaleMove.of(0),
            $localize`Also, as soon as on player cannot play, the other player captures all the seeds in its own side.
         Here, it was the first player's turn, and the second player has taken all the remaining seeds.`,
        ),
    ];
}

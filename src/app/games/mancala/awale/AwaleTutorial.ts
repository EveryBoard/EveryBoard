import { AwaleMove } from 'src/app/games/mancala/awale/AwaleMove';
import { MancalaState } from 'src/app/games/mancala/commons/MancalaState';
import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';

export class AwaleTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Mancala`,
            $localize`Mancala is the name of a family of board games that date back at least to the third century. Mancalas are games of distribution (sowing) and capture. Their goal is to capture the most seeds. The spaces in Mancalas are called the houses. As you're playing Dark, the 6 houses on the bottom are yours.`,
            MancalaState.getInitialState(),
        ),
        TutorialStep.informational(
            $localize`Awalé`,
            $localize`Bonus fact: Awalé is the more common of all Mancalas.`,
            MancalaState.getInitialState(),
        ),
        TutorialStep.fromMove(
            $localize`Sowing`,
            $localize`The main move in mancala games is sowing, let's see how seeds are sown. As you're playing Dark, the 6 houses on the bottom are yours.<br/><br>Click on the rightermost bottom house to sow the seeds it contains: they will be sown clockwise, one seed per house.<br/><br/>Click on the rightermost house!`,
            MancalaState.getInitialState(),
            [AwaleMove.FIVE],
            $localize`Look at the 4 houses that follow clockwise the one you picked, they now contain 5 seeds. This is how seeds are sown: one by one from the house next to the one they come from, clockwise.`,
            $localize`Failed. Choose the rightermost house on the bottom.`,
        ),
        TutorialStep.anyMove(
            $localize`Big sowing`,
            $localize`When there are enough seeds to make a full turn, something else happens.<br/><br/>
        You're playing Dark.
        Sow the house that contains 12 seeds.`,
            new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [0, 12, 0, 0, 0, 0],
            ], 0, [0, 0]),
            AwaleMove.ONE,
            $localize`See, the house that you sowed has not been refilled, and the sowing immediately continued to the next house (which therefore contains two seeds).`,
        ),
        TutorialStep.fromMove(
            $localize`Simple capture`,
            $localize`After sowing, if the last seed falls in an opponent's house and if there is now two or three seeds in this house, the player captures these two or three seeds.<br/><br/>You're playing Dark, do a capture!`,
            new MancalaState([
                [0, 1, 0, 0, 1, 0],
                [2, 0, 0, 0, 1, 0],
            ], 0, [0, 0]),
            [AwaleMove.ZERO],
            $localize`Well done! This was a simple capture, now let us see how to make multiple captures.`,
            $localize`Failed. Try again and sow from the leftmost house.`,
        ),
        TutorialStep.fromMove(
            $localize`Multiple captures`,
            $localize`By sowing from your leftmost house, you will end in the opponent's second leftmost house, which contains now 3, so this will be a capture. But now, the house right before it contains 2, which is also capturable, so, that house will get captured as well!<br/><br/>You're playing Dark, do a capture!`,
            new MancalaState([
                [2, 1, 0, 0, 1, 0],
                [2, 0, 0, 0, 1, 0],
            ], 0, [0, 0]),
            [AwaleMove.ZERO],
            $localize`Nice, you win 3 points from the first house, and 2 from the second!`,
            $localize`Failed. Try again.`,
        ),
        TutorialStep.fromMove(
            $localize`Interrupted capture`,
            $localize`By clicking on your leftmost house, you end up on the 3rd house, which is capturable.<br/><br/>You're playing Dark, do a capture!`,
            new MancalaState([
                [1, 0, 1, 0, 0, 1],
                [3, 0, 0, 0, 1, 0],
            ], 0, [0, 0]),
            [AwaleMove.ZERO],
            $localize`Notice that because the second house was not capturable, the capture was interrupted and you have not captured the first house.`,
            $localize`Failed. Try again.`,
        ),
        TutorialStep.fromMove(
            $localize`Capture on the other side only`,
            $localize`You're playing Dark. Try to capture the two leftmost houses of the opponent.`,
            new MancalaState([
                [2, 2, 0, 0, 1, 0],
                [1, 3, 0, 0, 0, 0],
            ], 0, [0, 0]),
            [AwaleMove.ONE],
            $localize`Congratulations! Notice that the capture was interrupted when entering your territory: you cannot capture your own houses!`,
            $localize`You have only captured one house, try again!`,
        ),
        TutorialStep.fromMove(
            $localize`Do not starve`,
            $localize`You have a very nice capture that seems possible: it seems that you can capture all the opponent's seeds!<br/><br/>
        You're playing Dark. Try it.`,
            new MancalaState([
                [1, 1, 1, 1, 1, 0],
                [5, 0, 0, 1, 0, 0],
            ], 0, [0, 0]),
            [AwaleMove.ZERO],
            $localize`Sadly, you cannot capture here, otherwise the opponent could not play after you.
        When this happens, the move can be made, but no capture takes place!`,
            $localize`Failed. Try again.`,
        ),
        TutorialStep.anyMove(
            $localize`Feeding is mandatory`,
            $localize`You cannot let another player starve, meaning that if your opponent has no seeds anymore and if you can give them at least one, you have to do it.<br/><br/>You're playing Dark. Give a seed to your opponent!`,
            new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [0, 1, 2, 4, 4, 5],
            ], 0, [0, 0]),
            AwaleMove.THREE,
            $localize`Congratulations! Note that you can choose to give your opponent the least number of seeds if it is better for you.
        It is often a good way to have easy captures!`,
        ),
        TutorialStep.anyMove(
            $localize`End of the game`,
            $localize`A game is won as soon as one player has captured 25 seeds, as that player has more than half of all the seeds.<br/><br/>You're playing Dark, sow the leftmost house.`,
            new MancalaState([
                [4, 4, 3, 2, 1, 0],
                [1, 0, 0, 0, 0, 0],
            ], 0, [0, 0]),
            AwaleMove.ZERO,
            $localize`Also, as soon as on player cannot play, the other player captures all the seeds in its own side.
         Here, it was the first player's turn, and the second player has taken all the remaining seeds.`,
        ),
    ];
}

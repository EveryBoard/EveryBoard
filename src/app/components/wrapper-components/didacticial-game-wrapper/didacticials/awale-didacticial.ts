import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';

export const awaleTutorial: DidacticialStep[] = [
    DidacticialStep.anyMove(
        $localize`Sowing`,
        $localize`Awalé is a game of distribution (sowing) and capture. Its goal is to capture the most seeds.
         Let's see how seeds are sown.
         As you're playing first, the 6 houses on the top are yours.<br/><br>
         Click on any of them to sow the seeds it contains: they will be sown clockwise, one seed per house.`,
        AwalePartSlice.getInitialSlice(),
        AwaleMove.ZERO,
        $localize`Look at the 4 houses that follow clockwise the one you picked, they now contain 5 seeds.
        This is how seeds are sown:
        one by one from the house next to the one they come from, clockwise.`,
    ),
    DidacticialStep.anyMove(
        $localize`Big sowing`,
        $localize`You are now the second player (on the bottom).
        When there are enough seeds to make a full turn, something else happens.<br/><br/>
        Sow the house that contains 12 seeds.`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 12, 0, 0, 0, 0],
        ], 1, [0, 0]),
        AwaleMove.ONE,
        $localize`See, the house that you sowed has not been refilled, and the sowing immediately continued from the next house (which therefore contains two seeds).`,
    ),
    DidacticialStep.fromMove(
        $localize`Simple capture`,
        $localize`After sowing, if the last seed falls in an opponent's house and if there is now two or three seeds in this house, the player captures these two or three seeds.
         Then, the player looks at the preceding house:
         if it is still in the opponent's side and contains two or three seeds, they are also captured.
         This continues until the player's side is reached or there is a different number of seeds from two or three.<br/><br/>
         You are the second player, try to capture some pieces!`,
        new AwalePartSlice([
            [1, 0, 0, 0, 1, 0],
            [1, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Well done! This was a simple capture, now let us see how to make multiple captures.`,
        $localize`Failed. Try again and sow from the leftmost house.`,
    ),
    DidacticialStep.fromMove(
        $localize`Multiple captures`,
        $localize`By sowing from your leftmost house, you will change the number of seeds in a house from 2 to 3, and from the preceding house from 1 to 2.
        As these are consecutive houses, all seeds in them will be captured.<br/><br/>
        Capture them.`,
        new AwalePartSlice([
            [2, 1, 0, 0, 1, 0],
            [2, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Nice, you win 3 points from the first house, and 2 from the second!`,
        $localize`Failed. Try again.`,
    ),
    DidacticialStep.fromMove(
        $localize`Interrupted capture`,
        $localize`By clicking on your leftmost house, you end up on the 3rd house, which is capturable.<br/><br/>
        Do it.`,
        new AwalePartSlice([
            [1, 0, 1, 0, 0, 1],
            [3, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Notice that because the second house was not capturable, the captured was interrupted and you have not captured the first house.`,
        $localize`Failed. Try again.`,
    ),
    DidacticialStep.fromMove(
        $localize`Capture on the other side only`,
        $localize`Try to capture the two leftmost houses of the opponent.`,
        new AwalePartSlice([
            [2, 2, 0, 0, 1, 0],
            [1, 3, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ONE],
        $localize`Congratulations! Notice that the capture was interrupted when entering your territory: you cannot capture in your own houses!`,
        $localize`You have only captured one house, try again!`,
    ),
    DidacticialStep.fromMove(
        $localize`Do not starve`,
        $localize`You have a very nice capture that seems possible: it seems that you can capture all the opponent's seeds!<br/><br/>
        Try it.`,
        new AwalePartSlice([
            [1, 1, 1, 1, 1, 0],
            [5, 0, 0, 1, 0, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Sadly, you cannot capture here, otherwise the opponent could not play after you.
        When this happens, the move can be made, but no capture takes place!`,
        $localize`Failed. Try again.`,
    ),
    DidacticialStep.anyMove(
        $localize`Feeding is mandatory`,
        $localize`You cannot let another player starve, meaning that if your opponent has no seeds anymore and if you can give them at least one, you have to do it.
        Go ahead!`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 1, 2, 4, 4, 5],
        ], 1, [0, 0]),
        AwaleMove.THREE,
        $localize`Congratulations! Note that you can choose to give your opponent the least number of seeds if it is better for you.
        It is often a good way to have easy captures!`,
    ),
    DidacticialStep.anyMove(
        $localize`End of the game`,
        $localize`A game is won as soon as one player has captured 25 seeds, as that player has more than half of all the seeds.<br/><br/>
         Sow the house on the top right.`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 1],
            [0, 1, 2, 3, 4, 4],
        ], 0, [0, 0]),
        AwaleMove.FIVE,
        $localize`Also, as soon as on player cannot play, the other player captures all the seeds in its own side.
         Here, it was the first player's turn, and the second player has taken all the remaining seeds.`,
    ),
];
 

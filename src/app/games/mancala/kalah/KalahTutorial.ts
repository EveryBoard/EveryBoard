import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { MancalaState } from '../commons/MancalaState';
import { KalahMove } from './KalahMove';
import { MancalaDistribution } from '../commons/MancalaMove';

export class KalahTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Kalah`,
            $localize`Kalah is a game of distribution (sowing) and capture. It belongs to the a family of game named Mancala. But unlike most version of Mancalas, this one has been created in America in 1940 by William Julius Champion Jr. Like the classic international version named Awalé, the board is a 2 row of 6 houses, containing each 4 seeds.`,
            MancalaState.getInitialState(),
        ),
        TutorialStep.fromMove(
            $localize`Sowing`,
            $localize`The mains move in mancala games is sowing, let's see how seeds are sown. The spaces in mancalas are called the houses. As you're playing Dark, the 6 houses on the bottom are yours.<br/><br>Click on the righter bottom houses to sow the seeds it contains: they will be sown clockwise, one seed per house.`,
            MancalaState.getInitialState(),
            [KalahMove.of(MancalaDistribution.FIVE)],
            $localize`Look at the 4 houses that follow clockwise the one you picked, they now contain 5 seeds. This is how seeds are sown: one by one from the house next to the one they come from, clockwise.`,
            $localize`Failed. Choose the righter house on the bottom.`,
        ),
        // 3. When you pass by the Kalah, pointy point!
        TutorialStep.fromMove( // TODO: add fromClick again cause needed here to explain soon why finishing in the Kalah don't finalize the move
            $localize`The Kalah`,
            $localize`The house on the extreme left and right, unaligned to the others, are the kalah, yours on the left, the opponent's on the right. When sowing, before passing from your last house to the first of the opponent, you must drop one seed in your kalah. But you won't have to drop seed in your opponent's kalah. When you make a capture, your seeds are put in your kalah.<br/><br/>You're playing Dark. Make a move that pass threw your kalah then feed opponent's houses.`,
            MancalaState.getInitialState(),
            [
                KalahMove.of(MancalaDistribution.ZERO),
                KalahMove.of(MancalaDistribution.ONE),
                KalahMove.of(MancalaDistribution.TWO),
            ],
            $localize`As you see, three houses have been fed in addition to your kalah.`,
            $localize`Failed. Choose the three lefter house on the bottom.`,
        ),
        // 4. Ending in the kalah: play again !
        // 5. Capture
        // 6. Here: you can starve !
    ];
}
// TODO: make it throw when you create a game without minimax !
import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { MancalaState } from '../commons/MancalaState';
import { KalahMove } from './KalahMove';
import { MancalaDistribution } from '../commons/MancalaMove';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MancalaTutorial } from '../commons/MancalaTutorial';

export class KalahTutorial extends Tutorial {

    public gameName: string = $localize`Kalah`;

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            this.gameName,
            $localize`${this.gameName} is a Mancala. Mancala is the name of a family of board games that dates back at least to the third century. Mancalas are games of distribution (sowing) and capture. Their goal is to capture the most seeds. The spaces in Mancalas are called the houses. The ones on the extreme left and right are called the stores, they contain the seeds that each player won. As you are playing Dark, the 6 houses on the bottom are yours.`,
            MancalaState.getInitialState(),
        ),
        TutorialStep.informational(
            $localize`Kalah`,
            $localize`Bonus fact: Kalah has been created in the U.S.A in 1940 by William Julius Champion Jr.`,
            MancalaState.getInitialState(),
        ),
        MancalaTutorial.SOWING(KalahMove.of(MancalaDistribution.FIVE)),

        TutorialStep.forClick(
            $localize`The Kalah (1/2)`,
            $localize`The houses on the extreme left and right, unaligned with the others, are the Kalah. Yours is on the left, the opponent's on the right. When sowing, before passing from your last house to the first of the opponent, you must drop one seed in your Kalah, but you won't have to drop seed in your opponent's Kalah. When you make a capture, the captured seeds are put in your Kalah.<br/><br/>You're playing Dark. Make a move that passes through your Kalah then feeds opponent's houses.`,
            MancalaState.getInitialState(),
            [
                '#click_0_1',
                '#click_1_1',
                '#click_2_1',
            ],
            $localize`As you see, three houses have been fed in addition to your Kalah.`,
            $localize`Failed. Choose the three leftmost house on the bottom.`,
        ),
        TutorialStep.fromPredicate(
            $localize`The Kalah (2/2)`,
            $localize`When ending in the Kalah, you must distribute again.<br/><br/>You're playing Dark, play the house that ends up in the Kalah then do a second distribution!`,
            MancalaState.getInitialState(),
            KalahMove.of(MancalaDistribution.THREE, [MancalaDistribution.ONE]),
            (move: KalahMove, _previous: MancalaState, _result: MancalaState) => {
                if (move.distributions.length === 1) {
                    return MGPValidation.failure($localize`This move only distributed one house, do one distribution that ends in the Kalah, then do a second one!`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Capture`,
            $localize`When the last seed of a distribution ends up in one of your empty houses, if the opposite house is filled, then you capture both houses. On this board, such a move is possible.<br/><br/>You're playing Dark, do a capture!`,
            new MancalaState([
                [0, 4, 4, 4, 4, 4],
                [0, 2, 0, 2, 4, 0],
            ], 4, [0, 0]),
            KalahMove.of(MancalaDistribution.ONE, [MancalaDistribution.ZERO, MancalaDistribution.THREE]),
            (_move: KalahMove, _state: MancalaState, resultingState: MancalaState) => {
                if (resultingState.getPieceAtXY(1, 0) === 0) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You did not capture, try again!`);
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`End of the game`,
            $localize`At any moment, when one player has more than 24 seeds in their Kalah, they win. That can happen before the board is empty, but, there is also a second way. When you don't have any seed in your houses, the game is over and your opponent takes all the remaining seeds from their houses. Here, your opponent just need one more point to win and will get it next turn if you allow it.<br/><br/>You're playing Dark, win!`,
            new MancalaState([
                [0, 0, 0, 0, 2, 0],
                [2, 0, 0, 0, 0, 1],
            ], 0, [19, 24]),
            [
                KalahMove.of(MancalaDistribution.FIVE),
            ],
            $localize`Since there is no longer seeds in the opponent houses, all your seeds have been captured by you. Congratulations, you won!`,
            $localize`Failed, you gave the opponent a seed! Try again.`,
        ),
    ];
}
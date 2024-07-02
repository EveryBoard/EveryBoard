import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { MancalaState } from '../common/MancalaState';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { KalahRules } from './KalahRules';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MancalaConfig } from '../common/MancalaConfig';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { MancalaTutorial } from '../common/MancalaTutorial';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';

const defaultConfig: MGPOptional<MancalaConfig> = KalahRules.get().getDefaultRulesConfig();

export class KalahTutorial extends Tutorial {

    public gameName: string = $localize`Kalah`;

    public tutorial: TutorialStep[] = [
        MancalaTutorial.intro(
            this.gameName,
            KalahRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Kalah`,
            $localize`Bonus fact: Kalah has been created in the U.S.A in 1940 by William Julius Champion Jr.`,
            KalahRules.get().getInitialState(defaultConfig),
        ),
        MancalaTutorial.sowing(KalahRules.get().getInitialState(defaultConfig)),
        TutorialStep.fromMove(
            $localize`The Kalah` + ' (1/2)',
            $localize`The houses on the extreme left and right, unaligned with the others, are the Kalah. Yours is on the left, the opponent's on the right. When sowing, before passing from your leftmost house to the leftmost house of the opponent, you must drop one seed in your Kalah, but you won't have to drop seed in your opponent's Kalah. When you make a capture, the captured seeds are put in your Kalah.<br/><br/>You're playing Dark. Make a move that passes through your Kalah then feeds opponent's houses.`,
            KalahRules.get().getInitialState(defaultConfig),
            [
                MancalaMove.of(MancalaDistribution.of(0)),
                MancalaMove.of(MancalaDistribution.of(1)),
                MancalaMove.of(MancalaDistribution.of(2)),
            ],
            $localize`As you see, three houses have been fed in addition to your Kalah.`,
            $localize`Failed. Choose the three leftmost house on the bottom.`,
        ),
        TutorialStep.fromPredicate(
            $localize`The Kalah` + ' (2/2)',
            $localize`When ending in the Kalah, you must distribute again.<br/><br/>You're playing Dark, play the house that ends up in the Kalah then do a second distribution!`,
            KalahRules.get().getInitialState(defaultConfig),
            MancalaMove.of(MancalaDistribution.of(3), [MancalaDistribution.of(1)]),
            (move: MancalaMove, _previous: MancalaState, _result: MancalaState) => {
                if (move.distributions.length === 1) {
                    return MGPValidation.failure($localize`This move only distributed one house, do one distribution that ends in the Kalah, then do a second one!`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Captures`,
            $localize`When the last seed of a distribution ends up in one of your empty houses, if the opposite house is filled, then you capture both houses. On this board, such a move is possible.<br/><br/>You're playing Dark, do a capture!`,
            new MancalaState([
                [0, 4, 4, 4, 4, 4],
                [0, 2, 0, 2, 4, 0],
            ], 4, PlayerNumberMap.of(0, 0)),
            MancalaMove.of(MancalaDistribution.of(1), [MancalaDistribution.of(0), MancalaDistribution.of(3)]),
            (_move: MancalaMove, _state: MancalaState, resultingState: MancalaState) => {
                if (resultingState.getPieceAtXY(1, 0) === 0) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You did not capture, try again!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            TutorialStepMessage.END_OF_THE_GAME(),
            $localize`At any moment, when one player has more than 24 seeds in their Kalah, they win. That can happen before the board is empty, but, there is also a second way. When you don't have any seed in your houses, the game is over and your opponent takes all the remaining seeds from their houses. Here, your opponent just need one more point to win and will get it next turn if you allow it.<br/><br/>You're playing Dark, win!`,
            new MancalaState([
                [0, 0, 0, 0, 2, 0],
                [2, 0, 0, 0, 0, 1],
            ], 0, PlayerNumberMap.of(19, 24)),
            [
                MancalaMove.of(MancalaDistribution.of(5)),
            ],
            $localize`Since there is no longer seeds in the opponent houses, all your seeds have been captured by you. Congratulations, you won!`,
            $localize`Failed, you gave the opponent a seed! Try again.`,
        ),
    ];
}

import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';
import { EpaminondasState } from 'src/app/games/epaminondas/EpaminondasState';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { EpaminondasConfig, EpaminondasRules } from './EpaminondasRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

const defaultConfig: MGPOptional<EpaminondasConfig> = EpaminondasRules.get().getDefaultRulesConfig();

export class EpaminondasTutorial extends Tutorial {


    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board`,
            $localize`This is the initial board of Epaminondas. The top line is the starting line of Light. The bottom line is the starting line of Dark.`,
            EpaminondasRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME() + ' (1/2)',
            $localize`After multiple moves, if at the beginning of its turn, a player has more pieces on the opponent's starting line than the number of pieces the opponent has on the player's starting line, the player wins. Here, it's Dark's turn to play: Dark has therefore won.`,
            new EpaminondasState([
                [_, _, _, _, _, O, _, _, X, X, X, X, X, X],
                [_, _, _, _, _, O, _, _, _, _, _, _, X, X],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O, O, O, O, _, _, _],
            ], 0),
        ),
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME() + ' (2/2)',
            $localize`Here, it is Light's turn. Light wins because they have two pieces on Dark's starting line, and Dark only has one on Light's starting line.`,
            new EpaminondasState([
                [_, _, _, _, _, O, _, _, _, _, X, X, X, X],
                [_, _, _, _, _, O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, X, X, _, _, _, O, O, _, O, O, O, O],
            ], 1),
        ),
        TutorialStep.fromPredicate(
            $localize`Moving a piece`,
            $localize`Here is the starting board. Dark plays first. Let's start with moving a single piece:<ol><li>Click on a piece.</li><li>Click on a empty neighboring square.</li></ol><br/>You're playing Dark, move a piece.`,
            EpaminondasRules.get().getInitialState(defaultConfig),
            new EpaminondasMove(0, 10, 1, 1, Ordinal.UP),
            (move: EpaminondasMove, _previous: EpaminondasState, _result: EpaminondasState) => {
                if (move.phalanxSize === 1) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Congratulations, you are in advance. But this is not the exercise here, try again.`);
                }
            },
            $localize`This is how you move a single piece.`,
        ),
        TutorialStep.fromPredicate(
            $localize`Moving a phalanx`,
            $localize`A line of several pieces is called a phalanx. Let us now see how to move a phalanx along a line:<ol><li>Click on the first piece of the phalanx.</li><li>Click on one of the squares highlighted in yellow; you can move your phalanx up to a distance equal to its length.</li></ol><br/>You're playing Dark, move a phalanx!`,
            EpaminondasRules.get().getInitialState(defaultConfig),
            new EpaminondasMove(0, 11, 2, 1, Ordinal.UP),
            (move: EpaminondasMove, _previous: EpaminondasState, _result: EpaminondasState) => {
                if (move.phalanxSize > 1) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Failed! You moved only one piece.`);
                }
            },
            $localize`Congratulations! The moved pieces can be horizontally, vertically, or diagonally aligned. The move should be made along this axis, forward or backwards. There can be no opponent nor holes in the phalanx.`,
        ),
        TutorialStep.fromMove(
            $localize`Captures`,
            $localize`In order to capture an opponent phalanx, it must be aligned with the phalanx you are moving and be strictly shorter. The first piece of your phalanx should land on the first piece of the opponent's phalanx that you want to capture.<br/>You're playing Dark, capture a phalanx.`,
            new EpaminondasState([
                [_, _, _, _, _, _, _, _, X, X, X, X, X, X],
                [_, _, _, _, _, _, X, _, _, _, _, _, _, _],
                [_, _, _, _, _, X, _, _, _, _, _, _, _, _],
                [_, _, X, _, X, _, _, _, _, _, _, _, _, _],
                [_, _, X, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, X, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, O, _, _, _, _, X, _, _, _, _, _, _],
                [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O, O, O, O, O, O, O],
            ], 0),
            [new EpaminondasMove(2, 10, 4, 2, Ordinal.UP)],
            $localize`Congratulations, you made it! Note that the diagonal phalanx was not aligned with your phalanx, hence even if it is longer, this does not prevent you from capturing some of its pieces on another alignment.`,
            $localize`Failed, you have not captured the phalanx.`,
        ),
    ];
}

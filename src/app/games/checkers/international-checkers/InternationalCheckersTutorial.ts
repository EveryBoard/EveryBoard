import { MGPValidation } from '@everyboard/lib';

import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { Coord } from '../../../jscaip/Coord';
import { CheckersConfig } from '../common/AbstractCheckersRules';
import { CheckersMove } from '../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from '../common/CheckersState';
import { CheckersTutorialStep } from '../common/CheckersTutorialStep';

import { InternationalCheckersRules } from './InternationalCheckersRules';

const U: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
const O: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED]);
const V: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
const _: CheckersStack = CheckersStack.EMPTY;
const defaultConfig: CheckersConfig = InternationalCheckersRules.get().getDefaultRulesConfig();

export class InternationalCheckersTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`The goal of checkers is to render the opponent unable to move, either by capturing all their pieces, or by blocking them.`,
            InternationalCheckersRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            CheckersTutorialStep.SIMPLE_STEPS_TITLE(),
            CheckersTutorialStep.SIMPLE_STEPS(),
            InternationalCheckersRules.get().getInitialState(defaultConfig),
            CheckersMove.fromStep(new Coord(5, 6), new Coord(4, 5)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Captures`,
            CheckersTutorialStep.CAPTURES(),
            CheckersState.of([
                [_, V, _, V, _, V, _, V, _, V],
                [V, _, V, _, V, _, V, _, V, _],
                [_, V, _, V, _, V, _, V, _, V],
                [V, _, _, _, V, _, _, _, V, _],
                [_, V, _, _, _, _, _, V, _, _],
                [U, _, _, _, _, _, _, _, _, _],
                [_, U, _, U, _, U, _, U, _, _],
                [U, _, U, _, U, _, U, _, U, _],
                [_, U, _, U, _, U, _, U, _, U],
                [U, _, U, _, U, _, U, _, U, _],
            ], 4),
            CheckersMove.fromCapture([new Coord(0, 5), new Coord(2, 3)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ).withPreviousMove(CheckersMove.fromStep(new Coord(2, 3), new Coord(1, 4))),
        TutorialStep.anyMove(
            CheckersTutorialStep.BACKWARD_CAPTURES_TITLE(),
            CheckersTutorialStep.BACKWARD_CAPTURES(),
            CheckersState.of([
                [_, V, _, V, _, V, _, V, _, V],
                [V, _, V, _, V, _, V, _, V, _],
                [_, V, _, V, _, _, _, V, _, V],
                [_, _, V, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, U, _, _],
                [_, _, U, _, _, _, _, _, V, _],
                [_, U, _, _, _, U, _, _, _, _],
                [_, _, U, _, U, _, U, _, _, _],
                [_, U, _, U, _, U, _, U, _, U],
                [U, _, U, _, U, _, U, _, U, _],
            ], 2),
            CheckersMove.fromCapture([new Coord(7, 4), new Coord(9, 6)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            CheckersTutorialStep.MULTIPLE_CAPTURES_TITLE(),
            CheckersTutorialStep.MULTIPLE_CAPTURES(),
            CheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, V, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, V, _, _],
                [_, _, _, _, _, _, U, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 2),
            CheckersMove.fromCapture([new Coord(6, 7), new Coord(8, 5), new Coord(6, 3)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Maximum capture`,
            $localize`If at some turn you have several capture choices, you have to capture the maximal number of pieces.<br/><br/>You are playing Dark, do the maximal capture.`,
            CheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, V, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, V, _, V, _, _],
                [_, _, _, _, _, _, U, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 2),
            CheckersMove.fromCapture([new Coord(6, 5), new Coord(8, 3), new Coord(6, 1)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            CheckersTutorialStep.PROMOTION_TITLE(),
            $localize`When a piece reaches the last line, it is promoted and becomes a king, and gains abilities that will be explained in next step! One of your piece could be promoted now.<br/><br/>You're playing Dark. Do it.`,
            CheckersState.of([
                [_, _, _, _, _, _, _, _, _, V],
                [_, _, _, _, _, _, U, _, V, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, U, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 2),
            [
                CheckersMove.fromStep(new Coord(6, 1), new Coord(5, 0)),
                CheckersMove.fromStep(new Coord(6, 1), new Coord(7, 0)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You did not choose the correct piece, and got no promotion.`,
        ),
        TutorialStep.fromPredicate(
            $localize`King move`,
            $localize`Kings can, like any other piece, move forward and capture backward. They have extra abilities. First, they can move backward without capturing. Second, they are able to "fly": they can move over multiple squares without jumping over any piece, or by jumping over exactly one opponent piece to capture it, and finally landing wherever in the same line.<br/><br/>You're playing Dark, move your king!`,
            CheckersState.of([
                [_, _, _, _, _, _, _, O, _, V],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, V, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, U, _, _, U, _, U, _, U],
            ], 2),
            CheckersMove.fromStep(new Coord(7, 0), new Coord(0, 7)),
            (move: CheckersMove, _ps: CheckersState, _rs: CheckersState) => {
                if (move.getStartingCoord().equals(new Coord(7, 0))) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You did not move your king.`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Capture rule`,
            $localize`When you do multiple jumps, you cannot jump twice over the same piece.The captured pieces are actually removed after your full moves.<br/>Here you have to apply all the different capturing rules: backward, maximal, flying, and not jumping twice over the same piece.<br/><br/>You are playing Dark, go ahead.`,
            new CheckersState([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, V, _, _, _, _],
                [_, _, _, _, _, _, V, _, V, _],
                [_, _, _, _, _, _, _, _, _, O],
                [_, _, _, _, V, _, V, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 20),
            CheckersMove.fromCapture([
                new Coord(9, 7),
                new Coord(6, 4),
                new Coord(3, 7),
                new Coord(5, 9),
                new Coord(7, 7),
            ]),
            TutorialStepMessage.CONGRATULATIONS_YOU_WON(),
        ),
    ];
}

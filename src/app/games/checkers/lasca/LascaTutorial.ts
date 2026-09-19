import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { Coord } from '../../../jscaip/Coord';
import { CheckersConfig } from '../common/AbstractCheckersRules';
import { CheckersMove } from '../common/CheckersMove';
import { CheckersPiece, CheckersStack, EvenCheckersState } from '../common/CheckersState';
import { CheckersTutorialStep } from '../common/CheckersTutorialStep';

import { LascaRules } from './LascaRules';

const zero: CheckersPiece = CheckersPiece.ZERO;
const one: CheckersPiece = CheckersPiece.ONE;
const _u: CheckersStack = new CheckersStack([zero]);
const _v: CheckersStack = new CheckersStack([one]);
const vv: CheckersStack = new CheckersStack([one, one]);
const vU: CheckersStack = new CheckersStack([one, CheckersPiece.ZERO_PROMOTED]);
const uv: CheckersStack = new CheckersStack([zero, one]);
const Uv: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED, one]);
const __: CheckersStack = CheckersStack.EMPTY;
const defaultConfig: CheckersConfig = LascaRules.get().getDefaultRulesConfig();

export class LascaTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Lasca: origins`,
            $localize`Lasca is a game based on checkers, created in 1911 by Emanuel Lasker, a chess world champion. It's played on a 7x7 board, each player has 11 pieces.`,
            LascaRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`The goal of Lasca is, like for checkers, to render the opponent unable to move, either by capturing all their pieces, or by blocking them.`,
            LascaRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Steps`,
            CheckersTutorialStep.SIMPLE_STEPS(),
            LascaRules.get().getInitialState(defaultConfig),
            CheckersMove.fromStep(new Coord(4, 4), new Coord(3, 3)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Captures`,
            CheckersTutorialStep.CAPTURES(),
            EvenCheckersState.of([
                [_v, __, __, __, _v, __, _v],
                [__, __, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, _v, __, __, __, __, __],
                [_u, __, _u, __, _u, __, _u],
                [__, _u, __, _u, __, _u, __],
                [_u, __, _u, __, _u, __, _u],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 4), new Coord(0, 2)]),
            $localize`Congratulations, notice that the captured piece was not removed from the board, but put below the capturing pieces.`,
        ),
        TutorialStep.anyMove(
            CheckersTutorialStep.MULTIPLE_CAPTURES_TITLE(),
            CheckersTutorialStep.MULTIPLE_CAPTURES(),
            EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_v, __, __, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, _v, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 6), new Coord(0, 4), new Coord(2, 2)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Minority capture is allowed`,
            $localize`If you have several capture choices, you are allowed to choose any of them. For example if one choice is to capture one piece, and the other choice is to capture two pieces, you can choose either.<br/><br/>You're playing Dark. Do the shortest capture here!`,
            EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _v, __],
                [__, __, __, __, __, __, __],
                [__, _v, __, _v, __, __, __],
                [__, __, _u, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 4), new Coord(0, 2)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            CheckersTutorialStep.PROMOTION_TITLE(),
            $localize`When a stack reaches the last line, its commander becomes an officer, and gains the ability to go backward, which is illegal for the other pieces! One of your pieces could be promoted now.<br/><br/>You're playing Dark. Do it.`,
            EvenCheckersState.of([
                [__, __, __, __, __, __, _v],
                [__, __, __, uv, __, _v, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
            ], 2),
            [
                CheckersMove.fromStep(new Coord(3, 1), new Coord(2, 0)),
                CheckersMove.fromStep(new Coord(3, 1), new Coord(4, 0)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You did not choose the correct stack, and got no promotion.`,
        ),
        TutorialStep.fromMove(
            $localize`Officer move`,
            $localize`Officers can move and capture backward as well as forward.<br/><br/>You're playing Dark, move your officer!`,
            EvenCheckersState.of([
                [__, __, __, __, Uv, __, _v],
                [__, __, __, __, __, __, __],
                [__, __, __, __, _v, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
            ], 2),
            [
                CheckersMove.fromStep(new Coord(4, 0), new Coord(3, 1)),
                CheckersMove.fromStep(new Coord(4, 0), new Coord(5, 1)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You did not move your officer.`,
        ),
        TutorialStep.fromMove(
            $localize`Stack capture`,
            $localize`In Lasca, when a stack is captured, only the top piece is removed. After the capture, the stack can therefore be commanded by the opponent, depending on the new piece at the top of the stack. But you can also recover a captured king. This is the case here, recover your king!`,
            EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, vU, __, _v, __],
                [__, __, __, __, _u, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, __, __, __, __, _v, __],
                [__, __, __, __, __, __, __],
            ], 0),
            [CheckersMove.fromCapture([new Coord(4, 2), new Coord(2, 0)])],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You did not capture the right piece.`,
        ),
        TutorialStep.anyMove(
            $localize`No promotion mid-capture`,
            $localize`If, during a multiple capture, a piece reaches the last line, this piece will stop there and be promoted. But it cannot continue its capture as it is only promoted after the capture.<br/><br/>You are playing Dark, do a capture.`,
            EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, _v, __, _v, __, __, __],
                [_u, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 0),
            CheckersMove.fromCapture([new Coord(0, 2), new Coord(2, 0)]),
            $localize`Observe how your piece got promoted but could not continue its capture further.`,
        ),
        TutorialStep.anyMove(
            $localize`Capture rule`,
            $localize`When making multiple captures, you cannot jump twice over the same stack. The captured commander is immediately placed under your capturing stack, while the rest of the captured stack stays on its square. Even if this exposes another opposing commander, you cannot capture that stack again during the same move.<br/><br/>You are playing Dark. Capture as much pieces as possible.`,
            EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, _v, __, vv, __],
                [__, __, __, __, __, __, Uv],
                [__, __, __, _v, __, _v, __],
                [__, __, __, __, __, __, __],
            ], 0),
            CheckersMove.fromCapture([
                new Coord(6, 4),
                new Coord(4, 2),
                new Coord(2, 4),
                new Coord(4, 6),
                new Coord(6, 4),
            ]),
            TutorialStepMessage.CONGRATULATIONS_YOU_KNOW_EVERYTHING(),
        ),
    ];
}

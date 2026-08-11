import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { Coord } from '../../../jscaip/Coord';
import { CheckersConfig } from '../common/AbstractCheckersRules';
import { CheckersMove } from '../common/CheckersMove';
import { CheckersPiece, CheckersStack, OddCheckersState } from '../common/CheckersState';
import { CheckersTutorialStep } from '../common/CheckersTutorialStep';

import { BashniRules } from './BashniRules';

const zero: CheckersPiece = CheckersPiece.ZERO;
const one: CheckersPiece = CheckersPiece.ONE;
const _u: CheckersStack = new CheckersStack([zero]);
const _O: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED]);
const _v: CheckersStack = new CheckersStack([one]);
const uv: CheckersStack = new CheckersStack([zero, one]);
const Uv: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED, one]);
const vU: CheckersStack = new CheckersStack([one, CheckersPiece.ZERO_PROMOTED]);
const __: CheckersStack = CheckersStack.EMPTY;
const defaultConfig: CheckersConfig = BashniRules.get().getDefaultRulesConfig();

export class BashniTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Bashni: origins`,
            $localize`Bashni (Russian: башни, towers), also known as column draughts, is a Russian checkers variant. Captured pieces are not removed but stacked under the capturing piece, forming towers.`,
            BashniRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`The goal of Bashni is, like for checkers, to render the opponent unable to move, either by capturing all their pieces, or by blocking them.`,
            BashniRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Steps`,
            CheckersTutorialStep.SIMPLE_STEPS(),
            BashniRules.get().getInitialState(defaultConfig),
            CheckersMove.fromStep(new Coord(0, 5), new Coord(1, 4)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Captures`,
            $localize`A capture happens when you jump diagonally over an opponent piece. In Bashni, the captured piece is not removed: it goes under your piece, forming a tower. You have to capture when you can.<br/><br/>You're playing Dark, do a capture.`,
            OddCheckersState.of([
                [__, _v, __, _v, __, _v, __, _v],
                [_v, __, _v, __, _v, __, _v, __],
                [__, _v, __, _v, __, _v, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, _v, __, __],
                [_u, __, _u, __, _u, __, _u, __],
                [__, _u, __, _u, __, _u, __, _u],
                [_u, __, _u, __, _u, __, _u, __],
            ], 0),
            CheckersMove.fromCapture([new Coord(6, 5), new Coord(4, 3)]),
            $localize`Congratulations! Notice that the captured piece was not removed from the board, but put below the capturing piece, forming a tower controlled the player at the top of the tower.`,
        ),
        TutorialStep.anyMove(
            CheckersTutorialStep.BACKWARD_CAPTURES_TITLE(),
            CheckersTutorialStep.BACKWARD_CAPTURES(),
            OddCheckersState.of([
                [__, _v, __, _v, __, _v, __, _v],
                [_v, __, _v, __, _v, __, _v, __],
                [__, _v, __, _v, __, _v, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __, __],
                [__, __, __, __, _u, __, _v, __],
                [__, __, __, _u, __, __, __, __],
                [_u, __, _u, __, _u, __, _u, __],
            ], 0),
            CheckersMove.fromCapture([new Coord(5, 4), new Coord(7, 6)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            CheckersTutorialStep.MULTIPLE_CAPTURES_TITLE(),
            CheckersTutorialStep.MULTIPLE_CAPTURES(),
            OddCheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, _v, __, _v],
                [_v, __, _v, __, __, __, __, __],
                [__, __, __, __, __, _v, __, __],
                [_v, __, __, __, __, __, _u, __],
                [__, __, __, _u, __, _u, __, __],
                [__, __, __, __, __, __, __, __],
            ], 2),
            CheckersMove.fromCapture([new Coord(6, 5), new Coord(4, 3), new Coord(6, 1)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Minority capture is allowed`,
            $localize`In Bashni, unlike International Checkers, you may choose any legal capture sequence. If one choice captures one piece and another captures two, you can choose either.<br/><br/>You're playing Dark, do a capture.`,
            OddCheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, _v, __],
                [__, __, __, __, __, __, __, __],
                [_v, __, _v, __, _v, __, __, __],
                [__, __, __, _u, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
            ], 2),
            [CheckersMove.fromCapture([new Coord(3, 4), new Coord(1, 2)])],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You made the majority capture, but you were asked to do the minority one here!`,
        ),
        TutorialStep.fromMove(
            CheckersTutorialStep.PROMOTION_TITLE(),
            $localize`When a piece reaches the last line, it is promoted and becomes a king. Only the top piece of a tower is promoted. One of your pieces could be promoted now.<br/><br/>You're playing Dark. Do it.`,
            OddCheckersState.of([
                [__, __, __, __, __, __, __, _v],
                [__, __, uv, __, _v, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, _u, __, _u, __, _u],
                [__, __, __, __, __, __, __, __],
            ], 2),
            [
                CheckersMove.fromStep(new Coord(2, 1), new Coord(1, 0)),
                CheckersMove.fromStep(new Coord(2, 1), new Coord(3, 0)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You did not choose the correct piece, and got no promotion.`,
        ),
        TutorialStep.fromMove(
            $localize`King move`,
            $localize`Kings can move and capture backward as well as forward. They can also "fly": move over multiple squares or jump over one opponent piece to capture it and land anywhere on the same diagonal.<br/><br/>You're playing Dark, move your king to capture two pieces of the opponent!`,
            OddCheckersState.of([
                [__, __, __, __, __, Uv, __, _v],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, _v, __, __, __, __, __, __],
                [__, __, __, __, _u, __, _u, __],
            ], 2),
            [
                CheckersMove.fromCapture([new Coord(5, 0), new Coord(0, 5), new Coord(2, 7)]),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`You should capture twice!`,
        ),
        TutorialStep.anyMove(
            $localize`Promotion mid-capture`,
            $localize`In Bashni, if a piece reaches the last line <strong>during a capture sequence</strong>, it immediately becomes a king and may continue capturing with king capabilities (backward and long-range).<br/><br/>You're playing Dark. Capture two light pieces. Your piece will promote mid-sequence and continue as a king!`,
            OddCheckersState.of([
                [__, __, __, __, __, __, __, __],
                [_v, __, _v, __, _v, __, __, __],
                [__, __, __, __, __, _u, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
            ], 0),
            CheckersMove.fromCapture([new Coord(5, 2), new Coord(3, 0), new Coord(0, 3)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Tower capture`,
            $localize`In Bashni, when a tower is captured, only the top piece is removed. After the capture, the old tower can therefore be commanded by the opponent, depending on the new piece at the top of the tower. But you can also recover a captured king. This is the case here, recover your king!`,
            OddCheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, _u, __, __, __, __, __],
                [__, __, __, vU, __, _v, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __, __],
                [__, __, __, __, __, _v, __, __],
                [__, __, __, __, __, __, __, __],
            ], 0),
            CheckersMove.fromCapture([new Coord(2, 1), new Coord(4, 3), new Coord(6, 1)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Capture rule`,
            $localize`When making multiple captures, you cannot jump twice over the same tower. The captured commander is immediately placed under your capturing tower, while the rest of the captured tower stays on its square. Even if this exposes another opposing commander, you cannot capture that tower again during the same move.<br/>Here you must also use your king's backward and flying capture abilities.<br/><br/>You are playing Dark. Capture all remaining pieces.`,
            OddCheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, _v, __, __, __, __, __, __],
                [__, __, __, __, _v, __, __, __],
                [__, _v, __, __, __, _O, __, __],
                [__, __, __, __, _v, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
            ], 0),
            [
                CheckersMove.fromCapture([
                    new Coord(5, 4),
                    new Coord(2, 1),
                    new Coord(0, 3),
                    new Coord(3, 6),
                    new Coord(5, 4),
                ]),
                CheckersMove.fromCapture([
                    new Coord(5, 4),
                    new Coord(2, 1),
                    new Coord(0, 3),
                    new Coord(3, 6),
                    new Coord(6, 3),
                ]),
                CheckersMove.fromCapture([
                    new Coord(5, 4),
                    new Coord(2, 1),
                    new Coord(0, 3),
                    new Coord(3, 6),
                    new Coord(7, 2),
                ]),
            ],
            TutorialStepMessage.CONGRATULATIONS_YOU_KNOW_EVERYTHING(),
            $localize`You did not capture everything!.`,
        ),
    ];
}

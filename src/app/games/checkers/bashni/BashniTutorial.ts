import { MGPOptional } from '@everyboard/lib';
import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { CheckersMove } from '../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from '../common/CheckersState';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { BashniRules } from './BashniRules';
import { CheckersConfig } from '../common/AbstractCheckersRules';
import { CheckersTutorialStep } from '../common/CheckersTutorialStep';

const zero: CheckersPiece = CheckersPiece.ZERO;
const one: CheckersPiece = CheckersPiece.ONE;
const _u: CheckersStack = new CheckersStack([zero]);
const _v: CheckersStack = new CheckersStack([one]);
const uv: CheckersStack = new CheckersStack([zero, one]);
const Uv: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED, one]);
const __: CheckersStack = CheckersStack.EMPTY;
const defaultConfig: MGPOptional<CheckersConfig> = BashniRules.get().getDefaultRulesConfig();

export class BashniTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Bashni: origins`,
            $localize`Bashni, also known as Russian Checkers or Column Checkers, is a variant of checkers played in Russia. It is played on an 8x8 board, each player has 12 pieces. Like Lasca, pieces form stacks when captured.`,
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
            CheckersMove.fromStep(new Coord(4, 5), new Coord(3, 4)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Captures`,
            CheckersTutorialStep.CAPTURES(),
            CheckersState.of([
                [__, _v, __, _v, __, _v, __, _v],
                [_v, __, _v, __, _v, __, _v, __],
                [__, _v, __, __, __, _v, __, _v],
                [__, __, _v, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [_u, __, _u, __, _u, __, _u, __],
                [__, _u, __, _u, __, _u, __, _u],
                [_u, __, _u, __, _u, __, _u, __],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 5), new Coord(0, 3)]).get(),
            $localize`Congratulations, notice that the captured piece was not removed from the board, but put below the capturing pieces.`,
        ),
        TutorialStep.anyMove(
            CheckersTutorialStep.MULTIPLE_CAPTURES_TITLE(),
            CheckersTutorialStep.MULTIPLE_CAPTURES(),
            CheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, _v, __, __, __, _v, __, _v],
                [__, __, _v, __, _v, __, _v, __],
                [__, __, __, _v, __, _v, __, _v],
                [__, __, __, __, __, __, __, __],
                [__, __, __, _u, __, _u, __, _u],
                [__, __, _u, __, _u, __, _u, __],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 6), new Coord(0, 4), new Coord(2, 2)]).get(),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Minority capture is allowed`,
            $localize`If you have several capture choices, you can choose any of them. However, you must complete the entire capture sequence you choose. For example if one choice is to capture one piece, and the other choice is to capture two pieces, you can choose either, but you must complete all captures in that sequence.`,
            CheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, _v, __],
                [__, __, __, __, __, __, __, __],
                [__, __, _v, __, _v, __, __, __],
                [__, __, __, _u, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
            ], 2),
            CheckersMove.fromCapture([new Coord(3, 4), new Coord(1, 2)]).get(),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Backward capture`,
            $localize`In Bashni, unlike some checkers variants, simple pieces can capture backwards.`,
            CheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, _v, __, __, __, __],
                [__, __, _u, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 5), new Coord(4, 3)]).get(),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.informational(
            $localize`Stacking pieces`,
            $localize`When you capture a piece in Bashni, it is placed under your piece, forming a stack. The piece at the top of the stack determines who controls it. When a stack is captured, only the top piece is removed and placed below the capturing piece.`,
            CheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, uv, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
            ], 2),
        ),
        TutorialStep.fromMove(
            CheckersTutorialStep.PROMOTION_TITLE(),
            $localize`When a piece reaches the last line, it is promoted and becomes a king, and gains abilities such as moving backward! One of your pieces can be promoted now.<br/><br/>You're playing Dark. Do it.`,
            CheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [_u, __, __, __, __, __, __, __],
            ], 6),
            [CheckersMove.fromStep(new Coord(0, 7), new Coord(1, 6))],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.informational(
            $localize`Mid-capture promotion`,
            $localize`In Bashni, if a piece touches the last row during a capture and can continue capturing, it is promoted immediately and can continue capturing as a king! This is different from International Checkers where promotion only happens at the end of the turn.`,
            CheckersState.of([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
            ], 0),
        ),
    ];
}

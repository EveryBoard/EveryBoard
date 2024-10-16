import { MGPOptional } from '@everyboard/lib';
import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { CheckersMove } from '../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from '../common/CheckersState';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { LascaRules } from './LascaRules';
import { CheckersConfig } from '../common/AbstractCheckersRules';

const zero: CheckersPiece = CheckersPiece.ZERO;
const one: CheckersPiece = CheckersPiece.ONE;
const _u: CheckersStack = new CheckersStack([zero]);
const _v: CheckersStack = new CheckersStack([one]);
const uv: CheckersStack = new CheckersStack([zero, one]);
const Uv: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED, one]);
const __: CheckersStack = CheckersStack.EMPTY;
const defaultConfig: MGPOptional<CheckersConfig> = LascaRules.get().getDefaultRulesConfig();

export class LascaTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Lasca: origins`,
            $localize`Lasca is a game based on draughts created in 1911 by Emanuel Lasker, chess world champion. It's played on a 7x7 board, each player has 11 pieces.`,
            LascaRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`The goal of Lasca is, like for draughts, to render the opponent unable to move, either by capturing all his pieces, either by blocking them.`,
            LascaRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Steps`,
            $localize`A simple step is made by one diagonal move forward, left or right. Click on the chosen piece, then on its landing square.<br/><br/>You are playing Dark, do the first move.`,
            LascaRules.get().getInitialState(defaultConfig),
            CheckersMove.fromStep(new Coord(4, 4), new Coord(3, 3)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Captures`,
            $localize`A capture happens when you jump diagonally over an opponent piece to land right behind it. You have to capture when you can. It is the case here, so click on the piece that must capture, and then on its landing square.<br/><br/>You're playing Dark, go ahead.`,
            CheckersState.of([
                [_v, __, __, __, _v, __, _v],
                [__, __, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, _v, __, __, __, __, __],
                [_u, __, _u, __, _u, __, _u],
                [__, _u, __, _u, __, _u, __],
                [_u, __, _u, __, _u, __, _u],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 4), new Coord(0, 2)]).get(),
            $localize`Congratulations, notice that the captured piece was not removed from the board, but put below the capturing pieces.`,
        ),
        TutorialStep.anyMove(
            $localize`Multiple captures`,
            $localize`If, after the beginning of your capture, the piece that you just moved can capture another piece, it has to capture until it can no longer capture. To do so, you must then click again on the next landing square. Note that, you cannot jump twice over the same stack.<br/><br/>You are playing Dark, a double capture is possible, go ahead.`,
            CheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_v, __, __, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, _v, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
            ], 2),
            CheckersMove.fromCapture([new Coord(2, 6), new Coord(0, 4), new Coord(2, 2)]).get(),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.informational(
            $localize`Minority capture is allowed`,
            $localize`If you have several capture choices, you are allowed to choose any of them. For example if one choice is to capture one piece, and the other choice is to capture two pieces, you can choose either.`,
            CheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _v, __],
                [__, __, __, __, __, __, __],
                [__, _v, __, _v, __, __, __],
                [__, __, _u, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 2),
        ),
        TutorialStep.fromMove(
            $localize`Promotion`,
            $localize`When a stack reaches the last line, its commander becomes an officer, and gains the ability to go backward, which is illegal for the other pieces! One of your piece could be promoted now.<br/><br/>You're playing Dark. Do it.`,
            CheckersState.of([
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
            $localize`Officers can move and capture backward as well as forward.<br/><br/>You're playing Dark, move your officier!`,
            CheckersState.of([
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
    ];
}

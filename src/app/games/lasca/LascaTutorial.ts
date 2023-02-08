import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { LascaMove } from './LascaMove';
import { LascaPiece, LascaStack, LascaState } from './LascaState';

const zero: LascaPiece = LascaPiece.ZERO;
const one: LascaPiece = LascaPiece.ONE;
const _u: LascaStack = new LascaStack([zero]);
const _v: LascaStack = new LascaStack([one]);
const uv: LascaStack = new LascaStack([zero, one]);
const __: LascaStack = LascaStack.EMPTY;

export class LascaTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Lasca: origins`,
            $localize`Lasca is a game based on draughts created in 1911 by Emanuel Lasker, chess world champion. It's played on a 7x7 board, each player has 11 pieces.`,
            LascaState.getInitialState(),
        ),
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`The goal of Lasca is, like for draughts, to render the opponent unable to move, either by capturing all his pieces, either by blocking them.`,
            LascaState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Steps`,
            $localize`A simple step is made by one diagonal move forward, left or right. Click on the chosen piece, then on its landing square.<br/><br/>You are playing Dark, do the first move.`,
            LascaState.getInitialState(),
            LascaMove.fromStep(new Coord(4, 4), new Coord(3, 3)).get(),
            $localize`Congratulations!`,
        ),
        TutorialStep.anyMove(
            $localize`Capture`,
            $localize`You have to capture when you can. It is the case here, so click on the piece that must capture, and then on its landing square.<br/><br/>You're playing Dark, go ahead.`,
            LascaState.from([
                [_v, __, __, __, _v, __, _v],
                [__, __, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, _v, __, __, __, __, __],
                [_u, __, _u, __, _u, __, _u],
                [__, _u, __, _u, __, _u, __],
                [_u, __, _u, __, _u, __, _u],
            ], 2),
            LascaMove.fromCapture([new Coord(2, 4), new Coord(0, 2)]).get(),
            $localize`Congratulations, notice that the captured piece was not removed from the board, but put below the capturing pieces.`,
        ),
        TutorialStep.anyMove(
            $localize`Multiple captures`,
            $localize`If, after the beginning of your capture, the piece that you just moved can capture another piece, it has to capture until it can no longer capture. To do so, you must then click again on the next landing square. Note that, you cannot jump twice over the same stack.<br/><br/>You are playing Dark, a double capture is possible, go ahead.`,
            LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_v, __, __, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, _v, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
            ], 2),
            LascaMove.fromCapture([new Coord(2, 6), new Coord(0, 4), new Coord(2, 2)]).get(),
            $localize`Congratulations!`,
        ),
        TutorialStep.informational(
            $localize`Minority capture is allowed`,
            $localize`If you have several capture choices, you are allowed to choose any of them. For example if one choice is to capture one piece, and the other choice is to capture two pieces, you can choose either.`,
            LascaState.from([
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
            $localize`When a pile reach the last line, it's commander become officer, and gain the ability to go backward, which is illegal for a non-officer piece! One of your piece could be promoted now.<br/><br/>You're playing Dark. Do it.`,
            LascaState.from([
                [__, __, __, __, __, __, _v],
                [__, __, __, uv, __, _v, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
            ], 2),
            [
                LascaMove.fromStep(new Coord(3, 1), new Coord(2, 0)).get(),
                LascaMove.fromStep(new Coord(3, 1), new Coord(4, 0)).get(),
            ],
            $localize`Congratulations!`,
            $localize`This is not it`,
        ),
    ];
}

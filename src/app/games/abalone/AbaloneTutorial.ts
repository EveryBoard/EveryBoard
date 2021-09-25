import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { AbaloneGameState } from './AbaloneGameState';
import { AbaloneMove } from './AbaloneMove';

const _: number = FourStatePiece.EMPTY.value;
const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;

export const abaloneTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Initial board and goal of the game`,
        $localize`At Abalone, the goal of the game is to be the first player to push 6 opponent's pieces out of the board. Let us see how!`,
        AbaloneGameState.getInitialState(),
    ),
    TutorialStep.anyMove(
        $localize`Moving a piece`,
        $localize`At each turn, move one, two, or three pieces either along their line, or on their side.
        For your moves you can therefore choose between up to 6 directions.
        The pieces you move must be aligned and consecutive, and the move should land on an empty space (except to push, we will see that later).
        To make a move, click on one of your pieces, then click on an arrow to choose the move direction.<br/><br/>
        You're playing Dark, make any move!`,
        AbaloneGameState.getInitialState(),
        AbaloneMove.fromSingleCoord(new Coord(2, 6), HexaDirection.UP).get(),
        $localize`Congratulations!`,
    ),
    TutorialStep.fromMove(
        $localize`Pushing`,
        $localize`To push one opponent piece, you must move at least two of your pieces.
        To push two opponent pieces, you must move three of your pieces.
        If one of your pieces is in the way, it will be impossible to push.
        You cannot move more than three pieces.<br/><br/>
        Only one push towards the right is possible here, find it. (You're playing Dark).`,
        new AbaloneGameState([
            [N, N, N, N, _, O, O, X, X],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, O, O, O, X, O, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, O, O, X, X],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, O, X, _, N, N],
            [_, _, _, O, _, _, N, N, N],
            [_, _, O, _, _, N, N, N, N],
        ], 0),
        [AbaloneMove.fromSingleCoord(new Coord(4, 4), HexaDirection.RIGHT).get()],
        $localize`Congratulations! You know everything you need to start a game!`,
        $localize`Failed!`,
    ),
];

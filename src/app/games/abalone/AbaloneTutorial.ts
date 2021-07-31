import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { AbaloneGameState } from './AbaloneGameState';
import { AbaloneMove } from './AbaloneMove';

const _: number = FourStatePiece.EMPTY.value;
const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;

export const abaloneTutorial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Initial board and goal of the game`,
        $localize`At Abalone, the goal of the game is to be the first player to push 6 opponent's pieces out of the board. Let us see how!`,
        AbaloneGameState.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        $localize`Moving a piece`,
        $localize`At each turn, move one, two, or three pieces either along their line, or on their side.
        For your moves you can therefore choose between 6 directions.
        The pieces you move must be aligned and consecutive, and the move should land on an empty space (except to push, we will see that later).
        To make a move, click on one of your pieces, then click on an arrow to choose the move direction.<br/><br/>
        You're playing Dark, make any move!`,
        AbaloneGameState.getInitialSlice(),
        AbaloneMove.fromSingleCoord(new Coord(2, 6), HexaDirection.UP),
        $localize`Congratulations!`,
    ),
    DidacticialStep.fromMove(
        $localize`Pushing`,
        $localize`To push one piece, you must move at least two of your pieces.
        To push two pieces, you must move three of your pieces.
        If one of your pieces blocks the push, it will be impossible to push.
        You cannot move four pieces or more.
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
        [AbaloneMove.fromSingleCoord(new Coord(4, 4), HexaDirection.RIGHT)],
        $localize`Congratulations ! You know everything to start a game!`,
        $localize`Failed!`,
    ),
];

import { CoerceoMove } from 'src/app/games/coerceo/CoerceoMove';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { CoerceoPartSlice } from 'src/app/games/coerceo/CoerceoPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

const _: number = FourStatePiece.EMPTY.value;
const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;

export const coerceoTutorial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Board and goal of the game`,
        $localize`Coerceo is played on a board like this, composed of hexagonal tiles, each comprising 6 triangles.
         The triangles are the cases along which pieces move during the game.
         The tiles can be removed from the board (you will see how later).
         The dark pieces belong to the first player and can only move on the dark cases,
         while the light pieces belong to the second player and can only move on the light cases.
         The goal of the game is to capture all of the opponent's pieces.`,
        CoerceoPartSlice.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        $localize`Move`,
        $localize`To move a piece, you need to:
        <ul>
          <li>1. Click on one of your pieces.</li>
          <li>2. Click on of the triangular space highlighted in yellow.</li>
        </ul>
        You can pass through the opponent's pieces.
        You're playing first, hence you're playing Dark. Perform any move.
        Note: no matter what you do, no piece can be captured during your first turn.`,
        CoerceoPartSlice.getInitialSlice(),
        CoerceoMove.fromCoordToCoord(new Coord(3, 5), new Coord(5, 5)),
        $localize`Congratulations! Let's see captures now.`,
    ),
    DidacticialStep.fromMove(
        $localize`Capture`,
        $localize`Every piece has three neighbouring triangular cases (2 on the sides).
        When all neighbouring cases except one are occupied, and one opponent moves to that last free case, your piece is captured!
        However, it is possible to place a piece between 3 of the opponent's pieces (or 2 on the side) without being captured.<br/><br/>
        You're playing Light, make a capture.`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, O, _, O, N, N, N, N, N, N],
            [N, N, N, O, _, _, _, _, _, O, _, _, N, N, N],
            [_, X, _, X, O, X, _, _, O, _, _, X, _, X, _],
            [X, _, _, _, _, _, _, _, _, _, X, _, _, _, X],
            [_, X, _, X, _, _, _, _, _, _, _, X, _, X, _],
            [_, O, _, O, _, _, _, _, _, _, _, O, _, O, _],
            [O, _, _, _, O, _, _, _, _, _, O, _, _, _, O],
            [_, O, _, O, _, _, X, _, X, _, _, O, _, O, _],
            [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ], 3, [0, 0], [0, 0]),
        [
            CoerceoMove.fromCoordToCoord(new Coord(5, 2), new Coord(4, 1)),
            CoerceoMove.fromCoordToCoord(new Coord(3, 4), new Coord(4, 3)),
        ],
        $localize`Congratulations!`,
        $localize`Failed, you have not captured any piece.`,
    ),
    DidacticialStep.fromMove(
        $localize`Gain a tile`,
        $localize`When a tile is empty, she can become removable from the board.
        For it to be removable, three of its sides must be free, and these should be consecutive sides.
        Note that if one empty tile, neighbouring a tile that was just removed, also becomes removable, it will be removed too.
        For example, here, the topmost dark piece will not disconnect its tile when leaving it.
        But, by leaving the bottom left tile, two tiles will be removed.<br/><br/>
        Perform a move that lets you gain two tiles.`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
            [_, _, _, N, N, N, _, _, _, N, N, N, N, N, N],
            [_, _, X, _, _, _, _, O, _, N, N, N, N, N, N],
            [_, _, _, X, _, _, _, _, _, N, N, N, N, N, N],
            [_, _, _, _, _, _, _, _, _, _, _, O, N, N, N],
            [_, _, O, _, _, X, _, _, _, _, O, _, _, _, O],
            [_, _, _, _, _, _, X, _, X, _, _, O, _, O, _],
            [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ], 2, [0, 0], [0, 0]),
        [
            CoerceoMove.fromCoordToCoord(new Coord(2, 6), new Coord(4, 6)),
            CoerceoMove.fromCoordToCoord(new Coord(2, 6), new Coord(3, 5)),
            CoerceoMove.fromCoordToCoord(new Coord(2, 6), new Coord(3, 7)),
        ],
        $localize`Congratulations!`,
        $localize`Failed, you have not gained the two tiles that you could!`,
    ),
    DidacticialStep.fromMove(
        $localize`Exchanging a tile`,
        $localize`When you have a tile, you can see it on the left of the board.
        As soon as you have two, you can click on an opponent's piece to capture it immediately.
        This will cost you two tiles.
        If any tiles are removed during that turn, nobody will get them.<br/><br/>
        Gain some time and capture the last piece!`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, O, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, _, _, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, _, X, _, X, N, N, N, N, N, N],
            [N, N, N, _, _, X, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ], 1, [0, 2], [0, 0]),
        [
            CoerceoMove.fromTilesExchange(new Coord(5, 5)),
        ],
        $localize`Congratulations!`,
        $localize`It's nice to move a piece, but you could have had the opponent's piece immediately by clicking on it!`,
    ),
    DidacticialStep.fromMove(
        $localize`Special capture`,
        $localize`When a tile is removed from the board during your turn, some of the opponent's pieces may have lost their last free neighbouring cases, they will therefore be captured!
        If this happens to one of your piece during your turn, it would however stay on the board.<br/><br/>
        A move that demonstrate both of these things can be done on this board by Light. Try it!<br/><br/>`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, _, _, O, _, _, _, N, N, N, N, N, N],
            [N, N, N, _, O, X, _, X, _, N, N, N, N, N, N],
            [N, N, N, _, X, O, _, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, X, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
        ], 1, [0, 0], [0, 0]),
        [
            CoerceoMove.fromCoordToCoord(new Coord(7, 6), new Coord(6, 5)),
            CoerceoMove.fromCoordToCoord(new Coord(7, 6), new Coord(8, 5)),
        ],
        $localize`Congratulations! See, your piece has lost its last freedom when you have gained the tile, but it stayed on the board as it was your turn.
        The opponent's piece has disappeared because the tile's capture has removed its last freedom.`,
        $localize`Failed!`,
    ),
];

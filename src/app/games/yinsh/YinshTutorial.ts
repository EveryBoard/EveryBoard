import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshBoard } from './YinshBoard';
import { YinshGameState } from './YinshGameState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';

const _: YinshPiece = YinshPiece.EMPTY;
const N: YinshPiece = YinshPiece.EMPTY;
const a: YinshPiece = YinshPiece.MARKER_ZERO;
const A: YinshPiece = YinshPiece.RING_ZERO;
const b: YinshPiece = YinshPiece.MARKER_ONE;
const B: YinshPiece = YinshPiece.RING_ONE;

export const yinshTutorial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Goal of the game`,
        $localize`The goal at Yinsh is to capture three rings in total.
        The rings taken are shown on the top left for the dark player,
        and on the bottom right for the light player. Here, Dark won the game.
        Note that on the board you have two types of pieces for each player:
        rings (empty circles) and markers (full circles).`,
        new YinshGameState(YinshBoard.of([
            [N, N, N, N, N, N, _, _, _, _, N],
            [N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, a, B, _, _, _, _, _, _],
            [N, N, _, a, _, B, _, b, _, _, _],
            [N, _, A, b, _, _, B, a, _, _, _],
            [N, _, _, a, b, _, _, _, _, _, N],
            [_, _, _, a, _, _, _, B, _, _, N],
            [_, _, _, b, a, A, _, _, _, N, N],
            [_, _, _, _, _, _, _, _, N, N, N],
            [_, _, _, _, _, _, _, N, N, N, N],
            [N, _, _, _, _, N, N, N, N, N, N],
        ]), [3, 1], 20),
    ),
    DidacticialStep.anyMove(
        $localize`Initial board and placement phase`,
        $localize`The initial board is empty.
        At the beginning of the game, each player puts one of its ring on the board at their turn.
        This phase stops when all rings have been placed on the board.
        Put one of your ring on the board by clicking the space where you want to place it.`,
        new YinshGameState(YinshBoard.EMPTY, [5, 5], 0),
        new YinshMove([], new Coord(5, 5), MGPOptional.empty(), []),
        $localize`Congratulations!`),
    DidacticialStep.anyMove(
        $localize`Putting a marker`,
        $localize`Once the initial phase is done and all rings are on the board, you need to place markers on the board..
        To do so, put a marker in a ring by clicking on that ring
        Then, the ring must be moved in a straight line, in any direction.
        A ring cannot pass through other rings during its move.
        If it goes over a group of markers, your move must stop at the first empty space after that group.
        All markers in the group are then flipped and their colour change.<br/><br/>
        You're playing dark, do a move.`,
        new YinshGameState(YinshBoard.of([
            [N, N, N, N, N, N, _, _, _, _, N],
            [N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, B, _, _, _, _, _, _, _],
            [N, N, B, _, _, B, _, _, _, _, _],
            [N, _, A, b, _, _, B, _, _, _, _],
            [N, _, _, b, _, _, _, _, _, _, N],
            [_, _, _, _, A, _, _, B, _, _, N],
            [_, _, _, _, _, A, _, _, _, N, N],
            [_, _, _, A, _, _, _, N, N, N, N],
            [_, _, _, _, _, _, _, N, N, N, N],
            [N, _, _, _, _, N, N, N, N, N, N],
        ]), [0, 0], 20),
        new YinshMove([], new Coord(2, 4), MGPOptional.of(new Coord(4, 4)), []),
        $localize`Congratulations!`),
    DidacticialStep.fromMove(
        $localize`Getting a ring by aligning 5 markers`,
        $localize`Finally, the last mechanic you need is to be able to get a ring from the board in order to gain points.
        To do so, you need to align 5 markers of your colour.
        You can then get these markers by clicking on them, and then get one of your ring by clicking on it.
        You will then have one more point.
        You must capture when you can.<br/><br/>
        You're playing dark, perform a capture!`,
        new YinshGameState(YinshBoard.of([
            [N, N, N, N, N, N, _, _, _, _, N],
            [N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, B, _, _, _, _, _, _, _],
            [N, N, B, _, _, B, _, _, _, _, _],
            [N, _, a, a, A, b, b, _, _, _, _],
            [N, _, _, B, _, _, _, _, _, _, N],
            [_, _, _, _, A, _, _, B, _, _, N],
            [_, _, _, _, _, A, _, _, _, N, N],
            [_, _, _, A, _, _, _, A, N, N, N],
            [_, _, _, _, _, _, _, N, N, N, N],
            [N, _, _, _, _, N, N, N, N, N, N],
        ]), [0, 0], 20),
        [new Coord(7, 4), new Coord(4, 6), new Coord(5, 7), new Coord(3, 8), new Coord(7, 8)].map((ringTaken: Coord) =>
            new YinshMove([], new Coord(4, 4), MGPOptional.of(new Coord(7, 4)),
                          [YinshCapture.of(new Coord(2, 4), new Coord(6, 4), ringTaken)])),
        $localize`Congratulations! You need two more captures to win.`,
        $localize`Failed! You need to align 5 markers of your colour in order to get them, and to get a ring at the same time.`),
];

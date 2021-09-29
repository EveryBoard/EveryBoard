import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { GipfBoard } from './GipfBoard';
import { GipfPiece } from './GipfPiece';
import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';

export class GipfState extends HexagonalGameState<GipfPiece, GipfBoard> {

    public static getInitialState(): GipfState {
        const _: GipfPiece = GipfPiece.EMPTY;
        const O: GipfPiece = GipfPiece.PLAYER_ZERO;
        const X: GipfPiece = GipfPiece.PLAYER_ONE;
        const board: Table<GipfPiece> = [
            [_, _, _, X, _, _, O],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, _, _, _, _, _, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, _, _, O, _, _, _],
        ];
        const gipfBoard: GipfBoard = GipfBoard.of(board);
        return new GipfState(gipfBoard, 0, [12, 12], [0, 0]);
    }
    public constructor(board: GipfBoard,
                       turn: number,
                       public readonly sidePieces: [number, number],
                       public readonly capturedPieces: [number, number]) {
        super(turn, board);
    }
    public equals(other: GipfState): boolean {
        if (this.turn !== other.turn) return false;
        if (this.sidePieces[0] !== other.sidePieces[0]) return false;
        if (this.sidePieces[1] !== other.sidePieces[1]) return false;
        if (this.capturedPieces[0] !== other.capturedPieces[0]) return false;
        if (this.capturedPieces[1] !== other.capturedPieces[1]) return false;
        if (this.board.equals(other.board, (p1: GipfPiece, p2: GipfPiece) => p1 === p2) === false) return false;
        return true;
    }
    public getNumberOfPiecesToPlace(player: Player): number {
        return this.sidePieces[player.value];
    }
    public getNumberOfPiecesCaptured(player: Player): number {
        return this.capturedPieces[player.value];
    }
}

import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class GipfState extends HexagonalGameState<FourStatePiece> {

    public static getInitialState(): GipfState {
        const _: FourStatePiece = FourStatePiece.EMPTY;
        const N: FourStatePiece = FourStatePiece.NONE;
        const O: FourStatePiece = FourStatePiece.ZERO;
        const X: FourStatePiece = FourStatePiece.ONE;
        const board: Table<FourStatePiece> = [
            [N, N, N, X, _, _, O],
            [N, N, _, _, _, _, _],
            [N, _, _, _, _, _, _],
            [O, _, _, _, _, _, X],
            [_, _, _, _, _, _, N],
            [_, _, _, _, _, N, N],
            [X, _, _, O, N, N, N],
        ];
        return new GipfState(board, 0, [12, 12], [0, 0]);
    }
    public constructor(board: Table<FourStatePiece>,
                       turn: number,
                       public readonly sidePieces: [number, number],
                       public readonly capturedPieces: [number, number])
    {
        super(turn, board, 7, 7, [3, 2, 1], FourStatePiece.EMPTY);
    }
    public equals(other: GipfState): boolean {
        if (this.turn !== other.turn) return false;
        if (this.sidePieces[0] !== other.sidePieces[0]) return false;
        if (this.sidePieces[1] !== other.sidePieces[1]) return false;
        if (this.capturedPieces[0] !== other.capturedPieces[0]) return false;
        if (this.capturedPieces[1] !== other.capturedPieces[1]) return false;
        return ArrayUtils.compareTable(this.board, other.board);
    }
    public getNumberOfPiecesToPlace(player: Player): number {
        return this.sidePieces[player.value];
    }
    public getNumberOfPiecesCaptured(player: Player): number {
        return this.capturedPieces[player.value];
    }
    public setAtUnsafe(coord: Coord, v: FourStatePiece): this {
        const newBoard: FourStatePiece[][] = ArrayUtils.copyBiArray(this.board);
        newBoard[coord.y][coord.x] = v;
        return new GipfState(newBoard, this.turn, this.sidePieces, this.capturedPieces) as this;
    }
    public isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(this.width, this.height)) {
            return false;
        }
        return this.board[coord.y][coord.x] !== FourStatePiece.NONE;
    }
}

import { Player } from 'src/app/jscaip/Player';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class GipfState extends HexagonalGameState<FourStatePiece> {

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
        return TableUtils.equals(this.board, other.board);
    }

    public getNumberOfPiecesToPlace(player: Player): number {
        return this.sidePieces[player.getValue()];
    }

    public getNumberOfPiecesCaptured(player: Player): number {
        return this.capturedPieces[player.getValue()];
    }

    public setAtUnsafe(coord: Coord, v: FourStatePiece): this {
        const newBoard: FourStatePiece[][] = TableUtils.copy(this.board);
        newBoard[coord.y][coord.x] = v;
        return new GipfState(newBoard, this.turn, this.sidePieces, this.capturedPieces) as this;
    }

    public override isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(this.width, this.height)) {
            return false;
        }
        return this.board[coord.y][coord.x] !== FourStatePiece.UNREACHABLE;
    }
}

import { Coord } from 'src/app/jscaip/Coord';
import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { DvonnPieceStack } from './DvonnPieceStack';

export class DvonnState extends HexagonalGameState<DvonnPieceStack> {

    public static WIDTH: number = 11;
    public static HEIGHT: number = 5;
    public static EXCLUDED_CASES: ReadonlyArray<number> = [2, 1];

    /* Returns the following board:
     *   W B B B W W B D B
     *  B B W W W B B W B B
     * B B B B W D B W W W W
     *  W W B W W B B B W W
     *   W D W B B W W W B
     */
    public static balancedBoard(): Table<DvonnPieceStack> {
        const _: DvonnPieceStack = DvonnPieceStack.NONE;
        const W: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
        const B: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
        const D: DvonnPieceStack = DvonnPieceStack.SOURCE;
        return [
            [_, _, W, B, B, B, W, W, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [B, B, B, B, W, D, B, W, W, W, W],
            [W, W, B, W, W, B, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _],
        ];
    }
    public static isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(DvonnState.WIDTH, DvonnState.HEIGHT)) {
            return false;
        }
        return DvonnState.balancedBoard()[coord.y][coord.x] !== DvonnPieceStack.NONE;
    }
    public static getInitialState(): DvonnState {
        return new DvonnState(DvonnState.balancedBoard(), 0, false);
    }
    public constructor(board: Table<DvonnPieceStack>,
                       turn: number,
                       // Did a PASS move have been performed on the last turn?
                       public readonly alreadyPassed: boolean)
    {
        super(turn, board, DvonnState.WIDTH, DvonnState.HEIGHT, DvonnState.EXCLUDED_CASES, DvonnPieceStack.EMPTY);
    }
    public getAllPieces(): Coord[] {
        const pieces: Coord[] = [];
        for (let y: number = 0; y < DvonnState.HEIGHT; y++) {
            for (let x: number = 0; x < DvonnState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord) && this.getPieceAt(coord).isEmpty() === false) {
                    pieces.push(coord);
                }
            }
        }
        return pieces;
    }
    public numberOfNeighbors(coord: Coord): number {
        return HexagonalGameState.neighbors(coord, 1)
            .filter((c: Coord): boolean => this.isOnBoard(c) && this.getPieceAt(c).isEmpty() === false)
            .length;
    }
    public setAtUnsafe(coord: Coord, value: DvonnPieceStack): this {
        const newBoard: DvonnPieceStack[][] = ArrayUtils.copyBiArray(this.board);
        newBoard[coord.y][coord.x] = value;
        return new DvonnState(newBoard, this.turn, this.alreadyPassed) as this;
    }
    public isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(this.width, this.height)) {
            return false;
        }
        return this.board[coord.y][coord.x] !== DvonnPieceStack.NONE;
    }
}

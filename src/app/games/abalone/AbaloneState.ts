import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { RectangularGameState } from 'src/app/jscaip/RectangularGameState';
import { Table } from 'src/app/utils/ArrayUtils';

export class AbaloneState extends RectangularGameState<FourStatePiece> {

    public static getInitialState(): AbaloneState {
        const _: FourStatePiece = FourStatePiece.EMPTY;
        const N: FourStatePiece = FourStatePiece.NONE;
        const O: FourStatePiece = FourStatePiece.ZERO;
        const X: FourStatePiece = FourStatePiece.ONE;
        const board: Table<FourStatePiece> = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        return new AbaloneState(board, 0);
    }
    public isInBoard(coord: Coord): boolean {
        return coord.isInRange(9, 9) &&
               this.getBoardAt(coord) !== FourStatePiece.NONE;
    }
    public isPiece(coord: Coord): boolean {
        const piece: FourStatePiece = this.getBoardAt(coord);
        return piece === FourStatePiece.ZERO ||
               piece === FourStatePiece.ONE;
    }
    public getScores(): [number, number] {
        const scores: [number, number] = [14, 14];
        for (let y: number = 0; y < 9; y++) {
            for (let x: number = 0; x < 9; x++) {
                if (this.getBoardByXY(x, y) === FourStatePiece.ZERO) {
                    scores[1] = scores[1] - 1;
                }
                if (this.getBoardByXY(x, y) === FourStatePiece.ONE) {
                    scores[0] = scores[0] - 1;
                }
            }
        }
        return scores;
    }
}

import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { NumberTable } from 'src/app/utils/ArrayUtils';

export class AbaloneGameState extends GamePartSlice {

    public static getInitialSlice(): AbaloneGameState {
        const _: number = FourStatePiece.EMPTY.value;
        const N: number = FourStatePiece.NONE.value;
        const O: number = FourStatePiece.ZERO.value;
        const X: number = FourStatePiece.ONE.value;
        const board: NumberTable = [
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
        return new AbaloneGameState(board, 0);
    }
    public isInBoard(coord: Coord): boolean {
        return coord.isInRange(9, 9) &&
               this.getBoardAt(coord) !== FourStatePiece.NONE.value;
    }
    public isPiece(coord: Coord): boolean {
        const piece: number = this.getBoardAt(coord);
        return piece === FourStatePiece.ZERO.value ||
               piece === FourStatePiece.ONE.value;
    }
    public getScores(): [number, number] {
        const scores: [number, number] = [14, 14];
        for (let y: number = 0; y < 9; y++) {
            for (let x: number = 0; x < 9; x++) {
                if (this.getBoardByXY(x, y) === FourStatePiece.ZERO.value) {
                    scores[1] = scores[1] - 1;
                }
                if (this.getBoardByXY(x, y) === FourStatePiece.ONE.value) {
                    scores[0] = scores[0] - 1;
                }
            }
        }
        return scores;
    }
}

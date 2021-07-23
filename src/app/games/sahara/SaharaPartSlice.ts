import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';

export class SaharaPartSlice extends GamePartSlice {

    public static HEIGHT: number = 6;

    public static WIDTH: number = 11;

    public static getInitialSlice(): SaharaPartSlice {
        const N: number = FourStatePiece.NONE.value;
        const O: number = FourStatePiece.ZERO.value;
        const X: number = FourStatePiece.ONE.value;
        const _: number = FourStatePiece.EMPTY.value;
        const board: number[][] = [
            [N, N, O, X, _, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        return new SaharaPartSlice(board, 0);
    }
}

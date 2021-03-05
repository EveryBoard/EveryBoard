import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { SaharaPawn } from './SaharaPawn';

export class SaharaPartSlice extends GamePartSlice {
    public static HEIGHT: number = 6;

    public static WIDTH: number = 11;

    public static getInitialSlice(): SaharaPartSlice {
        const N: number = SaharaPawn.NONE;
        const O: number = SaharaPawn.BLACK;
        const X: number = SaharaPawn.WHITE;
        const _: number = SaharaPawn.EMPTY;
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

import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { SaharaPawn } from './SaharaPawn';

export class SaharaPartSlice extends GamePartSlice {
    public static HEIGHT = 6;

    public static WIDTH = 11;

    public static getInitialSlice(): SaharaPartSlice {
        const NONE: number = SaharaPawn.NONE;
        const BLACK: number = SaharaPawn.BLACK;
        const WHITE: number = SaharaPawn.WHITE;
        const EMPTY: number = SaharaPawn.EMPTY;
        const board: number[][] = [
            [NONE, NONE, BLACK, WHITE, EMPTY, EMPTY, EMPTY, BLACK, WHITE, NONE, NONE],
            [NONE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, NONE],
            [WHITE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BLACK],
            [BLACK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WHITE],
            [NONE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, NONE],
            [NONE, NONE, WHITE, BLACK, EMPTY, EMPTY, EMPTY, WHITE, BLACK, NONE, NONE],
        ];
        return new SaharaPartSlice(board, 0);
    }
}

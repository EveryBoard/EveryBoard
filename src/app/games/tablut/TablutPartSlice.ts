import { GamePartSlice } from '../../jscaip/GamePartSlice';
import { TablutCase } from './tablutrules/TablutCase';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';

export class TablutPartSlice extends GamePartSlice {
    // Statics Fields:

    public static INVADER_START: boolean = true;

    // Statics Methods :

    public static getInitialSlice(): TablutPartSlice {
        const board: number[][] = ArrayUtils.createBiArray(9, 9, TablutCase.UNOCCUPIED.value);

        const PLAYER_ONE_KING: number = TablutCase.PLAYER_ONE_KING.value;
        const PLAYER_ZERO_KING: number = TablutCase.PLAYER_ZERO_KING.value;
        const DEFENDERS: number = TablutCase.DEFENDERS.value;
        const INVADERS: number = TablutCase.INVADERS.value;


        board[4][4] = TablutPartSlice.INVADER_START ? PLAYER_ONE_KING : PLAYER_ZERO_KING;

        board[3][4] = DEFENDERS; board[5][4] = DEFENDERS; board[4][3] = DEFENDERS; board[4][5] = DEFENDERS;
        // closer most defenders
        board[2][4] = DEFENDERS; board[6][4] = DEFENDERS; board[4][2] = DEFENDERS; board[4][6] = DEFENDERS;
        // far defenders

        board[1][4] = INVADERS; board[7][4] = INVADERS; board[4][1] = INVADERS; board[4][7] = INVADERS;
        // closed invader
        board[0][4] = INVADERS; board[8][4] = INVADERS; board[4][0] = INVADERS; board[4][8] = INVADERS;
        // furthest invader
        board[0][3] = INVADERS; board[8][3] = INVADERS; board[3][0] = INVADERS; board[3][8] = INVADERS;
        // one side of the furthest
        board[0][5] = INVADERS; board[8][5] = INVADERS; board[5][0] = INVADERS; board[5][8] = INVADERS;
        // the other side

        return new TablutPartSlice(board, 0);
    }
}

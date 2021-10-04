import { RectangularGameState } from '../../jscaip/RectangularGameState';
import { TablutCase } from './TablutCase';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class TablutState extends RectangularGameState<TablutCase> {

    // Statics Fields:

    public static INVADER_START: boolean = true;

    // Statics Methods :

    public static getInitialState(): TablutState {
        const board: TablutCase[][] = ArrayUtils.createTable(9, 9, TablutCase.UNOCCUPIED);

        const PLAYER_ONE_KING: TablutCase = TablutCase.PLAYER_ONE_KING;
        const PLAYER_ZERO_KING: TablutCase = TablutCase.PLAYER_ZERO_KING;
        const DEFENDERS: TablutCase = TablutCase.DEFENDERS;
        const INVADERS: TablutCase = TablutCase.INVADERS;

        board[4][4] = TablutState.INVADER_START ? PLAYER_ONE_KING : PLAYER_ZERO_KING;

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

        return new TablutState(board, 0);
    }
}

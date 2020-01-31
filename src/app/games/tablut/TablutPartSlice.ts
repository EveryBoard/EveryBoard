import {GamePartSlice} from '../../jscaip/GamePartSlice';

export class TablutPartSlice extends GamePartSlice {

    // statics fields :

    public static readonly UNOCCUPIED = 0;

    public static readonly PLAYER_ZERO_KING = 1;

    public static readonly PLAYER_ONE_KING = 2;

    public static readonly INVADERS = 3;

    public static readonly DEFENDERS = 4;

    public invaderStart: boolean;

    // statics methods :

    public static getStartingBoard(invaderStart: boolean): number[][] {
        const board: number[][] = GamePartSlice.createBiArray(9, 9, this.UNOCCUPIED);
        board[4][4] = invaderStart ? this.PLAYER_ONE_KING : this.PLAYER_ZERO_KING;

        board[3][4] = this.DEFENDERS; board[5][4] = this.DEFENDERS; board[4][3] = this.DEFENDERS; board[4][5] = this.DEFENDERS;
        // closer most defenders
        board[2][4] = this.DEFENDERS; board[6][4] = this.DEFENDERS; board[4][2] = this.DEFENDERS; board[4][6] = this.DEFENDERS;
        // far defenders

        board[1][4] = this.INVADERS; board[7][4] = this.INVADERS; board[4][1] = this.INVADERS; board[4][7] = this.INVADERS;
        // closed invader
        board[0][4] = this.INVADERS; board[8][4] = this.INVADERS; board[4][0] = this.INVADERS; board[4][8] = this.INVADERS;
        // furthest invader
        board[0][3] = this.INVADERS; board[8][3] = this.INVADERS; board[3][0] = this.INVADERS; board[3][8] = this.INVADERS;
        // one side of the furthest
        board[0][5] = this.INVADERS; board[8][5] = this.INVADERS; board[5][0] = this.INVADERS; board[5][8] = this.INVADERS;
        // the other side
        /* TESTS board[4][4] = invaderStart ? this.PLAYER_ONE_KING : this.PLAYER_ZERO_KING;

        board[2][6] = this.DEFENDERS; board[2][2] = this.DEFENDERS;
        board[2][5] = this.INVADERS;

        board[7][6] = this.DEFENDERS;
        board[7][7] = this.INVADERS; board[6][5] = this.INVADERS; */
        return board;
    }
    constructor(b: number[][], turn: number, invaderStart: boolean) {
        super(b, turn);
        this.invaderStart = invaderStart;
    }
}
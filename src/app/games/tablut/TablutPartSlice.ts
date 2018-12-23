import {GamePartSlice} from '../../jscaip/GamePartSlice';

export class TablutPartSlice extends GamePartSlice {

	// statics fields :

	public static readonly UNOCCUPIED = 0;
	public static readonly PLAYER_ZERO_KING = 1;
	public static readonly PLAYER_ZERO_PAWN = 2;
	public static readonly PLAYER_ONE_KING = 3;
	public static readonly PLAYER_ONE_PAWN = 4;

	// statics methods :

	static getStartingBoard(zeroAttack: boolean): number[][] {
		if (zeroAttack) {
			return this.getStartingBoardLike(this.PLAYER_ONE_KING, this.PLAYER_ONE_PAWN, this.PLAYER_ZERO_PAWN);
		}
		return this.getStartingBoardLike(this.PLAYER_ZERO_KING, this.PLAYER_ZERO_PAWN, this.PLAYER_ONE_PAWN);
	}

	private static getStartingBoardLike(king: number, soldier: number, invader: number): number[][] {
		const board: number[][] = GamePartSlice.createBiArray(9, 9, this.UNOCCUPIED);
		board[4][4] = king;
		board[3][4] = soldier; board[5][4] = soldier; board[4][3] = soldier; board[4][5] = soldier; // closer most soldier
		board[2][4] = soldier; board[6][4] = soldier; board[4][2] = soldier; board[4][6] = soldier; // far soldier

		board[1][4] = invader; board[7][4] = invader; board[4][1] = invader; board[4][7] = invader; // closed invader
		board[0][4] = invader; board[8][4] = invader; board[4][0] = invader; board[4][8] = invader; // furthest invader
		board[0][3] = invader; board[8][3] = invader; board[3][0] = invader; board[3][8] = invader; // one side of the furthest
		board[0][5] = invader; board[8][5] = invader; board[5][0] = invader; board[5][8] = invader; // the other side
		return board;
	}

	constructor(b: number[][], turn: number) {
		super(b, turn);
	}

}

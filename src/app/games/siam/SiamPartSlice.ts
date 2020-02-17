import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { SiamPiece } from "./SiamPiece";

export class SiamPartSlice extends GamePartSlice {

    public constructor(board: number[][], turn: number) {
        if (board == null) {
			board = SiamPartSlice.getStartingBoard();
		}
        super(board, turn);
    }

    public static getStartingBoard(): number[][] {
        let board: number[][] = GamePartSlice.createBiArray(5, 5, SiamPiece.EMPTY.value);
        /*board[0][0] = SiamPiece.WHITE_UP.value;
        board[0][1] = SiamPiece.WHITE_RIGHT.value;
        board[0][2] = SiamPiece.WHITE_DOWN.value;
        board[0][3] = SiamPiece.WHITE_LEFT.value;
        board[1][0] = SiamPiece.BLACK_UP.value;
        board[1][1] = SiamPiece.BLACK_RIGHT.value;
        board[1][2] = SiamPiece.BLACK_DOWN.value;
        board[1][3] = SiamPiece.BLACK_LEFT.value;*/ // Default config with one piece of each on the board

        board[2][1] = SiamPiece.MOUNTAIN.value;
        board[2][2] = SiamPiece.MOUNTAIN.value;
        board[2][3] = SiamPiece.MOUNTAIN.value;
        return board;
    }
}
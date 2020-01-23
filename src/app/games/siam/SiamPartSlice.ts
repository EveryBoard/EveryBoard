import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { SiamPiece } from "./SiamPiece";

export class SiamPartSlice extends GamePartSlice {

    public static getStartingBoard(): number[][] {
        let board: number[][] = GamePartSlice.createBiArray(5, 5, SiamPiece.EMPTY.value);
        board[2][1] = SiamPiece.MOUNTAIN.value;
        board[2][2] = SiamPiece.MOUNTAIN.value;
        board[2][3] = SiamPiece.MOUNTAIN.value;
        return board;
    }
}
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { SiamPiece } from "./SiamPiece";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";

export class SiamPartSlice extends GamePartSlice {

    public static getStartingBoard(): number[][] {
        let board: number[][] = ArrayUtils.createBiArray(5, 5, SiamPiece.EMPTY.value);

        board[2][1] = SiamPiece.MOUNTAIN.value;
        board[2][2] = SiamPiece.MOUNTAIN.value;
        board[2][3] = SiamPiece.MOUNTAIN.value;
        return board;
    }
}
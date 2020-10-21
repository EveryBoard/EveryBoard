import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { DvonnBoard, DvonnBoardT } from "./DvonnBoard";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";

export class DvonnPartSlice extends GamePartSlice {
    public readonly alreadyPassed: boolean; // Did a PASS move have been performed on the last turn?
    public static getStartingSlice(initialBoard: ReadonlyArray<ReadonlyArray<number>>): DvonnPartSlice {
        return new DvonnPartSlice(0, false, ArrayUtils.copyBiArray(initialBoard));
    }
    public constructor(turn: number, alreadyPassed: boolean, board: number[][]) {
        super(ArrayUtils.copyBiArray(board), turn);
        this.alreadyPassed = alreadyPassed;
    }
}

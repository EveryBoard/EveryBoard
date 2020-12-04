import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { DvonnBoard } from "./DvonnBoard";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";

export class DvonnPartSlice extends GamePartSlice {

    public readonly alreadyPassed: boolean; // Did a PASS move have been performed on the last turn?

    public static getInitialSlice(): DvonnPartSlice {
        return new DvonnPartSlice(0, false, ArrayUtils.mapBiArray(DvonnBoard.getBalancedBoard(), p => p.getValue()));
    }
    public constructor(turn: number, alreadyPassed: boolean, board: number[][]) {
        super(ArrayUtils.copyBiArray(board), turn);
        this.alreadyPassed = alreadyPassed;
    }
}

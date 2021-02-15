import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { DvonnBoard } from './DvonnBoard';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';

export class DvonnPartSlice extends GamePartSlice {
    public static getInitialSlice(): DvonnPartSlice {
        return new DvonnPartSlice(ArrayUtils.mapBiArray(DvonnBoard.getBalancedBoard(), (p) => p.getValue()), 0, false);
    }
    public constructor(
        board: number[][],
        turn: number,
        // Did a PASS move have been performed on the last turn?
        public readonly alreadyPassed: boolean)
    {
        super(ArrayUtils.copyBiArray(board), turn);
    }
}

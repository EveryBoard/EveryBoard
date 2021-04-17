import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { DvonnBoard } from './DvonnBoard';

export class DvonnPartSlice extends GamePartSlice {
    public static getInitialSlice(): DvonnPartSlice {
        return new DvonnPartSlice(DvonnBoard.balancedBoard(), 0, false);
    }
    public constructor(
        public readonly hexaBoard: DvonnBoard,
        turn: number,
        // Did a PASS move have been performed on the last turn?
        public readonly alreadyPassed: boolean)
    {
        super(hexaBoard.toNumberTable(), turn);
    }
}

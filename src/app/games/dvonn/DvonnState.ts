import { GameState } from 'src/app/jscaip/GameState';
import { DvonnBoard } from './DvonnBoard';

export class DvonnState extends GameState {

    public static getInitialState(): DvonnState {
        return new DvonnState(DvonnBoard.balancedBoard(), 0, false);
    }
    public constructor(public readonly hexaBoard: DvonnBoard,
                       turn: number,
                       // Did a PASS move have been performed on the last turn?
                       public readonly alreadyPassed: boolean)
    {
        super(turn);
    }
}

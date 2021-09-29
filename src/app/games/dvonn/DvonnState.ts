import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { DvonnBoard } from './DvonnBoard';
import { DvonnPieceStack } from './DvonnPieceStack';

export class DvonnState extends HexagonalGameState<DvonnPieceStack, DvonnBoard> {

    public static getInitialState(): DvonnState {
        return new DvonnState(DvonnBoard.balancedBoard(), 0, false);
    }
    public constructor(board: DvonnBoard,
                       turn: number,
                       // Did a PASS move have been performed on the last turn?
                       public readonly alreadyPassed: boolean)
    {
        super(turn, board);
    }
    public getCopiedBoard(): DvonnPieceStack[][] {
        return ArrayUtils.copyBiArray(this.board.board);
    }
}

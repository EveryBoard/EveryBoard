import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { QuartoNode, BoardStatus, QuartoRules } from './QuartoRules';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { AlignmentStatus } from 'src/app/jscaip/AI/AlignmentHeuristic';

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState> {

    public getBoardValue(node: QuartoNode, _config: NoConfig): BoardValue {
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            status: AlignmentStatus.NOTHING,
            sensitiveSquares: new CoordSet(),
        };
        for (const line of QuartoRules.get().lines) {
            boardStatus = QuartoRules.get().updateBoardStatus(line, state, boardStatus);
        }
        return boardStatus.status.toBoardValue(state.turn);
    }

}

import { MGPOptional } from '@everyboard/lib';
import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { QuartoNode, BoardStatus, QuartoRules, QuartoConfig } from './QuartoRules';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { AlignmentStatus } from 'src/app/jscaip/AI/AlignmentHeuristic';

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState, BoardValue, QuartoConfig> {

    public getBoardValue(node: QuartoNode, optionalConfig: MGPOptional<QuartoConfig>): BoardValue {
        const config: QuartoConfig = optionalConfig.get();
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            status: AlignmentStatus.NOTHING,
            sensitiveSquares: new CoordSet(),
            victoryLevel: 0,
        };
        const maxLevel: number = Math.max(config.playerZeroLevel, config.playerOneLevel);
        for (const pattern of QuartoRules.get().getPatterns(maxLevel)) {
            boardStatus = QuartoRules.get().updateBoardStatus(pattern, state, boardStatus);
        }
        return boardStatus.status.toBoardValue(state.turn);
    }

}

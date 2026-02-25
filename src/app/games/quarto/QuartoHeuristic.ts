import { MGPOptional } from '@everyboard/lib';

import { AlignmentStatus } from '../../jscaip/AI/AlignmentHeuristic';
import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Minimax';
import { CoordSet } from '../../jscaip/CoordSet';

import { QuartoMove } from './QuartoMove';
import { QuartoNode, BoardStatus, QuartoRules, QuartoConfig, VictoryPattern } from './QuartoRules';
import { QuartoState } from './QuartoState';

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState, BoardValue, QuartoConfig> {

    public getBoardValue(node: QuartoNode, optionalConfig: MGPOptional<QuartoConfig>): BoardValue {
        const config: QuartoConfig = optionalConfig.get();
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            status: AlignmentStatus.NOTHING,
            sensitiveSquares: new CoordSet(),
        };
        const maxLevel: number = Math.max(config.playerZeroLevel, config.playerOneLevel);
        const patterns: VictoryPattern[] = QuartoRules.get().getPatterns(maxLevel, state);
        for (const pattern of patterns) {
            boardStatus = QuartoRules.get().updateBoardStatus(pattern, state, boardStatus).boardStatus;
        }
        return boardStatus.status.toBoardValue(state.turn);
    }

}

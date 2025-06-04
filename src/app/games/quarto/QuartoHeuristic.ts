import { MGPOptional } from '@everyboard/lib';

import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { Heuristic } from '../../../app/jscaip/AI/Minimax';
import { BoardValue } from '../../../app/jscaip/AI/BoardValue';
import { QuartoNode, BoardStatus, QuartoRules, QuartoConfig, VictoryPattern } from './QuartoRules';
import { CoordSet } from '../../../app/jscaip/CoordSet';
import { AlignmentStatus } from '../../../app/jscaip/AI/AlignmentHeuristic';

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

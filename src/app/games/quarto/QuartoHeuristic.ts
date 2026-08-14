import { AlignmentStatus } from '@everyboard/games';
import { BoardValue } from '@everyboard/games';
import { Heuristic } from '@everyboard/games';
import { CoordSet } from '@everyboard/games';

import { QuartoMove } from './QuartoMove';
import { QuartoNode, BoardStatus, QuartoRules, QuartoConfig, VictoryPattern } from './QuartoRules';
import { QuartoState } from './QuartoState';

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState, BoardValue, QuartoConfig> {

    public getBoardValue(node: QuartoNode, config: QuartoConfig): BoardValue {
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

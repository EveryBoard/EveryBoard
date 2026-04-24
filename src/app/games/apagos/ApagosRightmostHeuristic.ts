import { MGPOptional } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { ApagosMove } from './ApagosMove';
import { ApagosConfig, ApagosNode } from './ApagosRules';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';

export class ApagosRightmostHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState, ApagosConfig> {

    public override getMetrics(node: ApagosNode, _config: ApagosConfig): PlayerNumberTable {
        const board: readonly ApagosSquare[] = node.gameState.board;
        const size: number = board.length;
        const levelThreeDominant: PlayerOrNone = board[size - 1].getDominatingPlayer();
        const result: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        if (levelThreeDominant.isPlayer()) {
            result.add(levelThreeDominant, 0, 1);
        }
        return result;
    }

}

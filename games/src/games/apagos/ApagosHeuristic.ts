import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { ApagosMove } from './ApagosMove';
import { ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';

export class ApagosHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState> {

    public override getMetrics(node: ApagosNode): PlayerNumberTable {
        const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
        const metrics: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        if (levelThreeDominant.isPlayer()) {
            metrics.put(levelThreeDominant, 1);
        }
        return metrics.toTable();
    }
}

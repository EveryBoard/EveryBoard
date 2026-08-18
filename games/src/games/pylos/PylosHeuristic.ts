import { EmptyRulesConfig } from '../../config/RulesConfigUtil';
import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { PylosMove } from './PylosMove';
import { PylosNode } from './PylosRules';
import { PylosState } from './PylosState';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public override getMetrics(node: PylosNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const ownershipMap: PlayerNumberMap = node.gameState.getPiecesRepartition();
        return ownershipMap.toTable();
    }

}

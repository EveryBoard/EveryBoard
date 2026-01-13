import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { PylosNode } from './PylosRules';
import { NoConfig } from '../../jscaip/RulesConfigUtil';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public override getMetrics(node: PylosNode, _config: NoConfig): PlayerNumberTable {
        const ownershipMap: PlayerNumberMap = node.gameState.getPiecesRepartition();
        return ownershipMap.toTable();
    }

}

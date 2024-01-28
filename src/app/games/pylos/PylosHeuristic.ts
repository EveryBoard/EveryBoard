import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { PylosNode } from './PylosRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public override getMetrics(node: PylosNode, _config: NoConfig): PlayerNumberTable {
        const ownershipMap: PlayerNumberMap = node.gameState.getPiecesRepartition();
        return ownershipMap.toTable();
    }

}

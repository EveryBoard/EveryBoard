import { Player } from 'src/app/jscaip/Player';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { PylosNode } from './PylosRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public override getMetrics(node: PylosNode, _config: NoConfig): PlayerNumberTable {
        const ownershipMap: { [owner: number]: number; } = node.gameState.getPiecesRepartition();
        return PlayerNumberTable.of(
            [ownershipMap[Player.ZERO.value]],
            [ownershipMap[Player.ONE.value]],
        );
    }

}

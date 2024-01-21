import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { PylosNode } from './PylosRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { MGPMap } from 'src/app/utils/MGPMap';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public override getMetrics(node: PylosNode, _config: NoConfig): PlayerNumberTable {
        const ownershipMap: MGPMap<PlayerOrNone, number> = node.gameState.getPiecesRepartition();
        return PlayerNumberTable.ofSingle(
            ownershipMap.get(Player.ZERO).get(),
            ownershipMap.get(Player.ONE).get(),
        );
    }

}

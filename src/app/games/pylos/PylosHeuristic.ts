import { Player } from 'src/app/jscaip/Player';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { PylosNode } from './PylosRules';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public getMetrics(node: PylosNode): PlayerNumberTable {
        const ownershipMap: { [owner: number]: number; } = node.gameState.getPiecesRepartition();
        return PlayerNumberTable.of(
            [ownershipMap[Player.ZERO.value]],
            [ownershipMap[Player.ONE.value]],
        );
    }

}

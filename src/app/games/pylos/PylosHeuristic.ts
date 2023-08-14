import { Player } from 'src/app/jscaip/Player';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic, Minimax } from 'src/app/jscaip/Minimax';
import { PylosNode } from './PylosRules';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public getMetrics(node: PylosNode): [number, number] {
        const ownershipMap: { [owner: number]: number; } = node.gameState.getPiecesRepartition();
        return [ownershipMap[Player.ZERO.value], ownershipMap[Player.ONE.value]];
    }
}

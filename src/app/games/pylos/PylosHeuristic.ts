import { Player } from 'src/app/jscaip/Player';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PylosNode } from './PylosRules';
import { MGPMap } from 'src/app/utils/MGPMap';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public getMetrics(node: PylosNode): MGPMap<Player, ReadonlyArray<number>> {
        const ownershipMap: { [owner: number]: number; } = node.gameState.getPiecesRepartition();
        console.log(JSON.stringify(ownershipMap))
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [ownershipMap[Player.ZERO.value]] },
            { key: Player.ONE, value: [ownershipMap[Player.ONE.value]] },
        ]);
    }

}

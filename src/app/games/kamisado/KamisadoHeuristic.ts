import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { KamisadoMove } from './KamisadoMove';
import { KamisadoNode, KamisadoRules } from './KamisadoRules';
import { KamisadoState } from './KamisadoState';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class KamisadoHeuristic extends PlayerMetricHeuristic<KamisadoMove, KamisadoState> {

    public getMetrics(node: KamisadoNode): MGPMap<Player, ReadonlyArray<number>> {
        const state: KamisadoState = node.gameState;
        // Metric is how far a player's piece is from the end line
        const [furthest0, furthest1]: [number, number] = KamisadoRules.getFurthestPiecePositions(state);
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [7 - furthest0] },
            { key: Player.ONE, value: [furthest1] },
        ]);
    }

}

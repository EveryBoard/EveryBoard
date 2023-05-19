import { KamisadoMove } from './KamisadoMove';
import { KamisadoState } from './KamisadoState';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { KamisadoNode, KamisadoRules } from './KamisadoRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KamisadoMinimax extends PlayerMetricsMinimax<KamisadoMove, KamisadoState> {

    public getListMoves(node: KamisadoNode): KamisadoMove[] {
        const moves: KamisadoMove[] = KamisadoRules.getListMovesFromState(node.gameState);
        ArrayUtils.sortByDescending(moves, (move: KamisadoMove): number => move.length());
        return moves;
    }
    public getMetrics(node: KamisadoNode): [number, number] {
        const state: KamisadoState = node.gameState;
        // Metric is how far a player's piece is from the end line
        const [furthest0, furthest1]: [number, number] = KamisadoRules.getFurthestPiecePositions(state);
        return [7 - furthest0, furthest1];
    }
}

import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';

export class LinesOfActionMinimax extends PlayerMetricsMinimax<LinesOfActionMove, LinesOfActionState> {

    public getListMoves(node: LinesOfActionNode): LinesOfActionMove[] {
        return LinesOfActionRules.getListMovesFromState(node.gameState);
    }
    public getMetrics(node: LinesOfActionNode): [number, number] {
        const state: LinesOfActionState = node.gameState;
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        // More groups = less score
        return [100 / zero, 100 / one];
    }
}

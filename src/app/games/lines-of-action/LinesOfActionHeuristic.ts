import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionHeuristic extends PlayerMetricHeuristic<LinesOfActionMove, LinesOfActionState> {

    public getMetrics(node: LinesOfActionNode): [number, number] {
        const state: LinesOfActionState = node.gameState;
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        // More groups = less score
        return [100 / zero, 100 / one];
    }
}
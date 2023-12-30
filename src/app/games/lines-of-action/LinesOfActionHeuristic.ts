import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionHeuristic extends PlayerMetricHeuristic<LinesOfActionMove, LinesOfActionState> {

    public getMetrics(node: LinesOfActionNode): PlayerNumberTable {
        const state: LinesOfActionState = node.gameState;
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        // More groups = less score
        return PlayerNumberTable.of(
            [100 / zero],
            [100 / one],
        );
    }
}

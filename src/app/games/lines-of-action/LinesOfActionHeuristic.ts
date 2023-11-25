import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class LinesOfActionHeuristic extends PlayerMetricHeuristic<LinesOfActionMove, LinesOfActionState> {

    public getMetrics(node: LinesOfActionNode): MGPMap<Player, ReadonlyArray<number>> {
        const state: LinesOfActionState = node.gameState;
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        // More groups = less score
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [100 / zero] },
            { key: Player.ONE, value: [100 / one] },
        ]);
    }
}

import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';

export class ApagosHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState> {

    public getMetrics(node: ApagosNode): [number, number] {
        const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
        const metrics: [number, number] = [0, 0];
        if (levelThreeDominant.isPlayer()) {
            metrics[levelThreeDominant.getValue()] = 1;
        }
        return metrics;
    }
}

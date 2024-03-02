import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';

export class ApagosHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState> {

    public override getMetrics(node: ApagosNode): PlayerNumberTable {
        const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
        const metrics: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        if (levelThreeDominant.isPlayer()) {
            metrics.put(levelThreeDominant, 1);
        }
        return metrics.toTable();
    }
}

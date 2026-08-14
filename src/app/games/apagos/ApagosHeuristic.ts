import { PlayerOrNone } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';

import { ApagosMove } from './ApagosMove';
import { ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';

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

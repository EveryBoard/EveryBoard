import { PlayerNumberMap } from '@everyboard/games';
import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { PylosMove } from './PylosMove';
import { PylosNode } from './PylosRules';
import { PylosState } from './PylosState';

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public override getMetrics(node: PylosNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const ownershipMap: PlayerNumberMap = node.gameState.getPiecesRepartition();
        return ownershipMap.toTable();
    }

}

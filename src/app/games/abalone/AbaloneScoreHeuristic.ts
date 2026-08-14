import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';

import { AbaloneMove } from './AbaloneMove';
import { AbaloneConfig, AbaloneNode } from './AbaloneRules';
import { AbaloneState } from './AbaloneState';

export class AbaloneScoreHeuristic extends PlayerMetricHeuristic<AbaloneMove, AbaloneState, AbaloneConfig> {

    public override getMetrics(node: AbaloneNode, _config: AbaloneConfig): PlayerNumberTable {
        return node.gameState.getScores().toTable();
    }

}

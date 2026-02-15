import { MGPOptional } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';
import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaNode } from './MancalaRules';
import { MancalaState } from './MancalaState';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MGPOptional<MancalaConfig>): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

}

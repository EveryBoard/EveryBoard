import { MGPOptional } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';
import { MancalaState } from '../common/MancalaState';
import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaNode } from './MancalaRules';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MGPOptional<MancalaConfig>): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

}

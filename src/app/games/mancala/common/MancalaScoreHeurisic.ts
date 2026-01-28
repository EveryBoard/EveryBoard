import { MGPOptional } from '@everyboard/lib';

import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from '../../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';
import { MancalaMove } from './MancalaMove';
import { MancalaConfig } from './MancalaConfig';
import { MancalaNode } from './MancalaRules';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MGPOptional<MancalaConfig>): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

}

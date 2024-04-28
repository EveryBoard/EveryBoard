import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { MancalaMove } from './MancalaMove';
import { MancalaConfig } from './MancalaConfig';
import { MGPOptional } from '@everyboard/lib';
import { MancalaNode } from './MancalaRules';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MGPOptional<MancalaConfig>): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

}

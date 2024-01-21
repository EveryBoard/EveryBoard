import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { MancalaMove } from './MancalaMove';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';
import { MancalaConfig } from './MancalaConfig';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaNode } from './MancalaRules';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MGPOptional<MancalaConfig>): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

}

import { BoardValue } from '../../../jscaip/AI/BoardValue';
import { HeuristicBounds, PlayerMetricHeuristicWithBounds } from '../../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';

import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaNode } from './MancalaRules';
import { MancalaState } from './MancalaState';

export class MancalaScoreHeuristic extends PlayerMetricHeuristicWithBounds<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MancalaConfig): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

    public override getBounds(config: MancalaConfig): HeuristicBounds<BoardValue> {
        const maxScore: number = config.width * 2 * config.seedsByHouse;
        return {
            player0Best: BoardValue.ofSingle(maxScore, 0),
            player1Best: BoardValue.ofSingle(0, maxScore),
        };
    }

}

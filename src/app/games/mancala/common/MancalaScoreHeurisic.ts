import { MGPOptional } from '@everyboard/lib';

import { BoardValue } from '../../../jscaip/AI/BoardValue';
import { HeuristicBounds, PlayerMetricHeuristicWithBounds } from '../../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';

import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaNode } from './MancalaRules';
import { MancalaState } from './MancalaState';

export class MancalaScoreHeuristic extends PlayerMetricHeuristicWithBounds<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MGPOptional<MancalaConfig>): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

    public override getBounds(config: MGPOptional<MancalaConfig>): HeuristicBounds<BoardValue> {
        const maxScore: number = config.get().width * 2 * config.get().seedsByHouse;
        return {
            player0Best: BoardValue.ofSingle(maxScore, 0),
            player1Best: BoardValue.ofSingle(0, maxScore),
        };
    }

}

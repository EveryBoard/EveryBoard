import { BoardValue } from '@everyboard/games';
import { HeuristicBounds } from '@everyboard/games';
import { PlayerMetricHeuristicWithBounds } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';

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
        // At most, we can get all seeds, which is:
        // - the number of seeds per house (seedsByHouse)
        // - for each house (width)
        // - for each player (2 players)
        const maxScore: number = config.width * 2 * config.seedsByHouse;
        return {
            player0Best: BoardValue.ofSingle(maxScore, 0),
            player1Best: BoardValue.ofSingle(0, maxScore),
        };
    }

}

import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';

import { MartianChessMove } from './MartianChessMove';
import { MartianChessNode } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';

export class MartianChessScoreHeuristic extends PlayerMetricHeuristic<MartianChessMove, MartianChessState> {

    public override getMetrics(node: MartianChessNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
        const oneScore: number = node.gameState.getScoreOf(Player.ONE);
        return PlayerNumberTable.ofSingle(zeroScore, oneScore);
    }

}

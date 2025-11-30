import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { Player } from '../../jscaip/Player';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessNode } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

export class MartianChessScoreHeuristic extends PlayerMetricHeuristic<MartianChessMove, MartianChessState> {

    public override getMetrics(node: MartianChessNode, _config: NoConfig): PlayerNumberTable {
        const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
        const oneScore: number = node.gameState.getScoreOf(Player.ONE);
        return PlayerNumberTable.ofSingle(zeroScore, oneScore);
    }

}

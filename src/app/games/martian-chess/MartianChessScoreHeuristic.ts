import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { Player } from 'src/app/jscaip/Player';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessNode } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class MartianChessScoreHeuristic extends PlayerMetricHeuristic<MartianChessMove, MartianChessState> {

    public override getMetrics(node: MartianChessNode, _config: NoConfig): PlayerNumberTable {
        const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
        const oneScore: number = node.gameState.getScoreOf(Player.ONE);
        return PlayerNumberTable.ofSingle(zeroScore, oneScore);
    }

}

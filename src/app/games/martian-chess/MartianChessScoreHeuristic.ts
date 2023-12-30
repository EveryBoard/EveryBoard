import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessNode } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';

export class MartianChessScoreHeuristic extends PlayerMetricHeuristic<MartianChessMove, MartianChessState> {

    public getMetrics(node: MartianChessNode): PlayerNumberTable {
        const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
        const oneScore: number = node.gameState.getScoreOf(Player.ONE);
        return PlayerNumberTable.of(
            [zeroScore],
            [oneScore],
        );
    }

}

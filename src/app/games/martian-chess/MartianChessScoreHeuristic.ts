import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessNode } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';

export class MartianChessScoreHeuristic extends PlayerMetricHeuristic<MartianChessMove, MartianChessState> {

    public getMetrics(node: MartianChessNode): [number, number] {
        const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
        const oneScore: number = node.gameState.getScoreOf(Player.ONE);
        return [zeroScore, oneScore];
    }
}

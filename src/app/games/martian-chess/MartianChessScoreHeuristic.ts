import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessNode } from './MartianChessRules';
import { MartianChessState } from './MartianChessState';
import { MGPMap } from 'src/app/utils/MGPMap';

export class MartianChessScoreHeuristic extends PlayerMetricHeuristic<MartianChessMove, MartianChessState> {

    public getMetrics(node: MartianChessNode): MGPMap<Player, ReadonlyArray<number>> {
        const zeroScore: number = node.gameState.getScoreOf(Player.ZERO);
        const oneScore: number = node.gameState.getScoreOf(Player.ONE);
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [zeroScore] },
            { key: Player.ONE, value: [oneScore] },
        ]);
    }

}

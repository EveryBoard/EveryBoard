import { CoerceoMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode } from './CoerceoRules';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class CoerceoCapturesAndFreedomHeuristic extends PlayerMetricHeuristic<CoerceoMove, CoerceoState> {

    public override getMetrics(node: CoerceoNode, _config: NoConfig): PlayerNumberTable {
        const state: CoerceoState = node.gameState;
        const piecesByFreedom: PlayerNumberTable = state.getPiecesByFreedom();
        const piecesScores: number[] = this.getPiecesScore(piecesByFreedom);
        const scoreZero: number = (2 * state.captures.get(Player.ZERO)) + piecesScores[0];
        const scoreOne: number = (2 * state.captures.get(Player.ONE)) + piecesScores[1];
        return PlayerNumberTable.ofSingle(scoreZero, scoreOne);
    }

    public getPiecesScore(piecesByFreedom: PlayerNumberTable): number[] {
        return [
            this.getPlayerPiecesScore(piecesByFreedom.get(Player.ZERO).get()),
            this.getPlayerPiecesScore(piecesByFreedom.get(Player.ONE).get()),
        ];
    }

    public getPlayerPiecesScore(piecesScores: readonly number[]): number {
        // Since having exactly one freedom left is less advantageous, as more dangerous
        const capturableScore: number = 1;
        const safeScore: number = 3;
        return (safeScore * piecesScores[0]) +
            (capturableScore * piecesScores[1]) +
            (safeScore * piecesScores[2]) +
            (safeScore * piecesScores[3]);
    }

}

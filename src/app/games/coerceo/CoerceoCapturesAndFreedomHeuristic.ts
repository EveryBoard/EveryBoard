import { CoerceoMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode } from './CoerceoRules';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class CoerceoCapturesAndFreedomHeuristic extends PlayerMetricHeuristic<CoerceoMove, CoerceoState> {

    public getMetrics(node: CoerceoNode): MGPMap<Player, ReadonlyArray<number>> {
        const state: CoerceoState = node.gameState;
        const piecesByFreedom: number[][] = state.getPiecesByFreedom();
        const piecesScores: number[] = this.getPiecesScore(piecesByFreedom);
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [(2 * state.captures[0]) + piecesScores[0]] },
            { key: Player.ONE, value: [(2 * state.captures[1]) + piecesScores[1]] },
        ]);
    }

    public getPiecesScore(piecesByFreedom: number[][]): number[] {
        return [
            this.getPlayerPiecesScore(piecesByFreedom[0]),
            this.getPlayerPiecesScore(piecesByFreedom[1]),
        ];
    }

    public getPlayerPiecesScore(piecesScores: number[]): number {
        return (3 * piecesScores[0]) +
            (1 * piecesScores[1]) +
            (3 * piecesScores[2]) +
            (3 * piecesScores[3]);
    }

}

import { CoerceoMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode } from './CoerceoRules';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class CoerceoCapturesAndFreedomHeuristic extends PlayerMetricHeuristic<CoerceoMove, CoerceoState> {

    public getMetrics(node: CoerceoNode): [number, number] {
        const state: CoerceoState = node.gameState;
        const piecesByFreedom: MGPMap<Player, number[]> = state.getPiecesByFreedom();
        const piecesScores: number[] = this.getPiecesScore(piecesByFreedom);
        const scoreZero: number = (2 * state.captures[0]) + piecesScores[0];
        const scoreOne: number = (2 * state.captures[1]) + piecesScores[1];
        return [scoreZero, scoreOne];
    }

    public getPiecesScore(piecesByFreedom: MGPMap<Player, number[]>): number[] {
        return [
            this.getPlayerPiecesScore(piecesByFreedom.get(Player.ZERO).get()),
            this.getPlayerPiecesScore(piecesByFreedom.get(Player.ONE).get()),
        ];
    }
    public getPlayerPiecesScore(piecesScores: number[]): number {
        return (3 * piecesScores[0]) +
            (1 * piecesScores[1]) +
            (3 * piecesScores[2]) +
            (3 * piecesScores[3]);
    }
}

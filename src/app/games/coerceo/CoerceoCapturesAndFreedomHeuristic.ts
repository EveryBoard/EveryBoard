import { CoerceoState } from './CoerceoState';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { Player } from 'src/app/jscaip/Player';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { CoerceoHeuristic } from './CoerceoHeuristic';
import { MGPOptional } from '@everyboard/lib';

export class CoerceoCapturesAndFreedomHeuristic extends CoerceoHeuristic {

    public override getMetrics(node: CoerceoNode, _config: MGPOptional<CoerceoConfig>): PlayerNumberTable {
        const state: CoerceoState = node.gameState;
        const piecesScores: [number, number] = this.getPiecesFreedomScore(state);
        const scoreZero: number = (2 * state.captures.get(Player.ZERO)) + piecesScores[0];
        const scoreOne: number = (2 * state.captures.get(Player.ONE)) + piecesScores[1];
        return PlayerNumberTable.ofSingle(scoreZero, scoreOne);
    }

}

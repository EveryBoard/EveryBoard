import { Player } from '@everyboard/games';

import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { CoerceoHeuristic } from './CoerceoHeuristic';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { CoerceoState } from './CoerceoState';

export class CoerceoCapturesAndFreedomHeuristic extends CoerceoHeuristic {

    public override getMetrics(node: CoerceoNode, _config: CoerceoConfig): PlayerNumberTable {
        const state: CoerceoState = node.gameState;
        const piecesScores: [number, number] = this.getPiecesFreedomScore(state);
        const scoreZero: number = (2 * state.captures.get(Player.ZERO)) + piecesScores[0];
        const scoreOne: number = (2 * state.captures.get(Player.ONE)) + piecesScores[1];
        return PlayerNumberTable.ofSingle(scoreZero, scoreOne);
    }

}

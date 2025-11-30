import { MGPOptional } from '@everyboard/lib';

import { CoerceoState } from './CoerceoState';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { CoerceoHeuristic } from './CoerceoHeuristic';

export class CoerceoCapturesAndFreedomHeuristic extends CoerceoHeuristic {

    public override getMetrics(node: CoerceoNode, _config: MGPOptional<CoerceoConfig>): PlayerNumberTable {
        const state: CoerceoState = node.gameState;
        const piecesScores: [number, number] = this.getPiecesFreedomScore(state);
        const scoreZero: number = (2 * state.captures.get(Player.ZERO)) + piecesScores[0];
        const scoreOne: number = (2 * state.captures.get(Player.ONE)) + piecesScores[1];
        return PlayerNumberTable.ofSingle(scoreZero, scoreOne);
    }

}

import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { TaflConfig } from './TaflConfig';
import { TaflMove } from './TaflMove';
import { TaflNode, TaflRules } from './TaflRules';
import { TaflState } from './TaflState';

export class TaflPieceHeuristic<M extends TaflMove> extends PlayerMetricHeuristic<M, TaflState, TaflConfig> {

    public constructor(public readonly rules: TaflRules<M>) {
        super();
    }

    public override getMetrics(node: TaflNode<M>, config: TaflConfig): PlayerNumberTable {
        const state: TaflState = node.gameState;
        // We just count the pawns
        const nbPlayerZeroPawns: number = this.rules.getPlayerListPawns(Player.ZERO, state).length;
        const nbPlayerOnePawns: number = this.rules.getPlayerListPawns(Player.ONE, state).length;
        const invader: Player = this.rules.getInvader(config);
        const zeroMult: number = [1, 2][invader.getValue()]; // invaders piece are twice as numerous
        const oneMult: number = [2, 1][invader.getValue()]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return PlayerNumberTable.ofSingle(scoreZero, scoreOne);
    }

}

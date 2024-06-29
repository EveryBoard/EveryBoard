import { TaflNode, TaflRules } from './TaflRules';
import { TaflMove } from './TaflMove';
import { TaflState } from './TaflState';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { TaflConfig } from './TaflConfig';
import { MGPOptional } from '@everyboard/lib';

export class TaflPieceHeuristic<M extends TaflMove> extends PlayerMetricHeuristic<M, TaflState, TaflConfig> {

    public constructor(public readonly rules: TaflRules<M>) {
        super();
    }

    public override getMetrics(node: TaflNode<M>, optConfig: MGPOptional<TaflConfig>): PlayerNumberTable {
        const state: TaflState = node.gameState;
        const config: TaflConfig = optConfig.get();
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

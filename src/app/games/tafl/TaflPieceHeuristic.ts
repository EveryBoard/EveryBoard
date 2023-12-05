import { TaflNode, TaflRules } from './TaflRules';
import { TaflMove } from './TaflMove';
import { TaflState } from './TaflState';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { TaflConfig } from './TaflConfig';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { BoardValue } from 'src/app/jscaip/BoardValue';

export class TaflPieceHeuristic<M extends TaflMove> extends PlayerMetricHeuristic<M, TaflState, TaflConfig> {

    public constructor(public readonly rules: TaflRules<M>) {
        super();
    }

    public override getBoardValue(node: TaflNode<M>, config: MGPOptional<TaflConfig>): BoardValue {
        return super.getBoardValue(node, config);
    }

    public getMetrics(node: TaflNode<M>, optionalConfig: MGPOptional<TaflConfig>): [number, number] {
        const state: TaflState = node.gameState;
        const config: TaflConfig = optionalConfig.get();
        // We just count the pawns
        const nbPlayerZeroPawns: number = this.rules.getPlayerListPawns(Player.ZERO, state).length;
        const nbPlayerOnePawns: number = this.rules.getPlayerListPawns(Player.ONE, state).length;
        const invader: Player = this.rules.getInvader(config);
        const zeroMult: number = [1, 2][invader.value]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][invader.value]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return [scoreZero, scoreOne];
    }

}

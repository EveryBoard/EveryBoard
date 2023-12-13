import { TaflNode, TaflRules } from './TaflRules';
import { TaflMove } from './TaflMove';
import { TaflState } from './TaflState';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';

export class TaflPieceHeuristic<M extends TaflMove> extends PlayerMetricHeuristic<M, TaflState> {

    public constructor(public readonly rules: TaflRules<M>) {
        super();
    }

    public getMetrics(node: TaflNode<M>): [number, number] {
        const state: TaflState = node.gameState;
        // We just count the pawns
        const nbPlayerZeroPawns: number = this.rules.getPlayerListPawns(Player.ZERO, state).length;
        const nbPlayerOnePawns: number = this.rules.getPlayerListPawns(Player.ONE, state).length;
        const zeroMult: number = [1, 2][this.rules.config.INVADER.getValue()]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][this.rules.config.INVADER.getValue()]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return [scoreZero, scoreOne];
    }
}

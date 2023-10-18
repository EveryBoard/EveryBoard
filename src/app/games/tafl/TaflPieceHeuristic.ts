import { TaflNode, TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';

export class TaflPieceHeuristic<M extends TaflMove, S extends TaflState> extends PlayerMetricHeuristic<M, S> {

    public constructor(public readonly rules: TaflRules<M, S>) {
        super();
    }

    public getMetrics(node: TaflNode<M, S>): [number, number] {
        const state: S = node.gameState;
        const nbPlayerZeroPawns: number = this.rules.getPlayerListPawns(Player.ZERO, state).length;
        const nbPlayerOnePawns: number = this.rules.getPlayerListPawns(Player.ONE, state).length;
        const invader: Player = this.rules.getInvader();
        const zeroMult: number = [1, 2][invader.value]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][invader.value]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return [scoreZero, scoreOne];
    }
}

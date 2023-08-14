import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { GameNode } from 'src/app/jscaip/MGPNode';

export class TaflHeuristic<M extends TaflMove, S extends TaflState> extends PlayerMetricHeuristic<M, S> {

    public constructor(public readonly rules: TaflRules<M, S>) {
        super();
    }

    public getMetrics(node: GameNode<M, S>): [number, number] {
        const state: S = node.gameState;
        // 1. has the king escaped ?
        // 2. is the king captured ?
        // 3. is one player immobilized ?
        // 4. let's just for now just count the pawns

        const nbPlayerZeroPawns: number = this.rules.getPlayerListPawns(Player.ZERO, state).length;
        const nbPlayerOnePawns: number = this.rules.getPlayerListPawns(Player.ONE, state).length;
        const zeroMult: number = [1, 2][this.rules.config.INVADER.value]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][this.rules.config.INVADER.value]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return [scoreZero, scoreOne];
    }
}

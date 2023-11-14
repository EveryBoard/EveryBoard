import { TaflNode, TaflRules } from './TaflRules';
import { TaflMove } from './TaflMove';
import { TaflState } from './TaflState';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { TaflConfig } from './TaflConfig';

export class TaflPieceHeuristic<M extends TaflMove> extends PlayerMetricHeuristic<M, TaflState> {

    public constructor(public readonly rules: TaflRules<M>) {
        super();
    }

    public getMetrics(node: TaflNode<M>): [number, number] {
        const state: TaflState = node.gameState;
        const config: TaflConfig = node.getConfig();
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


import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { display } from 'src/app/utils/utils';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { GameNode, MoveGenerator } from 'src/app/jscaip/MGPNode';

export class TaflMoveGenerator<M extends TaflMove, S extends TaflState>
    extends MoveGenerator<M, S>
{

    public constructor(private readonly rules: TaflRules<M, S>) {
        super();
    }
    public getListMoves(node: GameNode<M, S>): M[] {
        const LOCAL_VERBOSE: boolean = false;
        display(LOCAL_VERBOSE, { TaflMinimax_getListMoves: { node } });

        const state: S = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        const listMoves: M[] = this.rules.getPlayerListMoves(currentPlayer, state);
        return this.orderMoves(state, listMoves);
    }
    public orderMoves(state: S, listMoves: M[]): M[] {
        const king: Coord = this.rules.getKingCoord(state).get();
        if (state.getCurrentPlayer() === this.rules.config.INVADER) {
            // Invader
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                return - move.getEnd().getOrthogonalDistance(king);
            });
        } else {
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                if (move.getStart().equals(king)) {
                    if (this.rules.isExternalThrone(move.getEnd())) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            });
        }
        return listMoves;
    }
}


export class TaflHeuristic<M extends TaflMove, S extends TaflState>  extends PlayerMetricHeuristic<M, S> {
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

export class TaflMinimax<M extends TaflMove, S extends TaflState> extends Minimax<M, S> {
    public constructor(name: string, heuristic: TaflHeuristic<M, S>) {
        super(name, heuristic.rules, heuristic, new TaflMoveGenerator(heuristic.rules));
    }
}

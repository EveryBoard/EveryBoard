import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { Debug } from 'src/app/utils/utils';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { GameNode } from 'src/app/jscaip/GameNode';
import { MoveGenerator } from 'src/app/jscaip/AI';

@Debug.log
export class TaflMoveGenerator<M extends TaflMove, S extends TaflState> extends MoveGenerator<M, S> {

    public constructor(private readonly rules: TaflRules<M, S>) {
        super();
    }
    public getListMoves(node: GameNode<M, S>): M[] {
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

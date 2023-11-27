import { TaflNode, TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { Debug } from 'src/app/utils/Debug';

@Debug.log
export class TaflMoveGenerator<M extends TaflMove> extends MoveGenerator<M, TaflState> {

    public constructor(private readonly rules: TaflRules<M>) {
        super();
    }
    public getListMoves(node: TaflNode<M>): M[] {
        const state: TaflState = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        const listMoves: M[] = this.rules.getPlayerListMoves(currentPlayer, state);
        return this.orderMoves(state, listMoves);
    }
    public orderMoves(state: TaflState, listMoves: M[]): M[] {
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

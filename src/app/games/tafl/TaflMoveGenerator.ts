import { TaflNode, TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { Debug } from 'src/app/utils/utils';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { TaflConfig } from './TaflConfig';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Debug.log
export class TaflMoveGenerator<M extends TaflMove> extends MoveGenerator<M, TaflState, TaflConfig> {

    public constructor(private readonly rules: TaflRules<M>) {
        super();
    }

    public override getListMoves(node: TaflNode<M>, config: MGPOptional<TaflConfig>): M[] {
        const state: TaflState = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        const listMoves: M[] = this.rules.getPlayerListMoves(currentPlayer, state, config.get());
        return this.orderMoves(state, listMoves, config.get());
    }

    public orderMoves(state: TaflState, listMoves: M[], config: TaflConfig): M[] {
        const king: Coord = this.rules.getKingCoord(state).get();
        const invader: Player = this.rules.getInvader(config);
        if (state.getCurrentPlayer() === invader) { // Invader
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                return - move.getEnd().getOrthogonalDistance(king);
            });
        } else {
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                if (move.getStart().equals(king)) {
                    if (this.rules.isExternalThrone(state, move.getEnd())) {
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

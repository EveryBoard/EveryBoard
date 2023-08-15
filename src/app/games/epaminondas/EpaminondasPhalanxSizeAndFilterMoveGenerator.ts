import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasNode } from './EpaminondasRules';
import { EpaminondasMoveGenerator } from './EpaminondasMoveGenerator';

export class EpaminondasPhalanxSizeAndFilterMoveGenerator extends EpaminondasMoveGenerator {

    public override getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const moves: EpaminondasMove[] = super.getListMoves(node);
        return this.orderMovesByPhalanxSizeAndFilter(moves, node.gameState);
    }
    private orderMovesByPhalanxSizeAndFilter(moves: EpaminondasMove[], state: EpaminondasState): EpaminondasMove[] {
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.movedPieces;
        });
        if (moves.length > 40) {
            const evenMoves: EpaminondasMove[] = moves.filter((move: EpaminondasMove) => {
                if (this.moveIsCapture(move, state)) {
                    return true;
                } else {
                    return (move.movedPieces * Math.random()) > 1;
                }
            });
            return evenMoves;
        }
        return moves;
    }
    private moveIsCapture(move: EpaminondasMove, state: EpaminondasState): boolean {
        const landing: Coord = move.coord.getNext(move.direction, move.movedPieces + move.stepSize - 1);
        return state.board[landing.y][landing.x] === state.getCurrentOpponent();
    }
}
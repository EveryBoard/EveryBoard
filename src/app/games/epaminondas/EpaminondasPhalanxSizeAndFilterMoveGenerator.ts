import { ArrayUtils, MGPOptional } from '@everyboard/lib';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasConfig, EpaminondasNode } from './EpaminondasRules';
import { EpaminondasMoveGenerator } from './EpaminondasMoveGenerator';

export class EpaminondasPhalanxSizeAndFilterMoveGenerator extends EpaminondasMoveGenerator {

    public override getListMoves(node: EpaminondasNode, config: MGPOptional<EpaminondasConfig>): EpaminondasMove[] {
        const moves: EpaminondasMove[] = super.getListMoves(node, config);
        return this.orderMovesByPhalanxSizeAndFilter(moves, node.gameState);
    }

    private orderMovesByPhalanxSizeAndFilter(moves: EpaminondasMove[], state: EpaminondasState): EpaminondasMove[] {
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.phalanxSize;
        });
        return moves.slice(0, 40); // Keep at most 40 moves
    }
}

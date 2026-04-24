import { ArrayUtils, MGPOptional } from '@everyboard/lib';

import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasMoveGenerator } from './EpaminondasMoveGenerator';
import { EpaminondasNode } from './EpaminondasRules';

export class EpaminondasOrderedMoveGenerator extends EpaminondasMoveGenerator {

    public override getListMoves(node: EpaminondasNode, config: EpaminondasConfig): EpaminondasMove[] {
        const moves: EpaminondasMove[] = super.getListMoves(node, config);
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.stepSize; // Best for normal, might not be best for others!
        });
        return moves;
    }
}

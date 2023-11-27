import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasNode } from './EpaminondasRules';
import { ArrayUtils } from '@everyboard/lib';
import { EpaminondasMoveGenerator } from './EpaminondasMoveGenerator';

export class EpaminondasOrderedMoveGenerator extends EpaminondasMoveGenerator {

    public override getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const moves: EpaminondasMove[] = super.getListMoves(node);
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.stepSize; // Best for normal, might not be best for others!
        });
        return moves;
    }
}

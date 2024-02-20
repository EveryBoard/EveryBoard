import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasNode } from './EpaminondasRules';
import { ArrayUtils } from '@everyboard/lib';
import { EpaminondasMoveGenerator } from './EpaminondasMoveGenerator';
import { MGPOptional } from '@everyboard/lib';

export class EpaminondasOrderedMoveGenerator extends EpaminondasMoveGenerator {

    public override getListMoves(node: EpaminondasNode, config: MGPOptional<EpaminondasConfig>): EpaminondasMove[] {
        const moves: EpaminondasMove[] = super.getListMoves(node, config);
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.stepSize; // Best for normal, might not be best for others!
        });
        return moves;
    }
}

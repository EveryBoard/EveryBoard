import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasConfig, EpaminondasNode } from './EpaminondasRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { EpaminondasMoveGenerator } from './EpaminondasMoveGenerator';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class EpaminondasOrderedMoveGenerator extends EpaminondasMoveGenerator {

    public override getListMoves(node: EpaminondasNode, config: MGPOptional<EpaminondasConfig>): EpaminondasMove[] {
        const moves: EpaminondasMove[] = super.getListMoves(node, config);
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.stepSize; // Best for normal, might not be best for others!
        });
        return moves;
    }
}

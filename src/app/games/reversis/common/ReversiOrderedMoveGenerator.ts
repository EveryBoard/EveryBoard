import { ArrayUtils } from '@everyboard/lib';

import { MoveGenerator } from '../../../jscaip/AI/AI';
import { ReversiRules } from '../reversi/ReversiRules';

import { ReversiNode, ReversiMoveWithSwitched, ReversiConfig, TopologicReversiRules } from './AbstractReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export class ReversiOrderedMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public constructor(public readonly rules: TopologicReversiRules) {
        super();
    }

    public override getListMoves(node: ReversiNode): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.get().getListMoves(node.gameState);
        // Best moves are on the corner, otherwise moves are sorted by number of pieces switched
        ArrayUtils.sortByDescending(moves, (moveWithSwitched: ReversiMoveWithSwitched): number => {
            return this.rules
                .countUnsandwichableDirections(node.gameState, moveWithSwitched.move.coord);
        });
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }
}

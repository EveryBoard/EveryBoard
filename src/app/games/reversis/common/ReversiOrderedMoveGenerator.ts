import { ArrayUtils } from '@everyboard/lib';

import { MoveGenerator } from '../../../jscaip/AI/AI';
import { ReversiRules } from '../reversi/ReversiRules';

import { ReversiNode, ReversiMoveWithSwitched, ReversiConfig, TopologicReversiRules } from './AbstractReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export class ReversiOrderedMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public override getListMoves(node: ReversiNode, config: ReversiConfig): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.get().getListMoves(node.gameState, config);
        // Best moves are on the corner, otherwise moves are sorted by number of pieces switched
        ArrayUtils.sortByDescending(moves, (moveWithSwitched: ReversiMoveWithSwitched): number => {
            return TopologicReversiRules.get()
                .countUnsandwichableDirections(node.gameState, moveWithSwitched.move.coord);
        });
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }
}

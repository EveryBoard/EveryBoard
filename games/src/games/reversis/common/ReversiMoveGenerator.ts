import { MoveGenerator } from '../../../jscaip/AI/AI';

import { ReversiNode, ReversiMoveWithSwitched, ReversiConfig, TopologicReversiRules } from './AbstractReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export class ReversiMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public constructor(public readonly rules: TopologicReversiRules) {
        super();
    }

    public override getListMoves(node: ReversiNode): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = this.rules.getListMoves(node.gameState);
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }

}

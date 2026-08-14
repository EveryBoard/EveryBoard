import { MoveGenerator } from '@everyboard/games';

import { ReversiNode, ReversiMoveWithSwitched, ReversiConfig, AbstractReversiRules } from './AbstractReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export class ReversiMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public constructor(public readonly rules: AbstractReversiRules) {
        super();
    }

    public override getListMoves(node: ReversiNode, config: ReversiConfig): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = this.rules.getListMoves(node.gameState, config);
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }

}

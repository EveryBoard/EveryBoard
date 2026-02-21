import { MGPOptional } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';

import { ReversiMove } from './ReversiMove';
import { ReversiRules, ReversiNode, ReversiMoveWithSwitched, ReversiConfig } from './ReversiRules';
import { ReversiState } from './ReversiState';

export class ReversiMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public override getListMoves(node: ReversiNode, config: MGPOptional<ReversiConfig>): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.get().getListMoves(node.gameState, config);
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }

}

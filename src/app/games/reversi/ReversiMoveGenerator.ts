import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { ReversiRules, ReversiNode, ReversiMoveWithSwitched, ReversiConfig } from './ReversiRules';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class ReversiMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public override getListMoves(node: ReversiNode, config: MGPOptional<ReversiConfig>): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.get().getListMoves(node.gameState, config);
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }

}


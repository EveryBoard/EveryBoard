import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { ReversiRules, ReversiNode, ReversiMoveWithSwitched } from './ReversiRules';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';

export class ReversiMoveGenerator extends MoveGenerator<ReversiMove, ReversiState> {

    public getListMoves(node: ReversiNode): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.getListMoves(node.gameState);
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }
}


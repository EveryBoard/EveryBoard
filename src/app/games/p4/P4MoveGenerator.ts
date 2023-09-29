import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Node, P4Rules } from './P4Rules';
import { Debug } from 'src/app/utils/utils';
import { MoveGenerator } from 'src/app/jscaip/AI';

@Debug.log
export class P4MoveGenerator extends MoveGenerator<P4Move, P4State> {

    public getListMoves(node: P4Node): P4Move[] {
        const width: number = node.gameState.board[0].length;
        const virtualCX: number = Math.floor((width - 1) / 2);
        return P4Rules.get().getListMoves(node)
            .sort((left: P4Move, right: P4Move) => {
                const distanceFromCenterLeft: number = Math.abs(left.x - virtualCX);
                const distanceFromCenterRight: number = Math.abs(right.x - virtualCX);
                return distanceFromCenterLeft - distanceFromCenterRight;
            });
    }
}

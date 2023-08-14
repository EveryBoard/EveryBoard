import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Node, P4Rules } from './P4Rules';
import { Debug } from 'src/app/utils/utils';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

@Debug.log
export class P4MoveGenerator extends MoveGenerator<P4Move, P4State> {

    public getListMoves(node: P4Node): P4Move[] {
        return P4Rules.getListMoves(node)
            .sort((left: P4Move, right: P4Move) => {
                const distanceFromCenterLeft: number = Math.abs(left.x - 3);
                const distanceFromCenterRight: number = Math.abs(right.x - 3);
                return distanceFromCenterLeft - distanceFromCenterRight;
            });
    }
}

import { P4Move } from './P4Move';
import { P4Node } from './P4Rules';
import { P4MoveGenerator } from './P4MoveGenerator';

export class P4OrderedMoveGenerator extends P4MoveGenerator {

    public override getListMoves(node: P4Node): P4Move[] {
        const halfWidth: number = (node.gameState.getWidth() - 1) / 2;
        function closestToCenterFirst(left: P4Move, right: P4Move): number {
            const distanceFromCenterLeft: number = Math.abs(left.x - halfWidth);
            const distanceFromCenterRight: number = Math.abs(right.x - halfWidth);
            return distanceFromCenterLeft - distanceFromCenterRight;
        }
        return super.getListMoves(node).sort(closestToCenterFirst);
    }
}

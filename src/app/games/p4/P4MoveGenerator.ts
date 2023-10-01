import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Node } from './P4Rules';
import { Debug } from 'src/app/utils/utils';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { PlayerOrNone } from 'src/app/jscaip/Player';

@Debug.log
export class P4MoveGenerator extends MoveGenerator<P4Move, P4State> {

    public getListMoves(node: P4Node): P4Move[] {
        const originalState: P4State = node.gameState;
        const moves: P4Move[] = [];

        for (let x: number = 0; x < P4State.WIDTH; x++) {
            if (originalState.getPieceAtXY(x, 0) === PlayerOrNone.NONE) {
                const move: P4Move = P4Move.of(x);
                moves.push(move);
            }
        }
        return moves.sort((left: P4Move, right: P4Move) => {
            const distanceFromCenterLeft: number = Math.abs(left.x - 3);
            const distanceFromCenterRight: number = Math.abs(right.x - 3);
            return distanceFromCenterLeft - distanceFromCenterRight;
        });
    }
}

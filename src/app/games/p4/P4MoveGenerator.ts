import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Config, P4Node } from './P4Rules';
import { Debug } from 'src/app/utils/utils';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Debug.log
export class P4MoveGenerator extends MoveGenerator<P4Move, P4State, P4Config> {

    public override getListMoves(node: P4Node, config: MGPOptional<P4Config>): P4Move[] {
        const state: P4State = node.gameState;
        const width: number = state.getWidth();
        const virtualCX: number = Math.floor((width - 1) / 2);
        return this.getUnorderedListMoves(node, config)
            .sort((left: P4Move, right: P4Move) => {
                const distanceFromCenterLeft: number = Math.abs(left.x - virtualCX);
                const distanceFromCenterRight: number = Math.abs(right.x - virtualCX);
                return distanceFromCenterLeft - distanceFromCenterRight;
            });
    }

    private getUnorderedListMoves(node: P4Node, _config: MGPOptional<P4Config>): P4Move[] {
        // should be called only if the game is not over
        const state: P4State = node.gameState;
        const moves: P4Move[] = [];

        for (let x: number = 0; x < state.getWidth(); x++) {
            if (state.getPieceAtXY(x, 0).isNone()) {
                const move: P4Move = P4Move.of(x);
                moves.push(move);
            }
        }
        return moves;
    }

}

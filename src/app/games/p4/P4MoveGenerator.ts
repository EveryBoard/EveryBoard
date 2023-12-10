import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Config, P4Node, P4Rules } from './P4Rules';
import { Debug } from 'src/app/utils/utils';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Debug.log
export class P4MoveGenerator extends MoveGenerator<P4Move, P4State, P4Config> {

    public getListMoves(node: P4Node, config: MGPOptional<P4Config>): P4Move[] {
        const state: P4State = node.gameState;
        const width: number = state.getWidth();
        const virtualCX: number = Math.floor((width - 1) / 2);
        return P4Rules.get().getListMoves(node, config)
            .sort((left: P4Move, right: P4Move) => {
                const distanceFromCenterLeft: number = Math.abs(left.x - virtualCX);
                const distanceFromCenterRight: number = Math.abs(right.x - virtualCX);
                return distanceFromCenterLeft - distanceFromCenterRight;
            });
    }

}

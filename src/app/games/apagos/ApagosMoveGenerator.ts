import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { ApagosMove } from './ApagosMove';
import { ApagosNode, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';

export class ApagosMoveGenerator extends MoveGenerator<ApagosMove, ApagosState> {

    public getListMoves(node: ApagosNode): ApagosMove[] {
        const state: ApagosState = node.gameState;
        function isLegal(move: ApagosMove): boolean {
            return ApagosRules.get().isLegal(move, state).isSuccess();
        }
        return ApagosMove.ALL_MOVES.filter(isLegal);
    }
}

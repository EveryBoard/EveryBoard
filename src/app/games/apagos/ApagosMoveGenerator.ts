import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { ApagosMove } from './ApagosMove';
import { ApagosNode, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ApagosMoveGenerator extends MoveGenerator<ApagosMove, ApagosState> {

    public override getListMoves(node: ApagosNode, _config: NoConfig): ApagosMove[] {
        const state: ApagosState = node.gameState;
        function isLegal(move: ApagosMove): boolean {
            return ApagosRules.get().isLegal(move, state).isSuccess();
        }
        return ApagosMove.ALL_MOVES.filter(isLegal);
    }
}

import { MoveGenerator } from 'src/app/jscaip/AI';
import { ApagosMove } from './ApagosMove';
import { ApagosNode, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ApagosMoveGenerator extends MoveGenerator<ApagosMove, ApagosState> {

    public getListMoves(node: ApagosNode, _config: MGPOptional<EmptyRulesConfig>): ApagosMove[] {
        const state: ApagosState = node.gameState;
        function isLegal(move: ApagosMove): boolean {
            return ApagosRules.get().isLegal(move, state).isSuccess();
        }
        return ApagosMove.ALL_MOVES.filter(isLegal);
    }
}

import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class TrexoMoveGenerator extends MoveGenerator<TrexoMove, TrexoState> {

    private readonly rules: TrexoRules = TrexoRules.get();

    public getListMoves(node: TrexoNode, _config: MGPOptional<EmptyRulesConfig>): TrexoMove[] {
        return this.rules.getLegalMoves(node.gameState);
    }
}

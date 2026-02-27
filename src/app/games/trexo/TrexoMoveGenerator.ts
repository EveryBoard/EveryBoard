import { MoveGenerator } from '../../jscaip/AI/AI';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';

export class TrexoMoveGenerator extends MoveGenerator<TrexoMove, TrexoState> {

    private readonly rules: TrexoRules = TrexoRules.get();

    public override getListMoves(node: TrexoNode, _config: NoConfig): TrexoMove[] {
        return this.rules.getLegalMoves(node.gameState);
    }
}

import { MoveGenerator } from 'src/app/jscaip/AI';
import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class TrexoMoveGenerator extends MoveGenerator<TrexoMove, TrexoState> {

    private readonly rules: TrexoRules = TrexoRules.get();

    public override getListMoves(node: TrexoNode, _config: NoConfig): TrexoMove[] {
        return this.rules.getLegalMoves(node.gameState);
    }
}

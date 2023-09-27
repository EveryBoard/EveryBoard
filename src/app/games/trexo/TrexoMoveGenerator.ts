import { MoveGenerator } from 'src/app/jscaip/AI';
import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';

export class TrexoMoveGenerator extends MoveGenerator<TrexoMove, TrexoState> {

    private readonly rules: TrexoRules = TrexoRules.get();

    public getListMoves(node: TrexoNode): TrexoMove[] {
        return this.rules.getLegalMoves(node.gameState);
    }
}

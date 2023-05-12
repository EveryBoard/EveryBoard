import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';

export class LinesOfActionMinimax extends Minimax<LinesOfActionMove, LinesOfActionState> {

    public getListMoves(node: LinesOfActionNode): LinesOfActionMove[] {
        return LinesOfActionRules.getListMovesFromState(node.gameState);
    }
    public getBoardValue(node: LinesOfActionNode): BoardValue {
        const state: LinesOfActionState = node.gameState;
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        if (zero === 1 && one > 1) {
            return new BoardValue(Player.ZERO.getVictoryValue());
        } else if (zero > 1 && one === 1) {
            return new BoardValue(Player.ONE.getVictoryValue());
        } else {
            // More groups = less score
            return BoardValue.from(100 / zero, 100 / one);
        }
    }
}

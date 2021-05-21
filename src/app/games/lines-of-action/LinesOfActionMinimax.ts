import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';

export class LinesOfActionMinimax extends Minimax<LinesOfActionMove, LinesOfActionState> {

    public getListMoves(node: LinesOfActionNode): LinesOfActionMove[] {
        return LinesOfActionRules.getListMovesFromState(node.gamePartSlice);
    }
    public getBoardValue(move: LinesOfActionMove, state: LinesOfActionState): NodeUnheritance {
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        if (zero === 1 && one > 1) {
            return new NodeUnheritance(Player.ZERO.getVictoryValue());
        } else if (zero > 1 && one === 1) {
            return new NodeUnheritance(Player.ONE.getVictoryValue());
        } else {
            // More groups = less score
            return new NodeUnheritance((100 / zero) * Player.ZERO.getScoreModifier() +
                (100 / one) * Player.ONE.getScoreModifier());
        }
    }
}

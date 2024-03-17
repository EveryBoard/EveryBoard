import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { RectanglzMove } from './RectanglzMove';
import { RectanglzNode } from './RectanglzRules';
import { RectanglzState } from './RectanglzState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Player } from 'src/app/jscaip/Player';

export class RectanglzHeuristic extends Heuristic<RectanglzMove, RectanglzState> {

    public override getBoardValue(node: RectanglzNode, _config: NoConfig): BoardValue {
        const state: RectanglzState = node.gameState;// TODO KILL IT AND DUMMIFY WITH SCORE
        let domination: number = state.countPieceOf(Player.ZERO) * Player.ZERO.getScoreModifier();
        domination += state.countPieceOf(Player.ONE) * Player.ONE.getScoreModifier();
        return BoardValue.of(domination);
    }

}

import { EmptyRulesConfig } from '../../config/RulesConfig';
import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Heuristic';
import { PlayerOrNone } from '../../jscaip/Player';

import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';

export class TrexoAlignmentHeuristic extends Heuristic<TrexoMove, TrexoState> {

    public getBoardValue(node: TrexoNode, _config: EmptyRulesConfig): BoardValue {
        let score: number = 0;
        const state: TrexoState = node.gameState;
        for (const coordAndContent of state.getCoordsAndContents()) {
            // for every column, starting from the bottom of each column
            // while we haven't reached the top or an empty space
            const pieceOwner: PlayerOrNone = coordAndContent.content.getOwner();
            if (pieceOwner.isPlayer()) {
                const squareScore: number = TrexoRules.getSquareScore(state, coordAndContent.coord);
                score += squareScore;
            }
        }
        return BoardValue.of(score);
    }

}

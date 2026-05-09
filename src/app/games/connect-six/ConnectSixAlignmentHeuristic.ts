import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Minimax';
import { GobanConfig } from '../../jscaip/GobanConfig';

import { ConnectSixMove } from './ConnectSixMove';
import { ConnectSixNode, ConnectSixRules } from './ConnectSixRules';
import { ConnectSixState } from './ConnectSixState';

export class ConnectSixAlignmentHeuristic extends Heuristic<ConnectSixMove, ConnectSixState, BoardValue, GobanConfig> {

    public getBoardValue(node: ConnectSixNode, _config: GobanConfig): BoardValue {
        const state: ConnectSixState = node.gameState;
        let score: number = 0;
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const squareScore: number =
                ConnectSixRules.CONNECT_SIX_HELPER.getSquareScore(state, coordAndContent.coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}

import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { ConnectSixMove } from './ConnectSixMove';
import { ConnectSixNode, ConnectSixRules } from './ConnectSixRules';
import { ConnectSixState } from './ConnectSixState';

export class ConnectSixAlignmentHeuristic extends Heuristic<ConnectSixMove, ConnectSixState> {

    public getBoardValue(node: ConnectSixNode): BoardValue {
        const state: ConnectSixState = node.gameState;
        let score: number = 0;
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content.isPlayer()) {
                const squareScore: number =
                    ConnectSixRules.CONNECT_SIX_HELPER.getSquareScore(state, coordAndContent.coord);
                score += squareScore;
            }
        }
        return new BoardValue([score]);
    }

}

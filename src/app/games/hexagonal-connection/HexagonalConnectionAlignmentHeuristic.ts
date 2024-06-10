import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { HexagonalConnectionMove } from './HexagonalConnectionMove';
import { HexagonalConnectionNode, HexagonalConnectionRules } from './HexagonalConnectionRules';
import { HexagonalConnectionState } from './HexagonalConnectionState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class HexagonalConnectionAlignmentHeuristic extends Heuristic<HexagonalConnectionMove,
                                                                     HexagonalConnectionState>
{
    public getBoardValue(node: HexagonalConnectionNode, _config: NoConfig): BoardValue {
        const state: HexagonalConnectionState = node.gameState;
        let score: number = 0;
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const squareScore: number =
                HexagonalConnectionRules.HEXAGONAL_CONNECTION_HELPER.getSquareScore(state, coordAndContent.coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}

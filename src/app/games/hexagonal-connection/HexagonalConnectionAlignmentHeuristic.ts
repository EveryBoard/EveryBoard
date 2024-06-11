import { MGPOptional } from '@everyboard/lib';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { HexagonalConnectionMove } from './HexagonalConnectionMove';
import { HexagonalConnectionConfig, HexagonalConnectionNode, HexagonalConnectionRules } from './HexagonalConnectionRules';
import { HexagonalConnectionState } from './HexagonalConnectionState';

export class HexagonalConnectionAlignmentHeuristic extends Heuristic<HexagonalConnectionMove,
                                                                     HexagonalConnectionState,
                                                                     BoardValue,
                                                                     HexagonalConnectionConfig>
{
    public getBoardValue(node: HexagonalConnectionNode, config: MGPOptional<HexagonalConnectionConfig>): BoardValue {
        const state: HexagonalConnectionState = node.gameState;
        let score: number = 0;
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const squareScore: number = HexagonalConnectionRules
                .getHexagonalConnectionHelper(config)
                .getSquareScore(state, coordAndContent.coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}

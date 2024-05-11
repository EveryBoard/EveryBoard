import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { ConnectSixMove } from './ConnectSixMove';
import { ConnectSixNode, ConnectSixRules } from './ConnectSixRules';
import { ConnectSixState } from './ConnectSixState';
import { MGPOptional } from '@everyboard/lib';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';

export class ConnectSixAlignmentHeuristic extends Heuristic<ConnectSixMove, ConnectSixState, BoardValue, GobanConfig> {

    public getBoardValue(node: ConnectSixNode, _config: MGPOptional<GobanConfig>): BoardValue {
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

import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Minimax';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { ConnectSixMove } from '../connect-six/ConnectSixMove';

import { ConnectNConfig, ConnectNNode } from './ConnectNRules';

export class ConnectNAlignmentHeuristic
    extends Heuristic<ConnectSixMove, TopologicGameState<FourStatePiece>, BoardValue, ConnectNConfig>
{

    public getBoardValue(node: ConnectNNode, _config: ConnectNConfig): BoardValue {
        const state: TopologicGameState<FourStatePiece> = node.gameState;
        let score: number = 0;
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerCoords: Coord[] = state
            .getCoordsAndContents()
            .filter((coordAndContent: { coord: Coord, content: FourStatePiece }) => {
                return coordAndContent.content.is(currentPlayer);
            })
            .map((coordAndContent: { coord: Coord, content: FourStatePiece }) => coordAndContent.coord);
        for (const coord of playerCoords) {
            const squareScore: number = 0 // TODO
                // ConnectNRules.CONNECT_SIX_HELPER.getSquareScore(state, coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}

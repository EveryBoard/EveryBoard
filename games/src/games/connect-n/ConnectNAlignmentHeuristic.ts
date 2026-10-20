import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Heuristic';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { ConnectNMove } from '../connect-n/ConnectNMove';

import { ConnectNConfig, ConnectNNode, ConnectNRules } from './ConnectNRules';

export class ConnectNAlignmentHeuristic
    extends Heuristic<ConnectNMove, TopologicGameState<FourStatePiece>, BoardValue, ConnectNConfig>
{

    public getBoardValue(node: ConnectNNode, config: ConnectNConfig): BoardValue {
        const state: TopologicGameState<FourStatePiece> = node.gameState;
        let score: number = 0;
        const lastPlayer: Player = state.getCurrentOpponent();
        const lastPlayerCoords: Coord[] = state
            .getCoordsAndContents()
            .filter((coordAndContent: { coord: Coord; content: FourStatePiece }) => {
                return coordAndContent.content.is(lastPlayer);
            })
            .map((coordAndContent: { coord: Coord; content: FourStatePiece }) => coordAndContent.coord);
        for (const coord of lastPlayerCoords) {
            const squareScore: number = ConnectNRules.getHelper(config).getSquareScore(state, coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}

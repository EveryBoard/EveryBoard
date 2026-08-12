import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Minimax';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { NInARowHelper } from '../../jscaip/NInARowHelper';
import { Player } from '../../jscaip/Player';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { ConnectNMove } from '../connect-n/ConnectNMove';

import { ConnectNConfig, ConnectNNode } from './ConnectNRules';

export class ConnectNAlignmentHeuristic
    extends Heuristic<ConnectNMove, TopologicGameState<FourStatePiece>, BoardValue, ConnectNConfig>
{

    public getBoardValue(node: ConnectNNode, config: ConnectNConfig): BoardValue {
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
            const squareScore: number = new NInARowHelper(
                (piece: FourStatePiece) => piece.getPlayer(),
                config.n,
            ).getSquareScore(state, coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}

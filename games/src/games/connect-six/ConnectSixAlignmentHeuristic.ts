import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Heuristic';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { Direction } from '../../jscaip/direction/Direction';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { ConnectSixMove } from '../connect-six/ConnectSixMove';

import { ConnectSixConfig, ConnectSixNode, ConnectSixRules } from './ConnectSixRules';

export class ConnectSixAlignmentHeuristic
    extends Heuristic<ConnectSixMove, TopologicGameState<FourStatePiece, Direction>, BoardValue, ConnectSixConfig>
{

    public getBoardValue(node: ConnectSixNode, config: ConnectSixConfig): BoardValue {
        const state: TopologicGameState<FourStatePiece, Direction> = node.gameState;
        let score: number = 0;
        const lastPlayer: Player = state.getCurrentOpponent();
        const lastPlayerCoords: Coord[] = state
            .getCoordsAndContents()
            .filter((coordAndContent: { coord: Coord; content: FourStatePiece }) => {
                return coordAndContent.content.is(lastPlayer);
            })
            .map((coordAndContent: { coord: Coord; content: FourStatePiece }) => coordAndContent.coord);
        for (const coord of lastPlayerCoords) {
            const squareScore: number = ConnectSixRules.getHelper(config).getSquareScore(state, coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}

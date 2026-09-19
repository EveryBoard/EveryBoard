import { BoardValue } from '../../jscaip/AI/BoardValue';
import { HeuristicBounds, HeuristicWithBounds } from '../../jscaip/AI/Heuristic';
import { Coord } from '../../jscaip/Coord';

import { P4Move } from './P4Move';
import { P4Config, P4Node, P4Rules } from './P4Rules';
import { P4State } from './P4State';

export class P4Heuristic extends HeuristicWithBounds<P4Move, P4State, BoardValue, P4Config> {

    public getBoardValue(node: P4Node, _config: P4Config): BoardValue {
        const state: P4State = node.gameState;
        let score: number = 0;
        for (let x: number = 0; x < state.getWidth(); x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = state.getHeight() - 1; y !== -1 && state.board[y][x].isPlayer(); y--) {
                // while we haven't reached the top or an empty space
                const squareScore: number = P4Rules.get().P4_HELPER.getSquareScore(state, new Coord(x, y));
                score += squareScore;
            }
        }
        return BoardValue.of(score);
    }

    // When there exists a minimal/maximal value for a heuristic, it is useful to know it.
    public override getBounds(config: P4Config): HeuristicBounds<BoardValue> {
        // Experimentally, we hardly find a board with value >20 on a regular board.
        // So we'll count 2 per square to be safe
        const max: number = 2 * config.width * config.height;
        return {
            player0Best: BoardValue.ofSingle(max, 0),
            player1Best: BoardValue.ofSingle(0, max),
        };
    }

}

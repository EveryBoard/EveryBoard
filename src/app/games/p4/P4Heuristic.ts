import { Heuristic } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Node, P4Rules } from './P4Rules';
import { Coord } from 'src/app/jscaip/Coord';

export class P4Heuristic extends Heuristic<P4Move, P4State> {
    public getBoardValue(node: P4Node): BoardValue {
        const state: P4State = node.gameState;
        let score: number = 0;
        for (let x: number = 0; x < P4State.WIDTH; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = P4State.HEIGHT - 1; y !== -1 && state.board[y][x].isPlayer(); y--) {
                // while we haven't reached the top or an empty space
                const squareScore: number = P4Rules.P4_HELPER.getSquareScore(state, new Coord(x, y));
                score += squareScore;
            }
        }
        return new BoardValue(score);
    }
}
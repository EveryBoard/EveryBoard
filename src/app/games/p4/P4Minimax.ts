import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Node, P4Rules } from './P4Rules';
import { Debug } from 'src/app/utils/utils';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

@Debug.log
export class P4MoveGenerator extends MoveGenerator<P4Move, P4State> {

    public getListMoves(node: P4Node): P4Move[] {
        return P4Rules.getListMoves(node)
            .sort((left: P4Move, right: P4Move) => {
                const distanceFromCenterLeft: number = Math.abs(left.x - 3);
                const distanceFromCenterRight: number = Math.abs(right.x - 3);
                return distanceFromCenterLeft - distanceFromCenterRight;
            });
    }
}

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

export class P4Minimax extends Minimax<P4Move, P4State> {

    public constructor() {
        super('Minimax', P4Rules.get(), new P4Heuristic(), new P4MoveGenerator());
    }
}

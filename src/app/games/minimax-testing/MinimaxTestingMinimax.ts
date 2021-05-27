import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { MinimaxTestingMove } from './MinimaxTestingMove';
import { MinimaxTestingPartSlice } from './MinimaxTestingPartSlice';
import { MinimaxTestingNode } from './MinimaxTestingRules';

export class MinimaxTestingMinimax extends Minimax<MinimaxTestingMove, MinimaxTestingPartSlice> {

    public getBoardValue(node: MinimaxTestingNode): NodeUnheritance {
        const slice: MinimaxTestingPartSlice = node.gamePartSlice;
        return new NodeUnheritance(slice.getBoardAt(slice.location));
    }
    public getListMoves(n: MinimaxTestingNode): MinimaxTestingMove[] {
        const moves: MinimaxTestingMove[] = [];
        const state: MinimaxTestingPartSlice = n.gamePartSlice;
        if (state.location.x < 3) {
            const rightMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
            moves.push(rightMove);
        }
        if (state.location.y < 3) {
            const downMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
            moves.push(downMove);
        }
        return moves;
    }
}

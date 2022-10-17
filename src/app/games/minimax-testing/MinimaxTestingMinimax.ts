import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { MinimaxTestingMove } from './MinimaxTestingMove';
import { MinimaxTestingState } from './MinimaxTestingState';
import { MinimaxTestingNode, MinimaxTestingRules } from './MinimaxTestingRules';
import { GameStatus } from 'src/app/jscaip/Rules';

export class MinimaxTestingMinimax extends Minimax<MinimaxTestingMove, MinimaxTestingState> {

    public getBoardValue(node: MinimaxTestingNode): BoardValue {
        const gameStatus: GameStatus = MinimaxTestingRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new BoardValue(gameStatus.toBoardValue());
        }
        const state: MinimaxTestingState = node.gameState;
        return new BoardValue(state.getPieceAt(state.location));
    }
    public getListMoves(n: MinimaxTestingNode): MinimaxTestingMove[] {
        const moves: MinimaxTestingMove[] = [];
        const state: MinimaxTestingState = n.gameState;
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

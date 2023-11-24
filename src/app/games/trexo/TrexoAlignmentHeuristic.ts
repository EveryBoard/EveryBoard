import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';

export class TrexoAlignmentHeuristic extends Heuristic<TrexoMove, TrexoState> {

    public getBoardValue(node: TrexoNode): BoardValue {
        let score: number = 0;
        const state: TrexoState = node.gameState;
        for (const coordPiece of state.toMap()) {
            // for every column, starting from the bottom of each column
            // while we haven't reached the top or an empty space
            const pieceOwner: PlayerOrNone = state.getPieceAt(coordPiece.key).getOwner();
            if (pieceOwner.isPlayer()) {
                const squareScore: number = TrexoRules.getSquareScore(state, coordPiece.key);
                score += squareScore;
            }
        }
        return new BoardValue(score);
    }
}

import { DvonnMove } from './DvonnMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class DvonnMinimax extends Minimax<DvonnMove, DvonnState> {

    public getListMoves(node: DvonnNode): DvonnMove[] {
        const lastMove: MGPOptional<DvonnMove> = node.move;
        const state: DvonnState = node.gameState;
        const moves: DvonnMove[] = [];
        // For each movable piece, look at its possible targets
        DvonnRules.getMovablePieces(state).forEach((start: Coord) => {
            return DvonnRules.pieceTargets(state, start).forEach((end: Coord) => {
                const move: DvonnMove = DvonnMove.from(start, end).get();
                // the move should be legal by construction, hence we don't check it
                moves.push(move);
            });
        });
        if (moves.length === 0 && lastMove.equalsValue(DvonnMove.PASS) === false) {
            moves.push(DvonnMove.PASS);
        }
        return moves;
    }
    public getBoardValue(node: DvonnNode): BoardValue {
        const state: DvonnState = node.gameState;
        // Board value is the total number of pieces controlled by player 0 - by player 1
        const scores: number[] = DvonnRules.getScores(state);
        if (DvonnRules.getMovablePieces(state).length === 0) {
            // This is the end of the game, boost the score to clearly indicate it
            if (scores[0] > scores[1]) {
                return new BoardValue(Number.MIN_SAFE_INTEGER);
            } else if (scores[0] < scores[1]) {
                return new BoardValue(Number.MAX_SAFE_INTEGER);
            } else {
                return new BoardValue(0);
            }
        } else {
            return new BoardValue(scores[0] - scores[1]);
        }
    }
}

import { DvonnPartSlice } from './DvonnPartSlice';
import { DvonnMove } from './DvonnMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { DvonnNode, DvonnRules } from './DvonnRules';

export class DvonnMinimax extends Minimax<DvonnMove, DvonnPartSlice> {

    public getListMoves(node: DvonnNode): DvonnMove[] {
        return this.getListMovesFromSlice(node.move, node.gamePartSlice);
    }
    public getListMovesFromSlice(move: DvonnMove, slice: DvonnPartSlice): DvonnMove[] {
        const moves: DvonnMove[] = [];
        // For each movable piece, look at its possible targets
        DvonnRules.getMovablePieces(slice).forEach((start: Coord) => {
            return DvonnRules.pieceTargets(slice, start).forEach((end: Coord) => {
                const move: DvonnMove = DvonnMove.of(start, end);
                // the move should be legal by construction, hence we don't check it
                moves.push(move);
            });
        });
        if (moves.length === 0 && move !== DvonnMove.PASS) {
            moves.push(DvonnMove.PASS);
        }
        return moves;
    }
    public getBoardValue(node: DvonnNode): NodeUnheritance {
        const slice: DvonnPartSlice = node.gamePartSlice;
        // Board value is the total number of pieces controlled by player 0 - by player 1
        const scores: number[] = DvonnRules.getScores(slice);
        if (DvonnRules.getMovablePieces(slice).length === 0) {
            // This is the end of the game, boost the score to clearly indicate it
            if (scores[0] > scores[1]) {
                return new NodeUnheritance(Number.MIN_SAFE_INTEGER);
            } else if (scores[0] < scores[1]) {
                return new NodeUnheritance(Number.MAX_SAFE_INTEGER);
            } else {
                return new NodeUnheritance(0);
            }
        } else {
            return new NodeUnheritance(scores[0] - scores[1]);
        }
    }
}

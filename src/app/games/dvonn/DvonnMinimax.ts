import { DvonnMove } from './DvonnMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnGameState } from './DvonnGameState';
import { DvonnPieceStack } from './DvonnPieceStack';
import { Player } from 'src/app/jscaip/Player';

export class DvonnMinimax extends Minimax<DvonnMove, DvonnGameState> {

    public getListMoves(node: DvonnNode): DvonnMove[] {
        const lastMove: DvonnMove = node.move;
        const state: DvonnGameState = node.gamePartSlice;
        const moves: DvonnMove[] = [];
        // For each movable piece, look at its possible targets
        DvonnRules.getMovablePieces(state).forEach((start: Coord) => {
            return DvonnRules.pieceTargets(state, start).forEach((end: Coord) => {
                const move: DvonnMove = DvonnMove.of(start, end);
                // the move should be legal by construction, hence we don't check it
                moves.push(move);
            });
        });
        const opponent: Player = state.getCurrentPlayer().getOpponent();
        moves.sort((move1: DvonnMove, move2: DvonnMove): number => {
            const stack1: DvonnPieceStack = state.hexaBoard.getAt(move1.end);
            const stack2: DvonnPieceStack = state.hexaBoard.getAt(move2.end);
            const ennemies1: number = stack1.belongsTo(opponent) ? stack1.getSize() : 0;
            const ennemies2: number = stack2.belongsTo(opponent) ? stack2.getSize() : 0;
            if (ennemies1 < ennemies2) {
                return -1;
            } else if (ennemies1 > ennemies2) {
                return 1;
            } else {
                return 0;
            }
        });
        if (moves.length === 0 && lastMove !== DvonnMove.PASS) {
            moves.push(DvonnMove.PASS);
        }
        return moves;
    }
    public getBoardValue(node: DvonnNode): NodeUnheritance {
        const state: DvonnGameState = node.gamePartSlice;
        // Board value is the total number of pieces controlled by player 0 - by player 1
        const scores: number[] = DvonnRules.getScores(state);
        if (DvonnRules.getMovablePieces(state).length === 0) {
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

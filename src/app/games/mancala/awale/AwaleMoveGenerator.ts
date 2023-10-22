import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MancalaState } from '../common/MancalaState';
import { AwaleRules } from './AwaleRules';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';
import { MancalaNode } from '../common/MancalaRules';

export class AwaleMoveGenerator extends MoveGenerator<MancalaMove, MancalaState> {

    public getListMoves(node: MancalaNode): MancalaMove[] { // TODO: adapt for multi-distribution
        const moves: MancalaMove[] = [];
        const state: MancalaState = node.gameState;
        const turn: number = state.turn;
        const player: number = (turn + 1) % 2; // So player zero is on row 1
        let newMove: MancalaMove;
        let x: number = 0;
        while (x < state.board[0].length) {
            // for each house that might be playable
            if (state.getPieceAtXY(x, player) !== 0) {
                // if the house is not empty
                newMove = MancalaMove.of(MancalaDistribution.of(x));
                // see if the move is legal
                const legality: MGPValidation = AwaleRules.get().isLegal(newMove, state);

                if (legality.isSuccess()) {
                    // if the move is legal, we add it to the list of moves
                    newMove = MancalaMove.of(MancalaDistribution.of(x));
                    moves.push(newMove);
                }
            }
            x++;
        }
        return moves;
    }
}

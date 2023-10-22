import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MancalaState } from '../common/MancalaState';
import { KalahMove } from '../kalah/KalahMove';
import { AwaleNode, AwaleRules } from './AwaleRules';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { MancalaDistribution } from '../common/MancalaMove';

export class AwaleMoveGenerator extends MoveGenerator<KalahMove, MancalaState> {

    public getListMoves(node: AwaleNode): KalahMove[] { // TODO: adapt for multi-distribution
        const moves: KalahMove[] = [];
        const state: MancalaState = node.gameState;
        const turn: number = state.turn;
        const player: number = (turn + 1) % 2; // So player zero is on row 1
        let newMove: KalahMove;
        let x: number = 0;
        while (x < state.board[0].length) {
            // for each house that might be playable
            if (state.getPieceAtXY(x, player) !== 0) {
                // if the house is not empty
                newMove = KalahMove.of(MancalaDistribution.of(x));
                // see if the move is legal
                const legality: MGPValidation = AwaleRules.get().isLegal(newMove, state);

                if (legality.isSuccess()) {
                    // if the move is legal, we add it to the list of moves
                    newMove = KalahMove.of(MancalaDistribution.of(x));
                    moves.push(newMove);
                }
            }
            x++;
        }
        return moves;
    }
}

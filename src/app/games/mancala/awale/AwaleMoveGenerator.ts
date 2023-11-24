import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MancalaState } from '../common/MancalaState';
import { AwaleMove } from './AwaleMove';
import { AwaleNode, AwaleRules } from './AwaleRules';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';

export class AwaleMoveGenerator extends MoveGenerator<AwaleMove, MancalaState> {

    public getListMoves(node: AwaleNode): AwaleMove[] {
        const moves: AwaleMove[] = [];
        const state: MancalaState = node.gameState;
        const turn: number = state.turn;
        const player: number = (turn + 1) % 2; // So player zero is on row 1
        let newMove: AwaleMove;
        let x: number = 0;
        while (x < MancalaState.WIDTH) {
            // for each house that might be playable
            if (state.getPieceAtXY(x, player) !== 0) {
                // if the house is not empty
                newMove = AwaleMove.of(x);
                // see if the move is legal
                const legality: MGPValidation = AwaleRules.get().isLegal(newMove, state);

                if (legality.isSuccess()) {
                    // if the move is legal, we add it to the list of moves
                    newMove = AwaleMove.of(x);

                    moves.push(newMove);
                }
            }
            x++;
        }
        return moves;
    }
}

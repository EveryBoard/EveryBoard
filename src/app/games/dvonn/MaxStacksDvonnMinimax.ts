import { Coord } from 'src/app/jscaip/Coord';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { DvonnMinimax } from './DvonnMinimax';
import { DvonnGameState } from './DvonnGameState';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnPieceStack } from './DvonnPieceStack';
import { Player } from 'src/app/jscaip/Player';
import { DvonnMove } from './DvonnMove';
import { assert } from 'src/app/utils/utils';

export class MaxStacksDvonnMinimax extends DvonnMinimax {
    public getListMoves(node: DvonnNode): DvonnMove[] {
        const state: DvonnGameState = node.gamePartSlice;
        const moves: DvonnMove[] = super.getListMoves(node);

        // Sort the moves by the size of pieces that they add to the player
        const opponent: Player = state.getCurrentPlayer().getOpponent();
        moves.sort((move1: DvonnMove, move2: DvonnMove): number => {
            // We can't have DvonnMove.PASS here, because it would be the single move of the list
            assert(move1 !== DvonnMove.PASS && move2 !== DvonnMove.PASS, 'Cannot sort with DvonnMove.PASS');

            const stack1: DvonnPieceStack = state.hexaBoard.getAt(move1.end);
            const stack2: DvonnPieceStack = state.hexaBoard.getAt(move2.end);
            const ennemies1: number = stack1.belongsTo(opponent) ? stack1.getSize() : 0;
            const ennemies2: number = stack2.belongsTo(opponent) ? stack2.getSize() : 0;
            if (ennemies1 < ennemies2) {
                return 1; // sort from biggest to smallest
            } else if (ennemies1 > ennemies2) {
                return -1;
            } else {
                return 0;
            }
        });
        return moves;
    }

    public getBoardValue(node: DvonnNode): NodeUnheritance {
        const slice: DvonnGameState = node.gamePartSlice;
        // Board value is percentage of the stacks controlled by the player
        const scores: number[] = DvonnRules.getScores(slice);
        const pieces: Coord[] = slice.hexaBoard.getAllPieces();
        const numberOfStacks: number = pieces.length;
        const player0Stacks: number = pieces.filter((c: Coord): boolean =>
            slice.hexaBoard.getAt(c).belongsTo(Player.ZERO)).length;
        const player1Stacks: number = pieces.filter((c: Coord): boolean =>
            slice.hexaBoard.getAt(c).belongsTo(Player.ONE)).length;
        return new NodeUnheritance(
            ((player0Stacks * scores[0] * Player.ZERO.getScoreModifier()) +
                (player1Stacks * scores[1] * Player.ONE.getScoreModifier())) / numberOfStacks);
    }
}

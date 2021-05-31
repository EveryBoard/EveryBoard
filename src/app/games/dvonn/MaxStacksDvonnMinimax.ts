import { Coord } from 'src/app/jscaip/Coord';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { DvonnMinimax } from './DvonnMinimax';
import { DvonnGameState } from './DvonnGameState';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnPieceStack } from './DvonnPieceStack';
import { Player } from 'src/app/jscaip/Player';
import { DvonnMove } from './DvonnMove';
import { assert } from 'src/app/utils/utils';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class MaxStacksDvonnMinimax extends DvonnMinimax {
    public getListMoves(node: DvonnNode): DvonnMove[] {
        const state: DvonnGameState = node.gamePartSlice;
        const moves: DvonnMove[] = super.getListMoves(node);

        // Sort the moves by the size of pieces that they add to the player
        const opponent: Player = state.getCurrentPlayer().getOpponent();
        ArrayUtils.sortByDescending(moves, (move: DvonnMove): number => {
            // We can't have DvonnMove.PASS here, because it would be the single move of the list
            assert(move !== DvonnMove.PASS, 'Cannot sort with DvonnMove.PASS');

            const stack: DvonnPieceStack = state.hexaBoard.getAt(move.end);
            const opponentPieces: number = stack.belongsTo(opponent) ? stack.getSize() : 0;
            return opponentPieces;
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

import { Coord } from 'src/app/jscaip/Coord';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { DvonnMinimax } from './DvonnMinimax';
import { DvonnState } from './DvonnState';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnPieceStack } from './DvonnPieceStack';
import { Player } from 'src/app/jscaip/Player';
import { DvonnMove } from './DvonnMove';
import { assert } from 'src/app/utils/assert';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { GameStatus } from 'src/app/jscaip/Rules';

export class MaxStacksDvonnMinimax extends DvonnMinimax {

    public override getListMoves(node: DvonnNode): DvonnMove[] {
        const state: DvonnState = node.gameState;
        const moves: DvonnMove[] = super.getListMoves(node);

        // Sort the moves by the size of pieces that they add to the player
        const opponent: Player = state.getCurrentPlayer().getOpponent();
        ArrayUtils.sortByDescending(moves, (move: DvonnMove): number => {
            // We can't have DvonnMove.PASS here, because it would be the single move of the list
            assert(move !== DvonnMove.PASS, 'Cannot sort with DvonnMove.PASS');

            const stack: DvonnPieceStack = state.getPieceAt(move.getEnd());
            const opponentPieces: number = stack.belongsTo(opponent) ? stack.getSize() : 0;
            return opponentPieces;
        });
        return moves;
    }
    public override getMetrics(node: DvonnNode): [number, number] {
        const state: DvonnState = node.gameState;
        // The metric is percentage of the stacks controlled by the player
        const scores: [number, number] = DvonnRules.getScores(state);
        const pieces: Coord[] = state.getAllPieces();
        const numberOfStacks: number = pieces.length;
        for (const player of Player.PLAYERS) {
            const playerStacks: number = pieces.filter((c: Coord): boolean =>
                state.getPieceAt(c).belongsTo(player)).length;
            scores[player.value] = scores[player.value] * playerStacks / numberOfStacks;
        }
        return scores;
    }
}

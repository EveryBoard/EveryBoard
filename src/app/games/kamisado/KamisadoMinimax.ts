import { KamisadoMove } from './KamisadoMove';
import { KamisadoState } from './KamisadoState';
import { Player } from 'src/app/jscaip/Player';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { KamisadoNode, KamisadoRules } from './KamisadoRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KamisadoMinimax extends Minimax<KamisadoMove, KamisadoState> {

    public getListMoves(node: KamisadoNode): KamisadoMove[] {
        const moves: KamisadoMove[] = KamisadoRules.getListMovesFromState(node.gameState);
        ArrayUtils.sortByDescending(moves, (move: KamisadoMove): number => move.length());
        return moves;
    }
    // Returns the value of the board, as the difference of distance to the win
    public getBoardValue(node: KamisadoNode): NodeUnheritance {
        const state: KamisadoState = node.gameState;
        const player: Player = state.getCurrentPlayer();
        if (KamisadoRules.mustPass(state) && state.alreadyPassed) {
            return new NodeUnheritance(player.getDefeatValue());
        }

        const [furthest0, furthest1]: [number, number] = KamisadoRules.getFurthestPiecePositions(state);
        // Board value is how far my piece is - how far my opponent piece is, except in case of victory
        if (furthest1 === 7) {
            return new NodeUnheritance(Player.ONE.getVictoryValue());
        } else if (furthest0 === 0) {
            return new NodeUnheritance(Player.ZERO.getVictoryValue());
        } else {
            return new NodeUnheritance(furthest1 - (7 - furthest0));
        }
    }
}

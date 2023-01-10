import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { SCORE } from 'src/app/jscaip/SCORE';
import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';

export class TrexoMinimax extends Minimax<TrexoMove, TrexoState> {

    public getListMoves(node: TrexoNode): TrexoMove[] {
        return TrexoRules.get().getLegalMoves(node.gameState);
    }
    public getBoardValue(node: TrexoNode): BoardValue {
        // Dummy version: return new BoardValue(TrexoRules.get().getGameStatus(node).toBoardValue());
        let score: number = 0;

        for (let x: number = 0; x < TrexoState.SIZE; x++) {
            for (let y: number = 0; y < TrexoState.SIZE; y++) {
                const coord: Coord = new Coord(x, y);
                if (node.gameState.getPieceAt(coord).owner.isPlayer()) {
                    const tmpScore: number = TrexoRules.getSquareScore(node.gameState, coord);
                    if (MGPNode.getScoreStatus(tmpScore) !== SCORE.DEFAULT) {
                        // if we find a pre-victory
                        return new BoardValue(tmpScore); // we return it
                    }
                    score += tmpScore;
                }
            }
        }
        return new BoardValue(score);
    }

}

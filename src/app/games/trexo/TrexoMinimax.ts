import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
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
        const state: TrexoState = node.gameState;
        const lastPlayer: Player = state.getCurrentOpponent();
        let lastPlayerAligned5: boolean = false;
        for (let x: number = 0; x < TrexoState.SIZE; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 0; y < TrexoState.SIZE; y++) {
                // while we haven't reached the top or an empty space
                const pieceOwner: PlayerOrNone = state.getPieceAtXY(x, y).owner;
                if (pieceOwner.isPlayer()) {
                    const tmpScore: number = TrexoRules.getSquareScore(state, new Coord(x, y));
                    if (MGPNode.getScoreStatus(tmpScore) === SCORE.VICTORY) {
                        if (pieceOwner === lastPlayer) {
                            lastPlayerAligned5 = true;
                        } else {
                            return new BoardValue(lastPlayer.getDefeatValue());
                        }
                    } else {
                        score += tmpScore;
                    }
                }
            }
        }
        if (lastPlayerAligned5) {
            return new BoardValue(lastPlayer.getVictoryValue());
        }
        return new BoardValue(score);
    }

}

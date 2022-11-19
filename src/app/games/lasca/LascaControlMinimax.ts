import { BoardValue } from 'src/app/jscaip/BoardValue';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { LascaMove } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaState } from './LascaState';

class LascaNode extends MGPNode<LascaRules, LascaMove, LascaState> {}

export class LascaControlMinimax extends Minimax<LascaMove, LascaState> {

    public getListMoves(node: LascaNode): LascaMove[] {
        const possiblesCaptures: LascaMove[] = LascaRules.getCaptures(node.gameState);
        if (possiblesCaptures.length > 0) {
            return possiblesCaptures;
        } else {
            return LascaRules.getSteps(node.gameState);
        }
    }
    public getBoardValue(node: LascaNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new BoardValue(gameStatus.toBoardValue());
        }
        const state: LascaState = node.gameState;
        const pieceUnderZeroControl: number = LascaRules.getPieceUnderControlBy(state, Player.ZERO).length;
        const pieceUnderOneControl: number = LascaRules.getPieceUnderControlBy(state, Player.ONE).length;
        return new BoardValue(pieceUnderOneControl - pieceUnderZeroControl);
    }
}

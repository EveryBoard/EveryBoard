import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ApagosMove } from './ApagosMove';
import { ApagosNode, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';

export class ApagosDummyMinimax extends Minimax<ApagosMove, ApagosState> {

    public getListMoves(node: ApagosNode): ApagosMove[] {
        const state: ApagosState = node.gameState;
        function isLegal(move: ApagosMove) {
            return ApagosRules.get().isLegal(move, state).isSuccess();
        }
        return ApagosMove.ALL_MOVES.filter(isLegal);
    }
    public getBoardValue(node: ApagosNode): NodeUnheritance {
        const gameStatus: GameStatus = ApagosRules.get().getGameStatus(node);
        if (gameStatus.isEndGame) {
            return NodeUnheritance.fromWinner(gameStatus.winner);
        }
        const levelThreeDominant: Player = node.gameState.board[3].getDominatingPlayer();
        return new NodeUnheritance(levelThreeDominant.getScoreModifier());
    }
}

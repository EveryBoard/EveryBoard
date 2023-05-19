import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { PylosNode, PylosRules } from './PylosRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPSet } from 'src/app/utils/MGPSet';

export class PylosMinimax extends Minimax<PylosMove, PylosState> {

    public static getListMoves(node: PylosNode): PylosMove[] {
        const state: PylosState = node.gameState;
        const result: PylosMove[] = [];
        const stateInfo: { freeToMove: PylosCoord[]; landable: PylosCoord[]; } = PylosRules.getStateInfo(state);
        const climbings: PylosMove[] = PylosRules.getClimbingMoves(stateInfo);
        const drops: PylosMove[] = PylosRules.getDropMoves(stateInfo);
        const moves: PylosMove[] = climbings.concat(drops);
        for (const move of moves) {
            const postMoveState: PylosState = state.applyLegalMove(move, false);
            let possiblesCaptures: MGPSet<MGPSet<PylosCoord>> = new MGPSet();
            if (PylosRules.canCapture(postMoveState, move.landingCoord)) {
                possiblesCaptures = PylosRules.getPossibleCaptures(postMoveState);
            } else {
                result.push(move);
            }
            for (const possiblesCapture of possiblesCaptures) {
                const newMove: PylosMove = PylosMove.changeCapture(move, possiblesCapture.toList());
                result.push(newMove);
            }
        }
        return result;
    }
    public getListMoves(node: PylosNode): PylosMove[] {
        return PylosMinimax.getListMoves(node);
    }
    public getBoardValue(node: PylosNode): BoardValue {
        const gameStatus: GameStatus = PylosRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        } else {
            const ownershipMap: { [owner: number]: number; } = node.gameState.getPiecesRepartition();
            return new BoardValue(ownershipMap[Player.ZERO.value] - ownershipMap[Player.ONE.value]);
        }
    }
}

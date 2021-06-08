import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { PylosPartSlice } from './PylosPartSlice';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { PylosNode, PylosRules } from './PylosRules';
import { GameStatus } from 'src/app/jscaip/Rules';

export class PylosMinimax extends Minimax<PylosMove, PylosPartSlice> {

    public static getListMoves(node: PylosNode): PylosMove[] {
        const state: PylosPartSlice = node.gamePartSlice;
        const result: PylosMove[] = [];
        const sliceInfo: { freeToMove: PylosCoord[]; landable: PylosCoord[]; } = PylosRules.getSliceInfo(state);
        const climbings: PylosMove[] = PylosRules.getClimbingMoves(sliceInfo);
        const drops: PylosMove[] = PylosRules.getDropMoves(sliceInfo);
        const moves: PylosMove[] = climbings.concat(drops);
        for (const move of moves) {
            let possiblesCaptures: PylosCoord[][] = [[]];
            if (PylosRules.canCapture(state, move.landingCoord)) {
                possiblesCaptures = PylosRules.getPossibleCaptures(sliceInfo.freeToMove,
                                                                   move.startingCoord,
                                                                   move.landingCoord);
            }
            for (const possiblesCapture of possiblesCaptures) {
                const newMove: PylosMove = PylosMove.changeCapture(move, possiblesCapture);
                result.push(newMove);
            }
        }
        return result;
    }
    public getListMoves(node: PylosNode): PylosMove[] {
        return PylosMinimax.getListMoves(node);
    }
    public getBoardValue(node: PylosNode): NodeUnheritance {
        const gameStatus: GameStatus = PylosRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        } else {
            const ownershipMap: { [owner: number]: number; } = node.gamePartSlice.getPiecesRepartition();
            return new NodeUnheritance(ownershipMap[Player.ZERO.value] - ownershipMap[Player.ONE.value]);
        }
    }
}

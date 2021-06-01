import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { PylosPartSlice } from './PylosPartSlice';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { PylosNode, PylosRules } from './PylosRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { Player } from 'src/app/jscaip/Player';

export class PylosOrderedMinimax extends Minimax<PylosMove, PylosPartSlice> {

    public static countStoneUsed(move: PylosMove): number {
        let stoneUsed: number = move.isClimb() ? 0 : 1;
        if (move.firstCapture.isPresent()) {
            stoneUsed -= 1;
            if (move.secondCapture.isPresent()) {
                stoneUsed -= 1;
            }
        }
        return stoneUsed;
    }
    public static sumMoveEmplacementByValue(move: PylosMove): number {
        let value: number = move.landingCoord.z;
        if (move.startingCoord.isPresent()) {
            value += (3 - move.startingCoord.get().z);
        }
        if (move.firstCapture.isPresent()) {
            value += (3 - move.firstCapture.get().z);
            if (move.secondCapture.isPresent()) {
                value += (3 - move.secondCapture.get().z);
            }
        }
        return value;
    }
    public getListMoves(node: PylosNode): PylosMove[] {
        const slice: PylosPartSlice = node.gamePartSlice;
        const result: PylosMove[] = [];
        const sliceInfo: { freeToMove: PylosCoord[]; landable: PylosCoord[]; } = PylosRules.getSliceInfo(slice);
        const climbings: PylosMove[] = PylosRules.getClimbingMoves(sliceInfo);
        const drops: PylosMove[] = PylosRules.getDropMoves(sliceInfo);
        const moves: PylosMove[] = climbings.concat(drops);
        for (const move of moves) {
            let possiblesCaptures: PylosCoord[][] = [[]];
            if (PylosRules.canCapture(slice, move.landingCoord)) {
                possiblesCaptures = PylosRules.getPossibleCaptures(sliceInfo.freeToMove,
                                                                   move.startingCoord,
                                                                   move.landingCoord);
            }
            for (const possiblesCapture of possiblesCaptures) {
                const newMove: PylosMove = PylosMove.changeCapture(move, possiblesCapture);
                result.push(newMove);
            }
        }
        return this.orderMoves(result);
    }
    public orderMoves(moves: PylosMove[]): PylosMove[] {
        return moves.sort((a: PylosMove, b: PylosMove) => {
            const captureA: number = 12 * PylosOrderedMinimax.countStoneUsed(a);
            const captureB: number = 12 * PylosOrderedMinimax.countStoneUsed(b);
            const emplacementA: number = PylosOrderedMinimax.sumMoveEmplacementByValue(a);
            const emplacementB: number = PylosOrderedMinimax.sumMoveEmplacementByValue(b);
            return (captureA + emplacementA) - (captureB + emplacementB);
        });
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

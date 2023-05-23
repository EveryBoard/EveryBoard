import { PylosMove } from './PylosMove';
import { PylosNode } from './PylosRules';
import { PylosMinimax } from './PylosMinimax';

export class PylosOrderedMinimax extends PylosMinimax {

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
    public override getListMoves(node: PylosNode): PylosMove[] {
        const moves: PylosMove[] = PylosMinimax.getListMoves(node);
        return this.orderMoves(moves);
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
}

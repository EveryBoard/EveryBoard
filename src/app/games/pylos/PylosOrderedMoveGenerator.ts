import { PylosMove } from './PylosMove';
import { PylosMoveGenerator } from './PylosMoveGenerator';
import { PylosNode } from './PylosRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class PylosOrderedMoveGenerator extends PylosMoveGenerator {

    public override getListMoves(node: PylosNode, config: NoConfig): PylosMove[] {
        const moves: PylosMove[] = super.getListMoves(node, config);
        return this.orderMoves(moves);
    }

    private orderMoves(moves: PylosMove[]): PylosMove[] {
        return moves.sort((a: PylosMove, b: PylosMove) => {
            const captureA: number = 12 * this.countStoneUsed(a);
            const captureB: number = 12 * this.countStoneUsed(b);
            const emplacementA: number = this.sumMoveEmplacementByValue(a);
            const emplacementB: number = this.sumMoveEmplacementByValue(b);
            return (captureA + emplacementA) - (captureB + emplacementB);
        });
    }
    private countStoneUsed(move: PylosMove): number {
        let stoneUsed: number = move.isClimb() ? 0 : 1;
        if (move.firstCapture.isPresent()) {
            stoneUsed -= 1;
            if (move.secondCapture.isPresent()) {
                stoneUsed -= 1;
            }
        }
        return stoneUsed;
    }
    private sumMoveEmplacementByValue(move: PylosMove): number {
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
}

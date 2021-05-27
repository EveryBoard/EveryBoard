import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { PylosPartSlice } from './PylosPartSlice';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { PylosNode, PylosRules } from './PylosRules';


export class PylosMinimax extends Minimax<PylosMove, PylosPartSlice> {

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
        return result;
    }
    public getBoardValue(node: PylosNode): NodeUnheritance {
        const slice: PylosPartSlice = node.gamePartSlice;
        const ownershipMap: { [owner: number]: number; } = slice.getPiecesRepartition();
        if (ownershipMap[Player.ZERO.value] === 15) {
            return new NodeUnheritance(Number.MAX_SAFE_INTEGER);
        } else if (ownershipMap[Player.ONE.value] === 15) {
            return new NodeUnheritance(Number.MIN_SAFE_INTEGER);
        } else {
            return new NodeUnheritance(ownershipMap[Player.ZERO.value] - ownershipMap[Player.ONE.value]);
        }
    }
}

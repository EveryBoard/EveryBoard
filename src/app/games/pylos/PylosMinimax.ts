import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { PlayerMetricHeuristic, Minimax } from 'src/app/jscaip/Minimax';
import { PylosNode, PylosRules } from './PylosRules';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

export class PylosMoveGenerator extends MoveGenerator<PylosMove, PylosState> {

    public getListMoves(node: PylosNode): PylosMove[] {
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
}

export class PylosHeuristic extends PlayerMetricHeuristic<PylosMove, PylosState> {

    public getMetrics(node: PylosNode): [number, number] {
        const ownershipMap: { [owner: number]: number; } = node.gameState.getPiecesRepartition();
        return [ownershipMap[Player.ZERO.value], ownershipMap[Player.ONE.value]];
    }
}

export class PylosMinimax extends Minimax<PylosMove, PylosState> {

    public constructor() {
        super('Minimax', PylosRules.get(), new PylosHeuristic(), new PylosMoveGenerator());
    }
}

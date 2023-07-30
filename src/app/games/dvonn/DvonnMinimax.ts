import { DvonnMove } from './DvonnMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

export class DvonnMoveGenerator extends MoveGenerator<DvonnMove, DvonnState> {

    public getListMoves(node: DvonnNode): DvonnMove[] {
        const lastMove: MGPOptional<DvonnMove> = node.move;
        const state: DvonnState = node.gameState;
        const moves: DvonnMove[] = [];
        // For each movable piece, look at its possible targets
        DvonnRules.getMovablePieces(state).forEach((start: Coord) => {
            return DvonnRules.pieceTargets(state, start).forEach((end: Coord) => {
                const move: DvonnMove = DvonnMove.from(start, end).get();
                // the move should be legal by construction, hence we don't check it
                moves.push(move);
            });
        });
        if (moves.length === 0 && lastMove.equalsValue(DvonnMove.PASS) === false) {
            moves.push(DvonnMove.PASS);
        }
        return moves;
    }
}

export class DvonnHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public getMetrics(node: DvonnNode): [number, number] {
        // The metric the total number of pieces controlled by a player
        return DvonnRules.getScores(node.gameState);
    }
}

export class DvonnMinimax extends Minimax<DvonnMove, DvonnState> {

    public constructor() {
        super('Minimax', DvonnRules.get(), new DvonnHeuristic(), new DvonnMoveGenerator());
    }
}

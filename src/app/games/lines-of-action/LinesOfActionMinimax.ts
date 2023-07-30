import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';

export class LinesOfActionMoveGenerator extends MoveGenerator<LinesOfActionMove, LinesOfActionState> {


    public getListMoves(node: LinesOfActionNode): LinesOfActionMove[] {
        const state: LinesOfActionState = node.gameState;
        const moves: LinesOfActionMove[] = [];

        if (LinesOfActionRules.getVictory(state).isPresent()) {
            return moves;
        }

        for (let y: number = 0; y < LinesOfActionState.SIZE; y++) {
            for (let x: number = 0; x < LinesOfActionState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: PlayerOrNone = state.getPieceAt(coord);
                if (piece.isPlayer()) {
                    for (const target of LinesOfActionRules.possibleTargets(state, coord)) {
                        const move: LinesOfActionMove = LinesOfActionMove.from(coord, target).get();
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
    }
}

export class LinesOfActionHeuristic extends PlayerMetricHeuristic<LinesOfActionMove, LinesOfActionState> {

    public getMetrics(node: LinesOfActionNode): [number, number] {
        const state: LinesOfActionState = node.gameState;
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        // More groups = less score
        return [100 / zero, 100 / one];
    }
}

export class LinesOfActionMinimax extends Minimax<LinesOfActionMove, LinesOfActionState> {

    public constructor() {
        super('LinesOfActionMinimax',
              LinesOfActionRules.get(),
              new LinesOfActionHeuristic(),
              new LinesOfActionMoveGenerator());
    }
}

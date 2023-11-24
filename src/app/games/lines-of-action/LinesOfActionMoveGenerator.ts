import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';

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

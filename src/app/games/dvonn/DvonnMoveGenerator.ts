
import { MoveGenerator } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';

export class DvonnMoveGenerator extends MoveGenerator<DvonnMove, DvonnState> {

    public override getListMoves(node: DvonnNode, _config: EmptyRulesConfig): DvonnMove[] {
        const lastMove: MGPOptional<DvonnMove> = node.previousMove;
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

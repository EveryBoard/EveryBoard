import { EmptyRulesConfig } from '../../config/RulesConfig';
import { MoveGenerator } from '../../jscaip/AI/AI';
import { GipfCapture, GipfProjectHelper } from '../../jscaip/GipfProjectHelper';
import { Table } from '../../jscaip/TableUtils';

import { GipfMove, GipfPlacement } from './GipfMove';
import { GipfRules, GipfNode } from './GipfRules';
import { GipfState } from './GipfState';

export class GipfMoveGenerator extends MoveGenerator<GipfMove, GipfState> {

    public override getListMoves(node: GipfNode, _config: EmptyRulesConfig): GipfMove[] {
        const state: GipfState = node.gameState;
        const moves: GipfMove[] = [];

        if (GipfRules.isGameOver(state)) {
            return moves;
        }

        this.getPossibleCaptureCombinations(state).forEach((initialCaptures: ReadonlyArray<GipfCapture>) => {
            const stateAfterCapture: GipfState = GipfRules.applyCaptures(initialCaptures, state);
            GipfRules.getPlacements(stateAfterCapture).forEach((placement: GipfPlacement) => {
                const stateAfterPlacement: GipfState = GipfRules.applyPlacement(placement, stateAfterCapture);
                this.getPossibleCaptureCombinations(stateAfterPlacement)
                    .forEach((finalCaptures: ReadonlyArray<GipfCapture>) => {
                        const moveSimple: GipfMove = new GipfMove(placement, initialCaptures, finalCaptures);
                        moves.push(moveSimple);
                    });
            });
        });
        return moves;
    }
    private getPossibleCaptureCombinations(state: GipfState): Table<GipfCapture> {
        const possibleCaptures: GipfCapture[] = GipfRules.getPossibleCaptures(state);
        return GipfProjectHelper.getPossibleCaptureCombinationsFromPossibleCaptures(possibleCaptures);
    }
}

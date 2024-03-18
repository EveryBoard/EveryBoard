import { Table } from 'src/app/jscaip/TableUtils';
import { GipfMove, GipfPlacement } from './GipfMove';
import { GipfState } from './GipfState';
import { GipfRules, GipfNode } from './GipfRules';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { GipfCapture, GipfProjectHelper } from 'src/app/jscaip/GipfProjectHelper';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class GipfMoveGenerator extends MoveGenerator<GipfMove, GipfState> {

    public override getListMoves(node: GipfNode, _config: NoConfig): GipfMove[] {
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

import { Player } from 'src/app/jscaip/Player';
import { TrexoPiece, TrexoPieceStack, TrexoState } from '../TrexoState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { TrexoAlignmentHeuristic } from '../TrexoAlignmentHeuristic';

const ______: TrexoPieceStack = TrexoPieceStack.EMPTY;
const X1__T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 0)]);
const O1__T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 0)]);

describe('TrexoHeuristic', () => {

    let heuristic: TrexoAlignmentHeuristic;

    beforeEach(() => {
        heuristic = new TrexoAlignmentHeuristic();
    });

    it('should prefer to have more visible pieces aligned than less', () => {
        // Given a board where two pieces of player zero are aligned
        const weakState: TrexoState = TrexoState.of([
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, O1__T0, ______, ______, ______, ______],
            [______, ______, ______, ______, X1__T0, X1__T0, ______, ______, ______, ______],
            [______, ______, ______, ______, O1__T0, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
        ], 1);

        // And a board where three piece of player zero are aligned
        const strongState: TrexoState = TrexoState.of([
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, O1__T0, ______, ______, ______, ______],
            [______, ______, ______, ______, X1__T0, X1__T0, X1__T0, ______, ______, ______],
            [______, ______, ______, ______, O1__T0, ______, O1__T0, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
        ], 1);

        // When comparing them
        // Then the second one should be deemed better
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState,
                                                               MGPOptional.empty(),
                                                               strongState,
                                                               MGPOptional.empty(),
                                                               Player.ZERO);
    });

});

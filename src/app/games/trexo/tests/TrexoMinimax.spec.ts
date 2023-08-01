import { Player } from 'src/app/jscaip/Player';
import { TrexoPiece, TrexoPieceStack, TrexoState } from '../TrexoState';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TrexoHeuristic, TrexoMinimax } from '../TrexoMinimax';
import { TrexoRules } from '../TrexoRules';

const ______: TrexoPieceStack = TrexoPieceStack.EMPTY;
const X1__T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 0)]);
const O1__T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 0)]);

describe('TrexoHeuristic', () => {

    let heuristic: TrexoHeuristic;

    beforeEach(() => {
        const rules: TrexoRules = TrexoRules.get();
        heuristic = new TrexoHeuristic();
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
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                           weakState,
                                                           MGPOptional.empty(),
                                                           strongState,
                                                           MGPOptional.empty(),
                                                           Player.ZERO);
    });
});

describe('TrexoMinimax', () => {
    it('should create', () => {
        expect(new TrexoMinimax()).toBeTruthy();
    });
});

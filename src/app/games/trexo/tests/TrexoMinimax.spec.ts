import { Player } from 'src/app/jscaip/Player';
import { TrexoPiece, TrexoPieceStack, TrexoState } from '../TrexoState';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TrexoMinimax } from '../TrexoMinimax';
import { TrexoRules } from '../TrexoRules';

const ______: TrexoPieceStack = TrexoPieceStack.EMPTY;
const X1__T0: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ONE, 0)]);
const O1__T0: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ZERO, 0)]);

describe('TrexoMinimax', () => {

    let minimax: TrexoMinimax;

    beforeEach(() => {
        const rules: TrexoRules = TrexoRules.get();
        minimax = new TrexoMinimax(rules, 'Trexo Minimax');
    });
    it('should prefer to have more visible pieces aligned than less', () => {
        // Given a board where two piece are aligned of player zero
        const weakState: TrexoState = TrexoState.from([
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
        ], 1).get();

        // And a board where three piece are aligned of player zero
        const strongState: TrexoState = TrexoState.from([
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
        ], 1).get();

        // When comparing them
        // Then the second one should be deemed better
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState,
                                                           MGPOptional.empty(),
                                                           strongState,
                                                           MGPOptional.empty(),
                                                           Player.ZERO);
    });
});

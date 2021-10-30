import { fakeAsync } from '@angular/core/testing';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ApagosComponent } from '../apagos.component';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosMessage } from '../ApagosMessage';
import { ApagosMove } from '../ApagosMove';
import { ApagosState } from '../ApagosState';

describe('ApagosComponent', () => {

    let componentTestUtils: ComponentTestUtils<ApagosComponent>;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<ApagosComponent>('Apagos');
    }));
    it('should show valid drops', () => {
        // Given a board where some square are selectable and some not, some square can receive drop some don't
        const previousState: ApagosState = ApagosState.fromRepresentation(7, [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [7, 5, 3, 1],
        ], 6, 5);
        const previousMove: ApagosMove = ApagosMove.drop(ApagosCoord.THREE, Player.ZERO);
        const state: ApagosState = ApagosState.fromRepresentation(8, [
            [0, 0, 0, 1],
            [0, 0, 1, 0],
            [7, 5, 3, 1],
        ], 5, 5);

        // when rendering the board
        componentTestUtils.setupState(state, previousState, previousMove);

        // then only the valid first drop should be shown
        componentTestUtils.expectElementToExist('#dropArrow_zero_0');
        componentTestUtils.expectElementToExist('#dropArrow_one_0');
        componentTestUtils.expectElementToExist('#dropArrow_zero_1');
        componentTestUtils.expectElementToExist('#dropArrow_one_1');
        componentTestUtils.expectElementToExist('#dropArrow_zero_2');
        componentTestUtils.expectElementToExist('#dropArrow_one_2');
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_3');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_3');
    });
    it('should cancel move when starting move attempt by clicking a square without pieces of player', fakeAsync(async() => {
        // Given a board with a square with piece of your ennemy
        const state: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 1, 0],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);

        // When clicking on that square
        // Then move should fail
        const reason: string = ApagosMessage.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE();
        componentTestUtils.expectClickFailure('#square_2', reason);
    }));
    it('should drop when clicking on arrow above square', fakeAsync(async() => {
        // Given initial board
        const state: ApagosState = ApagosState.getInitialState();
        componentTestUtils.setupState(state);

        // When clicking on the light arrow above the second square
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ONE);
        await componentTestUtils.expectMoveSuccess('#dropArrow_one_1', move);

        // Then the second square should be filled on top by Player.ONE and then should switch place with square three
        componentTestUtils.expectElementToHaveClass('#square_2_piece_0_out_of_5', 'player1');
        componentTestUtils.expectElementNotToHaveClass('#square_1_piece_0_out_of_3', 'player0');
        componentTestUtils.expectElementNotToHaveClass('#square_1_piece_0_out_of_3', 'player1');
    }));
    it('should select piece when clicking on square and show only legal following slide', fakeAsync(async() => {
        // Given a board, turn for Player.ZERO, with one of his piece in square 2, and square 0 full
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 0, 2, 0],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);

        // When clicking on square 2
        await componentTestUtils.expectClickSuccess('#square_2');

        // Then only "Player.ZERO drop" on square 1 should be displayed
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_0');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_0');
        componentTestUtils.expectElementToExist('#dropArrow_zero_1'); // all but this one
        componentTestUtils.expectElementNotToExist('#dropArrow_one_1');
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_2');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_2');
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_3');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_3');
    }));
    it('should confirm slide down by clicking on a dropping arrow', fakeAsync(async() => {
        // Given a board where a square has been selected
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 0, 2, 0],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#square_2');

        // When clicking on a drop arrow (#dropArrow_zero_1)
        // Then the move should have been done
        const move: ApagosMove = ApagosMove.transfer(ApagosCoord.TWO, ApagosCoord.ONE).get();
        await componentTestUtils.expectMoveSuccess('#dropArrow_zero_1', move);
    }));
    it('should cancel move when clicking on squares two click in a row', fakeAsync(async() => {
        // Given a board with a selected square
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 0, 2, 1],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#square_2');

        // When clicking another square
        // Then the move should have been "cancel/restarted"
        const reason: string = ApagosMessage.MUST_END_MOVE_BY_DROP();
        await componentTestUtils.expectClickFailure('#square_3', reason);
    }));
    it('should show previous drop by highlighting the two switched squares and the new piece', fakeAsync(async() => {
        // Given a board with a previous move being a drop
        const previousState: ApagosState = ApagosState.fromRepresentation(1, [
            [2, 1, 0, 0],
            [5, 0, 0, 0],
            [7, 3, 5, 1],
        ], 5, 5);
        const previousMove: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ZERO);
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 0, 2, 0],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 6, 5);

        // When displaying the board
        componentTestUtils.setupState(state, previousState, previousMove);

        // Then the switch square should be highlighted and the new piece too
        componentTestUtils.expectElementToHaveClass('#square_1', 'last-move');
        componentTestUtils.expectElementToHaveClass('#square_2', 'last-move');
        componentTestUtils.expectElementToHaveClass('#square_2_piece_1_out_of_3', 'player0');
        componentTestUtils.expectElementToHaveClass('#square_2_piece_1_out_of_3', 'last-move');
    }));
    it('TODOTODO: en cas dégalité highlight bien le noir quand cest noir et le jaune quand cest jaune');

    it('should show from where the last transfer down came from', fakeAsync(async() => {
        // Given a board with a previous move being a drop
        const previousState: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 0, 2],
            [1, 0, 0, 1],
            [7, 5, 1, 3],
        ], 6, 5);
        const previousMove: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ZERO).get();
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [7, 5, 1, 3],
        ], 6, 5);

        // When displaying the board
        componentTestUtils.setupState(state, previousState, previousMove);

        // Then the switch square should be highlighted and the new piece too
        componentTestUtils.expectElementToHaveClass('#square_0_piece_0_out_of_7', 'player0');
        componentTestUtils.expectElementToHaveClass('#square_0_piece_1_out_of_7', 'player1');
        componentTestUtils.expectElementToHaveClass('#square_0_piece_1_out_of_7', 'last-move');

        componentTestUtils.expectElementNotToHaveClass('#square_3_piece_1_out_of_3', 'player0');
        componentTestUtils.expectElementNotToHaveClass('#square_3_piece_1_out_of_3', 'player1');
        componentTestUtils.expectElementToHaveClass('#square_3_piece_1_out_of_3', 'captured-stroke');

        componentTestUtils.expectElementToHaveClass('#square_3_piece_2_out_of_3', 'player1');
    }));
});

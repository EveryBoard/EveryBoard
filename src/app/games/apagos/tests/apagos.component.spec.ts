import { fakeAsync } from '@angular/core/testing';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ApagosComponent } from '../apagos.component';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosMove } from '../ApagosMove';
import { ApagosState } from '../ApagosState';

describe('ApagosComponent', () => {

    let componentTestUtils: ComponentTestUtils<ApagosComponent>;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<ApagosComponent>('Apagos');
    }));
    it('should highlight both possible piece selection and drop', () => {
        // Given a board where some square are selectable and some not, some square can receive drop some don't
        const state: ApagosState = ApagosState.fromRepresentation(8, [
            [0, 0, 0, 1],
            [0, 0, 1, 0],
            [7, 5, 3, 1],
        ], 5, 5);

        // when rendering the board
        componentTestUtils.setupState(state);

        // then only the valid first click should be highlighted
        componentTestUtils.expectElementToExist('#dropArrow_zero_0');
        componentTestUtils.expectElementToExist('#dropArrow_one_0');
        componentTestUtils.expectElementToExist('#dropArrow_zero_1');
        componentTestUtils.expectElementToExist('#dropArrow_one_1');
        componentTestUtils.expectElementToExist('#dropArrow_zero_2');
        componentTestUtils.expectElementToExist('#dropArrow_one_2');
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_3');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_3');

        componentTestUtils.expectElementNotToExist('#selectable_square_0_highlight');
        componentTestUtils.expectElementNotToExist('#selectable_square_1_highlight');
        componentTestUtils.expectElementNotToExist('#selectable_square_2_highlight');
        componentTestUtils.expectElementToExist('#selectable_square_3_highlight');
    });
    it('should drop when clicking on arrow above square', fakeAsync(async() => {
        // Given initial board
        const state: ApagosState = ApagosState.getInitialState();
        componentTestUtils.setupState(state);

        // When clicking on the light arrow above the second square
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ONE).get();
        await componentTestUtils.expectMoveSuccess('#dropArrow_one_1', move);

        // Then the second square should be filled on top by Player.ONE and then should switch place with square three
        componentTestUtils.expectElementToExist('#square_2_piece_0_out_of_5_player_one');
        componentTestUtils.expectElementToExist('#square_1_piece_0_out_of_3_player_none');
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
        componentTestUtils.expectClickSuccess('#selectable_square_2_highlight');

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
        componentTestUtils.expectClickSuccess('#selectable_square_2_highlight');

        // When clicking on a drop arrow (#dropArrow_zero_1)
        // Then the move should have been done
        const move: ApagosMove = ApagosMove.slideDown(ApagosCoord.TWO, ApagosCoord.ONE).get();
        componentTestUtils.expectMoveSuccess('#dropArrow_zero_1', move);
    }));
    it('should change selected square when clicking on non-lower square', fakeAsync(async() => {
        // Given a board with a selected square
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 0, 2, 1],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);
        componentTestUtils.expectClickSuccess('#selectable_square_2_highlight');

        // When clicking another square
        // Then the move should have been "cancel/restarted"
        componentTestUtils.expectClickSuccess('#selectable_square_3');
    }));
    it('should show previous drop by highlighting the arrow above the highlighted square (when piece in stock)', fakeAsync(async() => {
        // Given a board with a previous move being a drop
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 0, 2, 0],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 6, 5);
        const previousState: ApagosState = ApagosState.fromRepresentation(1, [
            [2, 0, 1, 0],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        const previousMove: ApagosMove = ApagosMove.drop(ApagosCoord.TWO, Player.ZERO).get();

        // When displaying the board
        componentTestUtils.setupState(state, previousState, previousMove);

        // Then the dropping arrow should be highlighted and the square as well
        componentTestUtils.expectElementToExist('#dropArrow_zero_2_highligh');
        componentTestUtils.expectElementToExist('#selectable_square_3');
    }));
});

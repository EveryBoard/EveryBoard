import { fakeAsync } from '@angular/core/testing';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ApagosComponent } from '../apagos.component';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosFailure } from '../ApagosFailure';
import { ApagosMove } from '../ApagosMove';
import { ApagosState } from '../ApagosState';

describe('ApagosComponent', () => {

    let componentTestUtils: ComponentTestUtils<ApagosComponent>;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<ApagosComponent>('Apagos');
    }));
    describe('show last move', () => {
        it('should show only legal drop arrows', () => {
            // Given a board where some square are selectable and some not, some square can receive drop some don't
            const state: ApagosState = ApagosState.fromRepresentation(8, [
                [0, 0, 0, 1],
                [0, 0, 1, 0],
                [7, 5, 3, 1],
            ], 5, 5);

            // when rendering the board
            componentTestUtils.setupState(state);

            // then only the valid drop should be shown
            componentTestUtils.expectElementToExist('#dropArrow_zero_0');
            componentTestUtils.expectElementToExist('#dropArrow_one_0');
            componentTestUtils.expectElementToExist('#dropArrow_zero_1');
            componentTestUtils.expectElementToExist('#dropArrow_one_1');
            componentTestUtils.expectElementToExist('#dropArrow_zero_2');
            componentTestUtils.expectElementToExist('#dropArrow_one_2');

            // and the invalid one should not be shown
            componentTestUtils.expectElementNotToExist('#dropArrow_zero_3');
            componentTestUtils.expectElementNotToExist('#dropArrow_one_3');
        });
        it('should show switched squares', fakeAsync(async() => {
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

            // When rendering the board
            componentTestUtils.setupState(state, previousState, previousMove);

            // Then the switch square should be highlighted
            componentTestUtils.expectElementToHaveClass('#square_1', 'last-move');
            componentTestUtils.expectElementToHaveClass('#square_2', 'last-move');
        }));
        it('should show from where the last transfer came from Player.ZERO', fakeAsync(async() => {
            // Given a board with a previous move being a transfer
            const previousState: ApagosState = ApagosState.fromRepresentation(2, [
                [0, 0, 0, 3],
                [1, 0, 0, 2],
                [7, 3, 1, 5],
            ], 6, 5);
            const previousMove: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ZERO).get();
            const state: ApagosState = ApagosState.fromRepresentation(3, [
                [1, 0, 0, 2],
                [1, 0, 0, 2],
                [7, 3, 1, 5],
            ], 6, 5);

            // When rendering the board
            componentTestUtils.setupState(state, previousState, previousMove);

            // Then piece 2 should be "captured" as a left piece, belonging to no one
            componentTestUtils.expectElementNotToHaveClass('#square_3_piece_2_out_of_5', 'player0');
            componentTestUtils.expectElementNotToHaveClass('#square_3_piece_2_out_of_5', 'player1');
            componentTestUtils.expectElementToHaveClass('#square_3_piece_2_out_of_5', 'captured-stroke');
            // and piece 3 should be untouched
            componentTestUtils.expectElementToHaveClass('#square_3_piece_3_out_of_5', 'player1');
        }));
        it('should show from where the last transfer came from Player.ONE', fakeAsync(async() => {
            // Given a board with a previous move being a transfer
            const previousState: ApagosState = ApagosState.fromRepresentation(1, [
                [0, 0, 0, 1],
                [1, 0, 0, 2],
                [7, 3, 1, 5],
            ], 6, 5);
            const previousMove: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ZERO).get();
            const state: ApagosState = ApagosState.fromRepresentation(2, [
                [1, 0, 0, 1],
                [2, 0, 0, 1],
                [7, 3, 1, 5],
            ], 6, 5);

            // When rendering the board
            componentTestUtils.setupState(state, previousState, previousMove);

            // Then piece 1 should be "captured" as a left piece, belonging to no one
            componentTestUtils.expectElementNotToHaveClass('#square_3_piece_3_out_of_5', 'player0');
            componentTestUtils.expectElementNotToHaveClass('#square_3_piece_3_out_of_5', 'player1');
            componentTestUtils.expectElementToHaveClass('#square_3_piece_3_out_of_5', 'captured-stroke');
        }));
        it('should show last dropped piece (from drop by Player.ZERO)', fakeAsync(async() => {
            // Given a board with a previous drop by Player.ZERO
            const previousState: ApagosState = ApagosState.getInitialState();
            const previousMove: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ONE);
            const state: ApagosState = ApagosState.fromRepresentation(1, [
                [0, 0, 0, 1],
                [0, 0, 0, 0],
                [7, 5, 3, 1],
            ], 9, 10);

            // When rendering the board
            componentTestUtils.setupState(state, previousState, previousMove);

            // Then the third square should be filled on top by Player.ZERO
            componentTestUtils.expectElementToHaveClass('#square_3_piece_0_out_of_1', 'player0');
        }));
        it('should show last dropped piece (from drop on righmost coord)', fakeAsync(async() => {
            // Given a board with a previous drop by Player.ZERO
            const previousState: ApagosState = ApagosState.getInitialState();
            const previousMove: ApagosMove = ApagosMove.drop(ApagosCoord.THREE, Player.ZERO);
            const state: ApagosState = ApagosState.fromRepresentation(1, [
                [0, 0, 0, 1],
                [0, 0, 0, 0],
                [7, 5, 3, 1],
            ], 9, 10);

            // When rendering the board
            componentTestUtils.setupState(state, previousState, previousMove);

            // Then the third square should be filled on top by Player.ZERO
            componentTestUtils.expectElementToHaveClass('#square_3_piece_0_out_of_1', 'player0');
        }));
        it('should show last dropped piece (from transfer by Player.ONE)', fakeAsync(async() => {
            // Given a board with a previous drop by Player.ZERO
            const previousState: ApagosState = ApagosState.fromRepresentation(1, [
                [0, 0, 0, 0],
                [0, 0, 0, 1],
                [7, 5, 3, 1],
            ], 9, 10);
            const previousMove: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ONE).get();
            const state: ApagosState = ApagosState.fromRepresentation(2, [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [7, 5, 3, 1],
            ], 9, 10);

            // When rendering the board
            componentTestUtils.setupState(state, previousState, previousMove);

            // Then the second square should be filled on last case by Player.ONE
            componentTestUtils.expectElementToHaveClass('#square_1_piece_4_out_of_5', 'player1');
            componentTestUtils.expectElementToHaveClass('#square_1_piece_4_out_of_5', 'last-move');
        }));
    });
    it('should cancel move when starting move attempt by clicking a square without pieces of player', fakeAsync(async() => {
        // Given a board with a square with piece of your opponent
        const state: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 1, 0],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);

        // When clicking on that square
        // Then move should fail
        const reason: string = ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE();
        componentTestUtils.expectClickFailure('#square_2', reason);
    }));
    it('should drop when clicking on arrow above square', fakeAsync(async() => {
        // Given initial board
        const state: ApagosState = ApagosState.getInitialState();
        componentTestUtils.setupState(state);

        // When clicking on the light arrow above the second square
        // Then the move should have been a success
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ONE);
        await componentTestUtils.expectMoveSuccess('#dropArrow_one_1', move);
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
        // and square 2 should be selected
        componentTestUtils.expectElementToHaveClass('#square_2', 'selected');
        componentTestUtils.expectElementToHaveClass('#square_2_piece_1_out_of_3', 'selected');
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
    it('should cancel move when clicking on squares twice in a row', fakeAsync(async() => {
        // Given a board with a selected square
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 0, 2, 1],
            [5, 0, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#square_2');
        componentTestUtils.expectElementToHaveClass('#square_2', 'selected');

        // When clicking on the same square
        await componentTestUtils.expectClickSuccess('#square_2');

        // Then the piece should have lost its selected style
        componentTestUtils.expectElementNotToHaveClass('#square_2', 'selected');
    }));
    it('should change selected square when clicking on a square with one already selected', fakeAsync(async() => {
        // Given a board with a selected square
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [1, 1, 2, 1],
            [5, 1, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#square_2');

        // When clicking another VALID square
        // Then the move should not have been cancelled
        await componentTestUtils.expectClickSuccess('#square_1');
    }));
    it('should not allow to select leftmost space for transfer', fakeAsync(async() => {
        // Given a board with leftmost space not empty
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [2, 2, 2, 1],
            [5, 3, 0, 0],
            [7, 5, 3, 1],
        ], 5, 5);
        componentTestUtils.setupState(state);

        // when clicking on leftmost case
        // then move should be cancelled
        const reason: string = ApagosFailure.NO_POSSIBLE_TRANSFER_REMAINS();
        await componentTestUtils.expectClickFailure('#square_1', reason);
    }));
    it('should not show arrow when player has no longer pieces', fakeAsync(async() => {
        // Given a board where all piece could receive a drop but no piece are remaining
        const state: ApagosState = ApagosState.fromRepresentation(2, [
            [3, 2, 1, 1],
            [3, 2, 1, 0],
            [7, 5, 3, 1],
        ], 0, 0);

        // when rendering it
        componentTestUtils.setupState(state);

        // then no arrow should be displayed
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_0');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_0');
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_1');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_1');
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_2');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_2');
        componentTestUtils.expectElementNotToExist('#dropArrow_zero_3');
        componentTestUtils.expectElementNotToExist('#dropArrow_one_3');
    }));
});

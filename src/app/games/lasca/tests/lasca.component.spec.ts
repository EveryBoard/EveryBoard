/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LascaComponent } from '../lasca.component';

fdescribe('LascaComponent', () => {

    let testUtils: ComponentTestUtils<LascaComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LascaComponent>('Lasca');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('first click', () => {
        it(`should forbid clicking on opponent's pieces`, fakeAsync(async() => {
            // Given any board
            // When clicking on the opponent's piece
            // Then it should fail
        }));
        it('should forbid clicking on empty space', fakeAsync(async() => {
            // Given any board
            // When clicking on an empty space
            // Then it should fail
        }));
        it('should show clicked piece as selected', fakeAsync(async() => {
            // Given any board
            // When clicking on one of your pieces
            // Then it should show the clicked piece as 'selected'
        }));
    });
    describe('second click', () => {
        it('should cancelMove when clicking on occupied space', fakeAsync(async() => {
            // Given any board with a selected piece
            // When clicking on an occupied space
            // Then it should fail
        }));
        it('should cancelMove when doing impossible click', fakeAsync(async() => {
            // Given any board with a selected piece
            // When clicking on an empty space in (+2; +1) of selected piece
            // Then it should fail
        }));
        it('should deselect piece when clicking on the piece again', fakeAsync(async() => {
            // Given any board with a selected piece
            // When clicking on the selected piece again
            // Then the piece should no longer be selected
        }));
        it('should change selected piece when clicking on another one of your pieces', fakeAsync(async() => {
            // Given any board with a selected piece
            // When clicking on the selected piece
            // Then it should no longer be selected
        }));
        it('should allow simple step', fakeAsync(async() => {
            // Given any board with a selected piece
            // When doing a step
            // Then it should succeed

        }));
        it('should allow simple capture', fakeAsync(async() => {
            // Given any board with a selected piece and a possible capture
            // When doing a capture
            // Then it should be a success
        }));
        it('should highlight officer-logo of the piece that just got promoted', fakeAsync(async() => {
            // Given any board with a selected soldier about to become officer
            // When doing the promoting-move
            // Then the officier-logo on the piece should be highlighted
        }));
        it('should highlight next possible capture and show as captured the piece already', fakeAsync(async() => {
            // Given any board with a selected piece that could do a multiple capture
            // When doing the first capture
            // Then it should already be shown as captured, and the next possibles ones displayed
        }));
    });
    describe('multiple capture', () => {
        it('should validate capture when no more piece can be captured', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            // When doing the last capture
            // Then the move should be finalized
        }));
    });
});

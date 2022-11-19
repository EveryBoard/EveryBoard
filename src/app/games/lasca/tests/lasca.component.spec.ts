/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LascaComponent } from '../lasca.component';
import { LascaMove, LascaMoveFailure } from '../LascaMove';
import { LascaPiece, LascaSpace, LascaState } from '../LascaState';

describe('LascaComponent', () => {

    const zero: LascaPiece = LascaPiece.ZERO;
    const one: LascaPiece = LascaPiece.ONE;

    const _u: LascaSpace = new LascaSpace([zero]);
    const _v: LascaSpace = new LascaSpace([one]);
    const uv: LascaSpace = new LascaSpace([zero, one]);
    const __: LascaSpace = LascaSpace.EMPTY;

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
            const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
            await testUtils.expectClickFailure('#coord_0_0', reason);
        }));
        it('should forbid clicking on empty space', fakeAsync(async() => {
            // Given any board
            // When clicking on an empty space
            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            await testUtils.expectClickFailure('#coord_1_0', reason);
        }));
        it('should show clicked pile as selected', fakeAsync(async() => {
            // Given any board
            // When clicking on one of your pieces
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then it should show the clicked piece as 'selected'
            testUtils.expectElementToHaveClass('#coord_4_4_piece_0', 'selected-stroke');
        }));
    });
    describe('second click', () => {
        it('should cancelMove when clicking on opponent', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When clicking on an opponent
            const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
            await testUtils.expectClickFailure('#coord_2_2', reason);
            // Then it should fail
        }));
        it('should cancelMove when doing impossible click', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When clicking on an empty space in (+2; +1) of selected piece
            // Then it should fail
            const reason: string = LascaMoveFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL();
            await testUtils.expectClickFailure('#coord_6_5', reason);
        }));
        it('should deselect piece when clicking on the piece again', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');
            testUtils.expectElementToHaveClass('#coord_4_4_piece_0', 'selected-stroke');

            // When clicking on the selected piece again
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then the piece should no longer be selected
            testUtils.expectElementNotToHaveClass('#coord_4_4_piece_0', 'selected-stroke');
        }));
        it('should change selected piece when clicking on another one of your pieces', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When clicking on another piece
            await testUtils.expectClickSuccess('#coord_2_4');

            // Then it should deselect the previous and select the new
            testUtils.expectElementNotToHaveClass('#coord_4_4_piece_0', 'selected-stroke');
            testUtils.expectElementToHaveClass('#coord_2_4_piece_0', 'selected-stroke');
        }));
        it('should allow simple step', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When doing a step
            const move: LascaMove = LascaMove.fromStep(new Coord(4, 4), new Coord(3, 3)).get();

            // Then it should succeed
            await testUtils.expectMoveSuccess('#coord_3_3', move);
        }));
        it('should show left space after single step', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When doing simple step
            const move: LascaMove = LascaMove.fromStep(new Coord(4, 4), new Coord(3, 3)).get();
            await testUtils.expectMoveSuccess('#coord_3_3', move);

            // Then left space and landed space should be showed as moved
            testUtils.expectElementToHaveClass('#space_4_4', 'moved-fill');
            testUtils.expectElementToHaveClass('#space_3_3', 'moved-fill');
        }));
        it('should allow simple capture', fakeAsync(async() => {
            // Given any board with a selected piece and a possible capture
            const state: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, uv, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_2_2');

            // When doing a capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should be a success
            await testUtils.expectMoveSuccess('#coord_0_4', move);
        }));
        it('should have an officer-logo on the piece that just got promoted', fakeAsync(async() => {
            // Given any board with a selected soldier about to become officer
            const state: LascaState = LascaState.from([
                [__, __, __, __, _v, __, _v],
                [__, uv, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_u, __, _u, __, _u, __, _u],
            ], 0).get();
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_1_1');

            // When doing the promoting-move
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 1), new Coord(0, 0)).get();
            await testUtils.expectMoveSuccess('#coord_0_0', move);

            // Then the officier-logo should be on the piece
            testUtils.expectElementToExist('#coord_0_0_piece_1_officer_symbol');
        }));
        it('should highlight next possible capture and show as captured the piece already', fakeAsync(async() => {
            // Given any board with a selected piece that could do a multiple capture
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, _u, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1).get();
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_2_2');

            // When doing the first capture
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then it should already be shown as captured, and the next possibles ones displayed
            testUtils.expectElementToHaveClass('#coord_3_3', 'captured-fill');
        }));
    });
    describe('multiple capture', () => {
        it('should validate capture when no more piece can be captured', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, _u, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1).get();
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_2_2');
            await testUtils.expectClickSuccess('#coord_4_4');

            // When doing the last capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]).get();

            // Then the move should be finalized
            await testUtils.expectMoveSuccess('#coord_6_6', move);
        }));
    });
});

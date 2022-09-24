/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DiamComponent } from '../diam.component';
import { DiamFailure } from '../DiamFailure';
import { DiamMove, DiamMoveDrop, DiamMoveShift } from '../DiamMove';
import { DiamPiece } from '../DiamPiece';
import { DiamState } from '../DiamState';

describe('DiamComponent', () => {
    const __: DiamPiece = DiamPiece.EMPTY;
    const A1: DiamPiece = DiamPiece.ZERO_FIRST;
    const A2: DiamPiece = DiamPiece.ZERO_SECOND;
    const B1: DiamPiece = DiamPiece.ONE_FIRST;
    const B2: DiamPiece = DiamPiece.ONE_SECOND;

    let testUtils: ComponentTestUtils<DiamComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<DiamComponent>('Diam');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    describe('first click', () => {
        it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a piece of the opponent
            // Then the corresponding error is shown
            await testUtils.expectClickFailure('#piece_1_1_7', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }));
        it('should forbid transferring from a piece not owned by the player', fakeAsync(async() => {
            // Given a state
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, B2],
                [__, __, __, __, __, __, __, A2],
            ], 4);
            testUtils.setupState(state);
            // When clicking on B2
            // Then this is not a legal selection for a shift
            await testUtils.expectClickFailure('#click_7_1', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }));
        it('should forbid clicking on a space without selecting a piece first', fakeAsync(async() => {
            // Given the initial state
            // When clicking any space
            // Then it should let the user know that a piece must be selected first
            await testUtils.expectClickFailure('#click_0', DiamFailure.MUST_SELECT_PIECE_FIRST());
        }));
        it('should mark remaining piece a selected when clicked on', fakeAsync(async() => {
            // Given any board with remainingPiece
            // When clicking one of them
            await testUtils.expectClickSuccess('#piece_0_1_7');

            // Then the piece should be selected
            testUtils.expectElementToHaveClass('#piece_0_1_7', 'selected');
        }));
    });
    describe('second click', () => {
        it('should allow simple drops by clicking the piece and then the target', fakeAsync(async() => {
            // Given a board on which a piece is selected
            await testUtils.expectClickSuccess('#piece_0_1_7');

            // When clicking on a piece and then on a space
            const move: DiamMove = new DiamMoveDrop(2, DiamPiece.ZERO_SECOND);

            // Then the move should be made
            await testUtils.expectMoveSuccess('#click_2', move);
        }));
        it('should allow dropping piece on an opponent piece', fakeAsync(async() => {
            // Given a state where there are already pieces in game and a player's piece selected
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], 0);
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_0_0_0');

            // When clicking on an opponent piece on the top of a column
            const move: DiamMove = new DiamMoveDrop(0, DiamPiece.ZERO_FIRST);

            // Then the move should be a success and drop player's piece
            await testUtils.expectMoveSuccess('#click_0_1', move);
        }));
        it('should forbid dropping on a full stack', fakeAsync(async() => {
            // Given a state where one stack is already full and a remaining piece is selected
            const state: DiamState = DiamState.fromRepresentation([
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], 0);
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_0_0_0');

            // When dropping a piece on the full stack
            // TODO FOR REVIEW: ([A-Z])\s\s([A-Z]) ehehehehehehe
            const move: DiamMove = new DiamMoveDrop(0, DiamPiece.ZERO_FIRST);

            // Then the move should be illegal
            const reason: string = DiamFailure.SPACE_IS_FULL();
            await testUtils.expectMoveFailure('#click_0', reason, move);
        }));
        it('should allow shift by clicking the piece and then the target', fakeAsync(async() => {
            // Given a state where a shift can be made
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], 4);
            testUtils.setupState(state);
            // When clicking on A2 (in 7, 0) and then on the first column (0)
            await testUtils.expectClickSuccess('#click_7_0');
            const move: DiamMove = DiamMoveShift.fromRepresentation(new Coord(7, 3), 'clockwise');
            // Then the move should be legal
            await testUtils.expectMoveSuccess('#click_0', move);
        }));
        it('should allow shift from a piece in the middle of a stack', fakeAsync(async() => {
            // Given a state where a shift can be made
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, B2],
                [B1, __, __, __, __, __, __, A2],
            ], 4);
            testUtils.setupState(state);
            // When clicking on A1 and then on the last column
            // Then the move should be legal
            await testUtils.expectClickSuccess('#click_0_1');
            const move: DiamMove = DiamMoveShift.fromRepresentation(new Coord(0, 2), 'counterclockwise');
            await testUtils.expectMoveSuccess('#click_7', move);
        }));
        it('should forbid shift of more than one space', fakeAsync(async() => {
            // Given a state
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, B2],
                [__, __, __, __, __, __, __, A2],
            ], 4);
            testUtils.setupState(state);
            // When clicking on A2 and then somewhere else than the first line
            // Then the move should be not legal
            await testUtils.expectClickSuccess('#click_7_0');
            await testUtils.expectClickFailure('#click_2', DiamFailure.MUST_SHIFT_TO_NEIGHBOR());
        }));
        it('should forbid transferring if the stack would become too high', fakeAsync(async() => {
            // Given a state
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], 4);
            testUtils.setupState(state);

            // When clicking on B2
            await testUtils.expectClickSuccess('#click_7_0');
            const move: DiamMove = DiamMoveShift.fromRepresentation(new Coord(7, 3), 'clockwise');

            // Then this is not a legal selection for a shift
            const reason: string = DiamFailure.TARGET_STACK_TOO_HIGH();
            await testUtils.expectMoveFailure('#click_0', reason, move);
        }));
        it('should consider a piece in game click on a player piece as a regular piece click', fakeAsync(async() => {
            // Given a state where there are already pieces in game and a remaining piece is selected
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], 0);
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_0_0_0');

            // When clicking on a player piece in game
            await testUtils.expectClickSuccess('#click_0_0');

            // Then no move is made and the new piece is selected
            testUtils.expectElementToHaveClass('#click_0_0', 'selected');
        }));
        it('should deselect remaining piece when clicking on it again', fakeAsync(async() => {
            // Given a board on which a remaining piece is selected
            await testUtils.expectClickSuccess('#piece_0_1_7');

            // When clicking on it again
            await testUtils.expectClickSuccess('#piece_0_1_7');

            // Then it should no longer be selected
            testUtils.expectElementNotToHaveClass('#piece_0_1_7', 'selected');
        }));
    });
    describe('visuals', () => {
        it('should not let the user select a piece that is not available', fakeAsync(async() => {
            // Given a state where one piece is not available
            const state: DiamState = DiamState.fromRepresentation([
                [A1, B1, __, __, __, __, __, __],
                [A1, B1, __, __, __, __, __, __],
                [A1, B1, __, __, __, __, __, __],
                [A1, B1, __, __, __, __, __, __],
            ], 0);

            // When rendering the board
            testUtils.setupState(state);

            // Then this piece should not rendered
            testUtils.expectElementNotToExist('#piece_0_0');
        }));
        it('should display the right number of remainig pieces', fakeAsync(async() => {
            // Given a state
            const state: DiamState = DiamState.fromRepresentation([
                [__, B1, __, __, __, __, __, __],
                [A1, B1, __, __, __, __, __, __],
                [A1, B1, __, __, __, __, __, B2],
                [A1, B1, __, __, __, __, __, A2],
            ], 4);

            // When rendering it
            testUtils.setupState(state);

            // Then we should see the number of remaining pieces
            testUtils.expectElementToExist('#piece_0_0'); // A1 remains
            testUtils.expectElementNotToExist('#piece_1_0'); // B1 does not
            testUtils.expectElementToExist('#piece_0_1_7'); // A2
            testUtils.expectElementToExist('#piece_1_1'); // B2
        }));
        it('should show winning configuration clearly', fakeAsync(async() => {
            // Given a winning state
            const state: DiamState = DiamState.fromRepresentation([
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [A1, __, __, __, A1, __, __, B2],
                [A1, __, __, __, B1, __, __, A2],
            ], 4);

            // When rendering it
            testUtils.setupState(state);

            // Then only the winning pieces should be highlighted
            testUtils.expectElementToHaveClass('#click_0_1', 'victory-stroke');
            testUtils.expectElementToHaveClass('#click_4_1', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_0_0', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_0_2', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_7_0', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_7_1', 'victory-stroke');
        }));
    });
});


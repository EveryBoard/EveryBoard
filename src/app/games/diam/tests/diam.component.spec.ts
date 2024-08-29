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
    const O1: DiamPiece = DiamPiece.ZERO_FIRST;
    const O2: DiamPiece = DiamPiece.ZERO_SECOND;
    const X1: DiamPiece = DiamPiece.ONE_FIRST;
    const X2: DiamPiece = DiamPiece.ONE_SECOND;

    let testUtils: ComponentTestUtils<DiamComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<DiamComponent>('Diam');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('First click', () => {

        it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a piece of the opponent
            // Then the corresponding error is shown
            await testUtils.expectClickFailure('#piece_PLAYER_ONE_1_7', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }));

        it('should forbid transferring from a piece not owned by the player', fakeAsync(async() => {
            // Given a state with opponent piece on it
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, X2],
                [__, __, __, __, __, __, __, O2],
            ], 4);
            await testUtils.setupState(state);
            // When clicking on B2
            // Then this is not a legal selection for a shift
            await testUtils.expectClickFailure('#click_7_1', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }));

        it('should forbid clicking on a space without selecting a piece first', fakeAsync(async() => {
            // Given the initial state
            // When clicking any space
            // Then it should let the user know that a piece must be selected first
            await testUtils.expectClickFailure('#click_0', DiamFailure.MUST_SELECT_PIECE_FIRST());
        }));

        it('should mark remaining piece as selected when clicked on', fakeAsync(async() => {
            // Given any board with remainingPiece
            // When clicking one of them
            await testUtils.expectClickSuccess('#piece_PLAYER_ZERO_1_7');

            // Then the piece should be selected
            testUtils.expectElementToHaveClass('#piece_PLAYER_ZERO_1_7', 'selected-stroke');
        }));

        it('should mark piece on board as selected when clicked on', fakeAsync(async() => {
            // Given a board with piece on
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, X2],
                [__, __, __, __, __, __, __, O2],
            ], 4);
            await testUtils.setupState(state);

            // When clicking on it
            await testUtils.expectClickSuccess('#click_7_0');

            // Then it should be marked as selected
            testUtils.expectElementToHaveClass('#click_7_0', 'selected-stroke');
        }));
    });

    describe('Second click', () => {

        it('should allow simple drops by clicking the piece and then the target', fakeAsync(async() => {
            // Given a board on which a piece is selected
            await testUtils.expectClickSuccess('#piece_PLAYER_ZERO_1_7');

            // When clicking on a piece and then on a space
            const move: DiamMove = new DiamMoveDrop(2, DiamPiece.ZERO_SECOND);

            // Then the move should be made
            await testUtils.expectMoveSuccess('#click_2', move);
        }));

        it('should allow dropping piece on an opponent piece', fakeAsync(async() => {
            // Given a state where there are already pieces in game and a player's piece selected
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
                [X1, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_PLAYER_ZERO_0_0');

            // When clicking on an opponent piece on the top of a column
            const move: DiamMove = new DiamMoveDrop(0, DiamPiece.ZERO_FIRST);

            // Then the move should succeed and drop player's piece
            await testUtils.expectMoveSuccess('#click_0_1', move);
        }));

        it('should forbid dropping on a full stack', fakeAsync(async() => {
            // Given a state where one stack is already full and a remaining piece is selected
            const state: DiamState = DiamState.ofRepresentation([
                [X1, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
                [X1, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_PLAYER_ZERO_0_0');

            // When dropping a piece on the full stack
            const move: DiamMove = new DiamMoveDrop(0, DiamPiece.ZERO_FIRST);

            // Then the move should be illegal
            const reason: string = DiamFailure.SPACE_IS_FULL();
            await testUtils.expectMoveFailure('#click_0', reason, move);
        }));

        it('should allow shift by clicking the piece and then the target', fakeAsync(async() => {
            // Given a state where a shift can be made
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [X1, __, __, __, __, __, __, X2],
                [O1, __, __, __, __, __, __, O2],
            ], 4);
            await testUtils.setupState(state);

            // When clicking on A2 (in 7, 0) and then on the first column (0)
            await testUtils.expectClickSuccess('#click_7_0');

            const move: DiamMove = DiamMoveShift.ofRepresentation(new Coord(7, 3), 'clockwise');

            // Then the move should succeed
            await testUtils.expectMoveSuccess('#click_0', move);
        }));

        it('should allow shift from a piece in the middle of a stack', fakeAsync(async() => {
            // Given a state where a shift can be made
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, X2],
                [X1, __, __, __, __, __, __, O2],
            ], 4);
            await testUtils.setupState(state);

            // When clicking on A1 and then on the last column
            // Then the move should succeed
            await testUtils.expectClickSuccess('#click_0_1');
            const move: DiamMove = DiamMoveShift.ofRepresentation(new Coord(0, 2), 'counterclockwise');
            await testUtils.expectMoveSuccess('#click_7', move);
        }));

        it('should forbid shift of more than one space', fakeAsync(async() => {
            // Given a state
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, X2],
                [__, __, __, __, __, __, __, O2],
            ], 4);
            await testUtils.setupState(state);

            // When clicking on A2 and then somewhere else than the first line
            // Then it should fail
            await testUtils.expectClickSuccess('#click_7_0');
            await testUtils.expectClickFailure('#click_2', DiamFailure.MUST_SHIFT_TO_NEIGHBOR());
        }));

        it('should forbid transferring if the stack would become too high', fakeAsync(async() => {
            // Given a state
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, X2],
                [O1, __, __, __, __, __, __, O2],
            ], 4);
            await testUtils.setupState(state);

            // When clicking on B2
            await testUtils.expectClickSuccess('#click_7_0');
            const move: DiamMove = DiamMoveShift.ofRepresentation(new Coord(7, 3), 'clockwise');

            // Then this is not a legal selection for a shift
            const reason: string = DiamFailure.TARGET_STACK_TOO_HIGH();
            await testUtils.expectMoveFailure('#click_0', reason, move);
        }));

        it('should consider a piece in game click on a player piece as a regular piece click', fakeAsync(async() => {
            // Given a state where there are already pieces in game and a remaining piece is selected
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
                [X1, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_PLAYER_ZERO_0_0');

            // When clicking on a player piece in game
            await testUtils.expectClickSuccess('#click_0_0');

            // Then no move is made and the new piece is selected
            testUtils.expectElementToHaveClass('#click_0_0', 'selected-stroke');
        }));

        it('should deselect remaining piece when clicking on it again', fakeAsync(async() => {
            // Given a board on which a remaining piece is selected
            await testUtils.expectClickSuccess('#piece_PLAYER_ZERO_1_7');

            // When clicking on it again
            await testUtils.expectClickSuccess('#piece_PLAYER_ZERO_1_7');

            // Then it should no longer be selected
            testUtils.expectElementNotToHaveClass('#piece_PLAYER_ZERO_1_7', 'selected-stroke');
        }));

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given a board with piece on, one of them selected
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, X2],
                [__, __, __, __, __, __, __, O2],
            ], 4);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click_7_0');

            // When clicking on it again
            await testUtils.expectClickFailure('#click_7_0');

            // Then it should no longer be marked as selected
            testUtils.expectElementNotToHaveClass('#click_7_0', 'selected-stroke');
        }));
    });

    describe('visuals', () => {

        it('should not let the user select a piece that is not available', fakeAsync(async() => {
            // Given a state where one piece is not available
            const state: DiamState = DiamState.ofRepresentation([
                [O1, X1, __, __, __, __, __, __],
                [O1, X1, __, __, __, __, __, __],
                [O1, X1, __, __, __, __, __, __],
                [O1, X1, __, __, __, __, __, __],
            ], 0);

            // When rendering the board
            await testUtils.setupState(state);

            // Then this piece should not rendered
            testUtils.expectElementNotToExist('#piece_PLAYER_ZERO_0');
        }));

        it('should display the right number of remainig pieces', fakeAsync(async() => {
            // Given a state
            const state: DiamState = DiamState.ofRepresentation([
                [__, X1, __, __, __, __, __, __],
                [O1, X1, __, __, __, __, __, __],
                [O1, X1, __, __, __, __, __, __],
                [O1, X1, __, __, __, __, X2, O2],
            ], 4);

            // When rendering the board
            await testUtils.setupState(state);

            // Then we should see the number of remaining pieces
            testUtils.expectElementToExist('#piece_PLAYER_ONE_1_2'); // X2 remains (third of them)
            testUtils.expectElementToExist('#piece_PLAYER_ONE_1_1'); // X2 remains (second of them)
            testUtils.expectElementToExist('#piece_PLAYER_ONE_1_0'); // X2 remains (first of them)
            testUtils.expectElementNotToExist('#piece_PLAYER_ONE_0_0'); // X1 does not

            testUtils.expectElementToExist('#piece_PLAYER_ZERO_1_3'); // O2 third piece
            testUtils.expectElementToExist('#piece_PLAYER_ZERO_1_2'); // O2 second piece
            testUtils.expectElementToExist('#piece_PLAYER_ZERO_1_1'); // O2 first piece
            testUtils.expectElementToExist('#piece_PLAYER_ZERO_0_0'); // O1 remains (one of them)
        }));

        it('should show winning configuration clearly', fakeAsync(async() => {
            // Given a winning state
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [O1, __, __, __, __, __, __, __],
                [O1, __, __, __, O1, __, __, X2],
                [O1, __, __, __, X1, __, __, O2],
            ], 4);

            // When rendering the board
            await testUtils.setupState(state);

            // Then only the winning pieces should be shown as victory
            testUtils.expectElementToHaveClass('#click_0_1', 'victory-stroke');
            testUtils.expectElementToHaveClass('#click_4_1', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_0_0', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_0_2', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_7_0', 'victory-stroke');
            testUtils.expectElementNotToHaveClass('#click_7_1', 'victory-stroke');
        }));

    });

});


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
    it('should allow simple drops by clicking the piece and then the target', fakeAsync(async() => {
        // given the initial state

        // when clicking on a piece and then on a space
        // then the move is made
        await testUtils.expectClickSuccess('#piece_0_1');
        const move: DiamMove = new DiamMoveDrop(2, DiamPiece.ZERO_SECOND);
        await testUtils.expectMoveSuccess('#click_2', move);
    }));
    it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
        // given the initial state
        // when clicking on a piece of the opponent
        // then the corresponding error is shown
        await testUtils.expectClickFailure('#piece_1_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should consider a piece in game click on an opponent piece as a space click if a piece is selected for better usability', fakeAsync(async() => {
        // given a state where there are already pieces in game
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
            [B1, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
        ], 0);
        testUtils.setupState(state);
        // when clicking on a remaining piece and then on a opponent piece in game
        await testUtils.expectClickSuccess('#piece_0_0');
        const move: DiamMove = new DiamMoveDrop(0, DiamPiece.ZERO_FIRST);
        // then the move is made to the corresponding space
        await testUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('should consider a piece in game click on a player piece as a regular piece click', fakeAsync(async() => {
        // given a state where there are already pieces in game and a remaining piece is selected
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
            [B1, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
        ], 0);
        testUtils.setupState(state);
        await testUtils.expectClickSuccess('#piece_0_0');
        // when clicking  on a player piece in game
        await testUtils.expectClickSuccess('#click_0_0');
        // then no move is made and the new piece is selected
        testUtils.expectElementToHaveClass('#click_0_0', 'selected');
    }));
    it('should forbid dropping on a full stack', fakeAsync(async() => {
        // given a state where one stack is already full
        const state: DiamState = DiamState.fromRepresentation([
            [B1, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
            [B1, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
        ], 0);
        testUtils.setupState(state);
        // when dropping a piece on the full stack
        await testUtils.expectClickSuccess('#piece_0_0');
        const move: DiamMove = new DiamMoveDrop(0, DiamPiece.ZERO_FIRST);
        // then the move is rejected
        const reason: string = DiamFailure.SPACE_IS_FULL();
        await testUtils.expectMoveFailure('#click_0', reason, move);
    }));
    it('should not let the user select a piece that is not available', fakeAsync(async() => {
        // given a state where one piece is not available
        const state: DiamState = DiamState.fromRepresentation([
            [A1, B1, __, __, __, __, __, __],
            [A1, B1, __, __, __, __, __, __],
            [A1, B1, __, __, __, __, __, __],
            [A1, B1, __, __, __, __, __, __],
        ], 0);
        // when rendering the state
        testUtils.setupState(state);
        // then it is impossible to select that piece
        testUtils.expectElementNotToExist('#piece_0_0');
    }));
    it('should allow shift by clicking the piece and then the target', fakeAsync(async() => {
        // given a state where a shift can be made
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [B1, __, __, __, __, __, __, B2],
            [A1, __, __, __, __, __, __, A2],
        ], 4);
        testUtils.setupState(state);
        // when clicking on A2 (in 7, 0) and then on the first column (0)
        await testUtils.expectClickSuccess('#click_7_0');
        const move: DiamMove = DiamMoveShift.fromRepresentation(new Coord(7, 3), 'clockwise');
        // then the move is legal
        await testUtils.expectMoveSuccess('#click_0', move);
    }));
    it('should allow shift from a piece in the middle of a stack', fakeAsync(async() => {
        // given a state where a shift can be made
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, B2],
            [B1, __, __, __, __, __, __, A2],
        ], 4);
        testUtils.setupState(state);
        // when clicking on A1 and then on the last column
        // then the move is legal
        await testUtils.expectClickSuccess('#click_0_1');
        const move: DiamMove = DiamMoveShift.fromRepresentation(new Coord(0, 2), 'counterclockwise');
        await testUtils.expectMoveSuccess('#click_7', move);
    }));
    it('should forbid shift of more than one space', fakeAsync(async() => {
        // given a state
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, B2],
            [__, __, __, __, __, __, __, A2],
        ], 4);
        testUtils.setupState(state);
        // when clicking on A2 and then somewhere else than the first line
        // then the move is not legal
        await testUtils.expectClickSuccess('#click_7_0');
        await testUtils.expectClickFailure('#click_2', DiamFailure.MUST_SHIFT_TO_NEIGHBOR());
    }));
    it('should forbid transferring from a piece not owned by the player', fakeAsync(async() => {
        // given a state
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, B2],
            [__, __, __, __, __, __, __, A2],
        ], 4);
        testUtils.setupState(state);
        // when clicking on B2
        // then this is not a legal selection for a shift
        await testUtils.expectClickFailure('#click_7_1', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should forbid transferring if the stack would become too high', fakeAsync(async() => {
        // given a state
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, B2],
            [A1, __, __, __, __, __, __, A2],
        ], 4);
        testUtils.setupState(state);
        // when clicking on B2
        await testUtils.expectClickSuccess('#click_7_0');
        const move: DiamMove = DiamMoveShift.fromRepresentation(new Coord(7, 3), 'clockwise');
        // then this is not a legal selection for a shift
        const reason: string = DiamFailure.TARGET_STACK_TOO_HIGH();
        await testUtils.expectMoveFailure('#click_0', reason, move);
    }));
    it('should forbid clicking on a space without selecting a piece first', fakeAsync(async() => {
        // given the initial state
        // when clicking any space
        // then it should let the user know that a piece must be selected first
        await testUtils.expectClickFailure('#click_0', DiamFailure.MUST_SELECT_PIECE_FIRST());
    }));
    it('should display the right number of remainig pieces', fakeAsync(async() => {
        // given a state
        const state: DiamState = DiamState.fromRepresentation([
            [__, B1, __, __, __, __, __, __],
            [A1, B1, __, __, __, __, __, __],
            [A1, B1, __, __, __, __, __, B2],
            [A1, B1, __, __, __, __, __, A2],
        ], 4);
        testUtils.setupState(state);
        // then we should see the number of remaining pieces
        testUtils.expectElementToExist('#piece_0_0'); // A1 remains
        testUtils.expectElementNotToExist('#piece_1_0'); // B1 does not
        testUtils.expectElementToExist('#piece_0_1'); // A2
        testUtils.expectElementToExist('#piece_1_1'); // B2
    }));
    it('should show winning configuration clearly', fakeAsync(async() => {
        // given a winning state
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [A1, __, __, __, __, __, __, __],
            [A1, __, __, __, A1, __, __, B2],
            [A1, __, __, __, B1, __, __, A2],
        ], 4);
        testUtils.setupState(state);
        // then only the winning pieces should be highlighted
        testUtils.expectElementToHaveClass('#click_0_1', 'victory-stroke');
        testUtils.expectElementToHaveClass('#click_4_1', 'victory-stroke');
        testUtils.expectElementNotToHaveClass('#click_0_0', 'victory-stroke');
        testUtils.expectElementNotToHaveClass('#click_0_2', 'victory-stroke');
        testUtils.expectElementNotToHaveClass('#click_7_0', 'victory-stroke');
        testUtils.expectElementNotToHaveClass('#click_7_1', 'victory-stroke');
    }));
});


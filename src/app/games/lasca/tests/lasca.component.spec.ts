/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LascaComponent } from '../lasca.component';
import { LascaFailure } from '../LascaFailure';
import { LascaMove } from '../LascaMove';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';
import { LascaRules } from '../LascaRules';

describe('LascaComponent', () => {

    const zero: LascaPiece = LascaPiece.ZERO;
    const one: LascaPiece = LascaPiece.ONE;

    const _u: LascaStack = new LascaStack([zero]);
    const _v: LascaStack = new LascaStack([one]);
    const uv: LascaStack = new LascaStack([zero, one]);
    const __: LascaStack = LascaStack.EMPTY;

    let testUtils: ComponentTestUtils<LascaComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LascaComponent>('Lasca');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('first click', () => {

        it('should highlight possible step-landing after selecting piece', fakeAsync(async() => {
            // Given any board where steps are possible (initial board)
            // When selecting a piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then its landing coord should be landable
            testUtils.expectElementToHaveClass('#square_3_3', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_5_3', 'selectable-fill');
        }));

        it('should highlight piece that can move this turn (when step moves)', () => {
            // Given a board where current player can move 4 pieces (for example, the starting board)
            // When displaying the board
            // Then those 3 coord should be "selectable-fill"
            testUtils.expectElementToHaveClass('#square_0_4', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_2_4', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_4_4', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_6_4', 'selectable-fill');
        });

        it('should highlight piece that can move this turn (when forced capture)', fakeAsync(async() => {
            // Given a board where current player have 3 "mobile" pieces but one must capture
            const state: LascaState = LascaState.of([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, _u, __, __, __, __, __],
                [_u, __, __, __, _u, __, _u],
                [__, _u, __, _u, __, _u, __],
                [_u, __, _u, __, _u, __, _u],
            ], 1);

            // When displaying the board
            await testUtils.setupState(state);

            // Then only the one that must capture must be "selectable-fill"
            testUtils.expectElementToHaveClass('#square_0_2', 'selectable-fill');
            testUtils.expectElementNotToHaveClass('#square_2_2', 'selectable-fill');
            testUtils.expectElementNotToHaveClass('#square_4_2', 'selectable-fill');
            testUtils.expectElementNotToHaveClass('#square_6_2', 'selectable-fill');
        }));

        it(`should forbid clicking on opponent's pieces`, fakeAsync(async() => {
            // Given any board
            // When clicking on the opponent's piece
            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            await testUtils.expectClickFailure('#coord_0_0', reason);
        }));

        it('should forbid clicking on empty square', fakeAsync(async() => {
            // Given any board
            // When clicking on an empty square
            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            await testUtils.expectClickFailure('#coord_1_0', reason);
        }));

        it('should forbid clicking on an unmovable stack', fakeAsync(async() => {
            // Given any board
            // When clicking a piece that could not move
            // Then it should fail
            await testUtils.expectClickFailure('#coord_5_5', LascaFailure.THIS_PIECE_CANNOT_MOVE());
        }));

        it('should show clicked stack as selected', fakeAsync(async() => {
            // Given any board
            // When clicking on one of your pieces
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then it should show the clicked piece as 'selected'
            testUtils.expectElementToHaveClass('#square_4_4_piece_0', 'selected-stroke');
        }));
    });

    describe('second click', () => {

        it('should fail when clicking on opponent', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When clicking on an opponent
            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            await testUtils.expectClickFailure('#coord_2_2', reason);
        }));

        it('should fail when doing impossible click', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When clicking on an empty square in (+2; +1) of selected piece
            // Then it should fail
            const reason: string = LascaFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL();
            await testUtils.expectClickFailure('#coord_6_5', reason);
        }));

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');
            testUtils.expectElementToHaveClass('#square_4_4_piece_0', 'selected-stroke');

            // When clicking on the selected piece again
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then the piece should no longer be selected
            testUtils.expectElementNotToHaveClass('#square_4_4_piece_0', 'selected-stroke');
        }));

        it('should show possible first-selection again when deselecting piece', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');
            testUtils.expectElementToHaveClass('#square_4_4_piece_0', 'selected-stroke');

            // When clicking on the selected piece again
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then the possible first choices should be shown again
            testUtils.expectElementToHaveClass('#square_0_4', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_2_4', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_4_4', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_6_4', 'selectable-fill');
        }));

        it('should change selected piece when clicking on another one of your pieces', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When clicking on another piece
            await testUtils.expectClickSuccess('#coord_2_4');

            // Then it should deselect the previous and select the new
            testUtils.expectElementNotToHaveClass('#square_4_4_piece_0', 'selected-stroke');
            testUtils.expectElementToHaveClass('#square_2_4_piece_0', 'selected-stroke');
        }));

        it('should allow simple step', fakeAsync(async() => {
            // Given any board on which a step could be done and with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When doing a step
            const move: LascaMove = LascaMove.fromStep(new Coord(4, 4), new Coord(3, 3)).get();

            // Then it should succeed
            await testUtils.expectMoveSuccess('#coord_3_3', move);
        }));

        it('should show left square after single step', fakeAsync(async() => {
            // Given any board on which a step could be done and with a selected piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // When doing simple step
            const move: LascaMove = LascaMove.fromStep(new Coord(4, 4), new Coord(3, 3)).get();
            await testUtils.expectMoveSuccess('#coord_3_3', move);

            // Then left square and landed square should be showed as moved
            testUtils.expectElementToHaveClass('#square_4_4', 'moved-fill');
            testUtils.expectElementToHaveClass('#square_3_3', 'moved-fill');
        }));

        it('should allow simple capture', fakeAsync(async() => {
            // Given a board with a selected piece and a possible capture
            const state: LascaState = LascaState.of([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, uv, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_2_2');

            // When doing a capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should be a success
            await testUtils.expectMoveSuccess('#coord_0_4', move);
        }));

        it(`should have an officer's symbol on the piece that just got promoted`, fakeAsync(async() => {
            // Given any board with a selected soldier about to become officer
            const state: LascaState = LascaState.of([
                [__, __, __, __, _v, __, _v],
                [__, uv, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_u, __, _u, __, _u, __, _u],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_1_1');

            // When doing the promoting-move
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 1), new Coord(0, 0)).get();
            await testUtils.expectMoveSuccess('#coord_0_0', move);

            // Then the officier-logo should be on the piece
            testUtils.expectElementToExist('#square_0_0_piece_1_officer_symbol');
        }));

        it('should highlight next possible capture and show the captured piece as captured already', fakeAsync(async() => {
            // Given any board with a selected piece that could do a multiple capture
            const state: LascaState = LascaState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, _u, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_2_2');

            // When doing the first capture
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then it should already be shown as captured, and the next possibles ones displayed
            testUtils.expectElementToHaveClass('#square_3_3', 'captured-fill');
        }));

        it('should cancel capturing a piece you cannot capture', fakeAsync(async() => {
            // Given a board on which an illegal capture could be made
            const state: LascaState = LascaState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, _v, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_2_2');

            // When doing that illegal capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should fail
            await testUtils.expectMoveFailure('#coord_0_4', RulesFailure.CANNOT_SELF_CAPTURE(), move);
        }));
    });

    describe('experience as second player (reversed board)', () => {

        it('should have first player on top', fakeAsync(async() => {
            // Given a board that has been reversed
            testUtils.getGameComponent().setPointOfView(Player.ONE);

            // When displaying it
            // We need to force the updateBoard to trigger the redrawing of the board
            await testUtils.getGameComponent().updateBoard(false);
            testUtils.detectChanges();

            // Then the square at (2, 2) should be coord (4, 4)
            testUtils.expectElementToExist('#square_at_2_2 #square_4_4');
            testUtils.expectElementNotToExist('#square_at_2_2 #square_2_2');
        }));

        it('should not duplicate highlight when doing incorrect second click', fakeAsync(async() => {
            // Given a board where you are player two and a moving piece has been selected
            await testUtils.expectClickSuccess('#coord_2_4');
            const move: LascaMove = LascaMove.fromStep(new Coord(2, 4), new Coord(1, 3)).get();
            await testUtils.expectMoveSuccess('#coord_1_3', move); // First move is set
            await testUtils.getWrapper().setRole(Player.ONE); // changing role
            await testUtils.expectClickSuccess('#coord_0_2'); // Making the first click

            // When clicking on an invalid landing piece
            await testUtils.expectClickFailure('#coord_0_1', LascaFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());

            // Then the highlight should be at the expected place only, not at their symmetric point
            testUtils.expectElementToHaveClass('#square_0_2', 'selectable-fill');
            testUtils.expectElementNotToHaveClass('#square_6_4', 'selectable-fill');
        }));

        it('should show lastMove reversed', fakeAsync(async() => {
            // Given a board shown from Player.ONE's point of view
            await testUtils.expectClickSuccess('#coord_4_4');
            const move: LascaMove = LascaMove.fromStep(new Coord(4, 4), new Coord(3, 3)).get();
            await testUtils.expectMoveSuccess('#coord_3_3', move);
            await testUtils.getWrapper().setRole(Player.ONE);

            // When clicking on one of your piece
            await testUtils.expectClickSuccess('#coord_2_2');

            // Then the last move should be shown at the expected place
            testUtils.expectElementToHaveClass('#square_at_4_4 #square_2_2', 'moved-fill');
        }));
    });

    describe('multiple capture', () => {

        it('should perform capture when no more piece can be captured', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            const state: LascaState = LascaState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, _u, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord_2_2');
            await testUtils.expectClickSuccess('#coord_4_4');

            // When doing the last capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]).get();

            // Then the move should be finalized
            await testUtils.expectMoveSuccess('#coord_6_6', move);
            // Then a stack of three piece should exist
            testUtils.expectElementToExist('#square_6_6_piece_0');
            testUtils.expectElementToExist('#square_6_6_piece_1');
            testUtils.expectElementToExist('#square_6_6_piece_2');
        }));
    });

    describe('interactivity', () => {

        it('should show possible selections when interactive', fakeAsync(async() => {
            // Given a state
            // When it is interactive
            testUtils.getGameComponent().setInteractive(true);
            // Then it should show possible selections
            testUtils.expectElementToExist('.selectable-fill');
        }));

        it('should not show possible selections for opponent', fakeAsync(async() => {
            // Given a state
            // When it is not interactive
            testUtils.getGameComponent().setInteractive(false);
            await testUtils.setupState(LascaRules.get().getInitialState());
            // Then it should not show possible selections
            testUtils.expectElementNotToExist('.selectable-fill');
        }));

    });

});

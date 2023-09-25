/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LascaComponent } from '../lasca.component';
import { LascaFailure } from '../LascaFailure';
import { LascaMove } from '../LascaMove';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';

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
            // Given any board where step are possible (initial board)
            // When selecting a piece
            await testUtils.expectClickSuccess('#coord_4_4');

            // Then its landing coord should be landable
            testUtils.expectElementToHaveClass('#square_3_3', 'selectable-fill');
            testUtils.expectElementToHaveClass('#square_5_3', 'selectable-fill');
        }));
        it('should highlight piece that can move this turn (when step moves)', () => {
            // Given a board where current player can move 4 pieces (by example, the starting board)
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
            const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
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
            const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
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
        it('should show lastMove reversed', fakeAsync(async() => {
            // Given a board on which it's player.one's turn
            await testUtils.expectClickSuccess('#coord_4_4');
            const move: LascaMove = LascaMove.fromStep(new Coord(4, 4), new Coord(3, 3)).get();
            await testUtils.expectMoveSuccess('#coord_3_3', move);
            await testUtils.getWrapper().setRole(PlayerOrNone.ONE);

            // When clicking on one of your piece
            // Then the board should be reversed
            await testUtils.expectClickSuccessWithAsymmetricNaming('#coord_4_4', '#coord_2_2');
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
    describe('displaying reversed board', () => {
        it('should have first player on top in a reversed board', fakeAsync(async() => {
            // Given a board that been reversed
            await testUtils.getWrapper().setRole(Player.ONE);

            // When clicking on (2, 2)
            // Then it should have selected square (4, 4)
            await testUtils.expectClickSuccessWithAsymmetricNaming('#coord_2_2', '#coord_4_4');
        }));
        it('should not duplicate highlight when doing incorrect second click', fakeAsync(async() => {
            // Given a board where you are player two and a moving piece has been selected
            await testUtils.expectClickSuccess('#coord_2_4');
            const move: LascaMove = LascaMove.fromStep(new Coord(2, 4), new Coord(1, 3)).get();
            await testUtils.expectMoveSuccess('#coord_1_3', move); // First move is set
            await testUtils.getWrapper().setRole(Player.ONE); // changing role
            await testUtils.expectClickSuccessWithAsymmetricNaming('#coord_6_4', '#coord_0_2'); // Making the first click

            // When clicking on a invalid landing piece
            await testUtils.expectClickFailureWithAsymmetricNaming('#coord_6_5', '#coord_0_1', LascaFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());

            // Then the highlight should be at the good place only, not at their symmetric point
            testUtils.expectElementToHaveClass('#square_6_4', 'selectable-fill');
            testUtils.expectElementNotToHaveClass('#square_0_2', 'selectable-fill');
        }));
    });
});

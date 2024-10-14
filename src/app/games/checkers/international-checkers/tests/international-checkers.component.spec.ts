/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { MGPOptional } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { InternationalCheckersComponent } from '../international-checkers.component';
import { CheckersFailure } from '../../common/CheckersFailure';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from '../../common/CheckersState';
import { CheckersConfig } from '../../common/AbstractCheckersRules';
import { InternationalCheckersRules } from '../InternationalCheckersRules';

fdescribe('InternationalCheckersComponent', () => {

    const zero: CheckersPiece = CheckersPiece.ZERO;
    const one: CheckersPiece = CheckersPiece.ONE;

    const u: CheckersStack = new CheckersStack([zero]);
    const v: CheckersStack = new CheckersStack([one]);
    const uv: CheckersStack = new CheckersStack([zero, one]);
    const _: CheckersStack = CheckersStack.EMPTY;
    const defaultConfig: MGPOptional<CheckersConfig> = InternationalCheckersRules.get().getDefaultRulesConfig();

    let testUtils: ComponentTestUtils<InternationalCheckersComponent>;
// TODO: not show stack of piece when not stacking !!
// TODO: not show small capture highlight
// TODO: put components in common haha
    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<InternationalCheckersComponent>('InternationalCheckers');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('first click', () => {

        it('should highlight possible step-landing after selecting piece', fakeAsync(async() => {
            // Given any board where steps are possible (initial board)
            // When selecting a piece
            await testUtils.expectClickSuccess('#coord-6-6');

            // Then its landing coord should be landable
            testUtils.expectElementToHaveClass('#clickable-highlight-5-5', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-7-5', 'clickable-stroke');
        }));

        it('should highlight piece that can move this turn (when forced capture)', fakeAsync(async() => {
            // Given a board where current player have 3 "mobile" pieces but one must capture
            const state: CheckersState = CheckersState.of([
                [v, _, v, _, v, _, v],
                [_, v, _, v, _, v, _],
                [v, _, v, _, v, _, v],
                [_, u, _, _, _, _, _],
                [u, _, _, _, u, _, u],
                [_, u, _, u, _, u, _],
                [u, _, u, _, u, _, u],
            ], 1);

            // When displaying the board
            await testUtils.setupState(state);

            // Then only the one that must capture must be "clickable-stroke"
            testUtils.expectElementToHaveClass('#clickable-highlight-0-2', 'clickable-stroke');
            testUtils.expectElementNotToExist('#clickable-highlight-2-2');
            testUtils.expectElementNotToExist('#clickable-highlight-4-2');
            testUtils.expectElementNotToExist('#clickable-highlight-6-2');
        }));

        it(`should forbid clicking on opponent's pieces`, fakeAsync(async() => {
            // Given any board
            // When clicking on the opponent's piece
            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            await testUtils.expectClickFailure('#coord-0-0', reason);
        }));

        it('should forbid clicking on empty square', fakeAsync(async() => {
            // Given any board
            // When clicking on an empty square
            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            await testUtils.expectClickFailure('#coord-1-0', reason);
        }));

        it('should forbid clicking on an unmovable piece', fakeAsync(async() => {
            // Given any board
            // When clicking a piece that could not move
            // Then it should fail
            await testUtils.expectClickFailure('#coord-9-9', CheckersFailure.THIS_PIECE_CANNOT_MOVE());
        }));

        it('should show clicked stack as selected', fakeAsync(async() => {
            // Given any board
            // When clicking on one of your pieces
            await testUtils.expectClickSuccess('#coord-6-6');

            // Then it should show the clicked piece as 'selected'
            testUtils.expectElementToHaveClass('#square-6-6-piece-0', 'selected-stroke');
        }));

        it('should hide last move when selecting stack', fakeAsync(async() => {
            // Given a board with a last move
            const previousState: CheckersState = InternationalCheckersRules.get().getInitialState(defaultConfig);
            const previousMove: CheckersMove = CheckersMove.fromStep(new Coord(2, 4), new Coord(3, 3));
            const state: CheckersState = CheckersState.of([
                [v, _, v, _, v, _, v],
                [_, v, _, v, _, v, _],
                [v, _, v, _, v, _, v],
                [_, _, _, u, _, _, _],
                [u, _, _, _, u, _, u],
                [_, u, _, u, _, u, _],
                [u, _, u, _, u, _, u],
            ], 1);
            await testUtils.setupState(state, { previousState, previousMove });

            // When selecting stack
            await testUtils.expectClickSuccess('#coord-4-2');

            // Then start and end coord of last move should not be highlighted
            testUtils.expectElementNotToHaveClass('#square-2-4', 'moved-fill');
            testUtils.expectElementNotToHaveClass('#square-3-3', 'moved-fill');
        }));

    });

    describe('second click', () => {

        it('should fail when clicking on opponent', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord-6-6');

            // When clicking on an opponent
            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            await testUtils.expectClickFailure('#coord-3-3', reason);
        }));

        it('should fail when doing impossible click', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord-4-6');

            // When clicking on an empty square in (+2; +1) of selected piece
            // Then it should fail
            const reason: string = CheckersFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL();
            await testUtils.expectClickFailure('#coord-6-7', reason);
        }));

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord-4-6');
            testUtils.expectElementToHaveClass('#square-4-6-piece-0', 'selected-stroke');

            // When clicking on the selected piece again
            await testUtils.expectClickFailure('#coord-4-6');

            // Then the piece should no longer be selected
            testUtils.expectElementNotToHaveClass('#square-4-6-piece-0', 'selected-stroke');
        }));

        it('should show possible first-selection again when deselecting piece', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord-4-6');
            testUtils.expectElementToHaveClass('#square-4-6-piece-0', 'selected-stroke');

            // When clicking on the selected piece again
            await testUtils.expectClickFailure('#coord-4-6');

            // Then the possible first choices should be shown again
            testUtils.expectElementToHaveClass('#clickable-highlight-0-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-2-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-4-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-6-6', 'clickable-stroke');
        }));

        it('should change selected piece when clicking on another one of your pieces', fakeAsync(async() => {
            // Given any board with a selected piece
            await testUtils.expectClickSuccess('#coord-4-6');

            // When clicking on another piece
            await testUtils.expectClickSuccess('#coord-2-6');

            // Then it should deselect the previous and select the new
            testUtils.expectElementNotToHaveClass('#square-4-6-piece-0', 'selected-stroke');
            testUtils.expectElementToHaveClass('#square-2-6-piece-0', 'selected-stroke');
        }));

        it('should allow simple step', fakeAsync(async() => {
            // Given any board on which a step could be done and with a selected piece
            await testUtils.expectClickSuccess('#coord-4-6');

            // When doing a step
            const move: CheckersMove = CheckersMove.fromStep(new Coord(4, 6), new Coord(3, 5));

            // Then it should succeed
            await testUtils.expectMoveSuccess('#coord-3-5', move);
        }));

        it('should show left square after single step', fakeAsync(async() => {
            // Given any board on which a step could be done and with a selected piece
            await testUtils.expectClickSuccess('#coord-4-6');

            // When doing simple step
            const move: CheckersMove = CheckersMove.fromStep(new Coord(4, 6), new Coord(3, 5));
            await testUtils.expectMoveSuccess('#coord-3-5', move);

            // Then left square and landed square should be showed as moved
            testUtils.expectElementToHaveClass('#square-4-6', 'moved-fill');
            testUtils.expectElementToHaveClass('#square-3-5', 'moved-fill');
        }));

        it('should allow simple capture', fakeAsync(async() => {
            // Given a board with a selected piece and a possible capture
            const state: CheckersState = CheckersState.of([
                [v, _, v, _, v, _, v],
                [_, v, _, v, _, v, _],
                [v, _, v, _, v, _, v],
                [_, uv, _, _, _, _, _],
                [_, _, u, _, u, _, u],
                [_, _, _, u, _, u, _],
                [u, _, _, _, u, _, u],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-2');

            // When doing a capture
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should be a success
            await testUtils.expectMoveSuccess('#coord-0-4', move);
        }));

        it(`should have an officer's symbol on the piece that just got promoted`, fakeAsync(async() => {
            // Given any board with a selected soldier about to become officer
            const state: CheckersState = CheckersState.of([
                [_, _, _, _, v, _, v],
                [_, uv, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [u, _, u, _, u, _, u],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-1-1');

            // When doing the promoting-move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 1), new Coord(0, 0));
            await testUtils.expectMoveSuccess('#coord-0-0', move);

            // Then the officier-logo should be on the piece
            testUtils.expectElementToExist('#square-0-0-piece-1-officer-symbol');
        }));

        it('should highlight next possible capture and show the captured piece as captured already', fakeAsync(async() => {
            // Given any board with a selected piece that could do a multiple capture
            const state: CheckersState = CheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, v, _, _, _, _],
                [_, u, _, u, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, u, _],
                [_, _, _, _, _, _, _],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-2');

            // When doing the first capture
            await testUtils.expectClickSuccess('#coord-4-4');

            // Then it should already be shown as captured, and the next possibles ones displayed
            testUtils.expectElementToHaveClass('#square-3-3', 'captured-fill');
        }));

        it('should cancel capturing a piece you cannot capture', fakeAsync(async() => {
            // Given a board on which an illegal capture could be made
            const state: CheckersState = CheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, v, _, _, _, _],
                [_, v, _, u, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, u, _],
                [_, _, _, _, _, _, _],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-2');

            // When doing that illegal capture
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then the move should be illegal
            await testUtils.expectMoveFailure('#coord-0-4', RulesFailure.CANNOT_SELF_CAPTURE(), move);
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

            // Then the square at (0, 0) should be coord (9, 9) and the opposite too
            testUtils.expectTranslationYToBe('#coord-0-0', 900);
            testUtils.expectTranslationYToBe('#coord-9-9', 0);
        }));
// TODO "look at the green indicator to help you" well not correct message anymore
        it('should not duplicate highlight when doing incorrect second click', fakeAsync(async() => {
            // Given a board where you are player two and a moving piece has been selected
            await testUtils.expectClickSuccess('#coord-2-6');
            const move: CheckersMove = CheckersMove.fromStep(new Coord(2, 6), new Coord(1, 5));
            await testUtils.expectMoveSuccess('#coord-1-5', move); // First move is set
            await testUtils.getWrapper().setRole(Player.ONE); // changing role
            await testUtils.expectClickSuccess('#coord-1-3'); // Making the first click

            // When clicking on an invalid landing piece
            await testUtils.expectClickFailure('#coord-2-5', CheckersFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());

            // Then the highlight should be at the expected place only, not at their symmetric point
            testUtils.expectElementToHaveClass('#clickable-highlight-1-3', 'clickable-stroke');
            testUtils.expectElementNotToExist('#clickable-highlight-8-6');
        }));

        it('should show last move reversed', fakeAsync(async() => {
            // Given a board with a last move
            await testUtils.expectClickSuccess('#coord-6-6');
            const move: CheckersMove = CheckersMove.fromStep(new Coord(6, 6), new Coord(5, 5));
            await testUtils.expectMoveSuccess('#coord-5-5', move);

            // When reversing the board view
            await testUtils.getWrapper().setRole(Player.ONE);

            // Then the last move should be shown at the expected place
            testUtils.expectTranslationYToBe('#coord-6-6', 300);
        }));

    });

    describe('multiple capture', () => {

        it('should perform capture when no more piece can be captured', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            const state: CheckersState = CheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, v, _, _, _, _, _, _, _],
                [_, u, _, u, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, u, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-2');
            await testUtils.expectClickSuccess('#coord-4-4');

            // When doing the last capture
            const captures: Coord[] = [new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)];
            const move: CheckersMove = CheckersMove.fromCapture(captures).get();

            // Then the move should be finalized
            await testUtils.expectMoveSuccess('#coord-6-6', move);
            // Then the stack of captured pieces should not exist
            testUtils.expectElementToExist('#square-6-6-piece-0');
            testUtils.expectElementNotToExist('#square-6-6-piece-1');
        }));

    });

    describe('interactivity', () => {

        it('should show possible selections when interactive', fakeAsync(async() => {
            // Given a state
            // When it is interactive
            testUtils.getGameComponent().setInteractive(true);
            // Then it should show possible selections
            testUtils.expectElementToHaveClass('#clickable-highlight-0-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-2-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-4-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-6-6', 'clickable-stroke');
        }));

        it('should not show possible selections for opponent', fakeAsync(async() => {
            // Given a state
            const state: CheckersState = InternationalCheckersRules.get().getInitialState(defaultConfig);

            // When it is not interactive
            testUtils.getGameComponent().setInteractive(false);
            await testUtils.setupState(state);

            // Then it should not show possible selections
            testUtils.expectElementNotToExist('.clickable-stroke');
        }));

    });

});

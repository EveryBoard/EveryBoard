/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RectanglzComponent } from '../rectanglz.component';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RectanglzState } from '../RectanglzState';
import { RectanglzRules } from '../RectanglzRules';
import { RectanglzMove } from '../RectanglzMove';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';

fdescribe('RectanglzComponent', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let testUtils: ComponentTestUtils<RectanglzComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<RectanglzComponent>('Rectanglz');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('first click', () => {

        it('should select piece when clicking on it', fakeAsync(async() => {
            // Given any state
            // When clicking on one of your piece
            await testUtils.expectClickSuccess('#click_0_0');

            // Then it should have selected the piece
            testUtils.expectElementToHaveClass('#piece_0_0', 'selected-stroke');
        }));

        it('should toast when selecting opponent piece', fakeAsync( async() => {
            // Given any state
            // When clicking on an opponent piece
            // Then the move should be illegal
            const opponentPiece: string = '#click_7_0';
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            await testUtils.expectClickFailure(opponentPiece, reason);
        }));

        it('should toast when selecting empty space piece', fakeAsync( async() => {
            // Given any state
            // When clicking on an empty space
            // Then it should be a failure
            await testUtils.expectClickFailure('#click_2_2', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }));

        it('should hide previous move', fakeAsync(async() => {
            // Given a board with a previous move
            const state: RectanglzState = new RectanglzState([
                [O, _, _, _, _, _, _, X],
                [_, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, O],
            ], 1);
            const previousState: RectanglzState = RectanglzRules.get().getInitialState();
            const previousMove: RectanglzMove = RectanglzMove.from(new Coord(0, 0), new Coord(1, 1)).get();
            await testUtils.setupState(state, { previousMove, previousState });
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#space_0_0', ['base']);
            testUtils.expectElementToHaveClasses('#piece_1_1', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#space_1_1', ['base', 'moved-fill']);
        }));

        it('should display valid landing spaces', fakeAsync(async() => {

        }));

    });

    describe('second click', () => {

        it('should apply move when selecting correct landing', fakeAsync(async() => {
            // Given a board with a selected piece
            await testUtils.expectClickSuccess('#click_0_0');

            // When clicking on valid landing space
            const move: RectanglzMove = RectanglzMove.from(new Coord(0, 0), new Coord(1, 1)).get();
            await testUtils.expectMoveSuccess('#click_1_1', move);

            // Then both piece should be displayed as last-move
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#piece_1_1', ['base', 'player0-fill', 'last-move-stroke']);
            // But only created space should be displayed as last-move
            testUtils.expectElementToHaveClasses('#space_0_0', ['base']);
            testUtils.expectElementToHaveClasses('#space_1_1', ['base', 'moved-fill']);
        }));

        it('should cancel move attempt when clicking on invalid landing');
        it('should change selected piece when clicking on another of your piece');

        it('should cancel move without throwing when clicking on piece again', fakeAsync(async() => {
            // Given the initial board with one selected piece
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'selected-stroke']);

            // When clicking that piece again
            await testUtils.expectClickSuccess('#click_0_0');

            // Then the piece should no longer be selected
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill']);
        }));

    });

});

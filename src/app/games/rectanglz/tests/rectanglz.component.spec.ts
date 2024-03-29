/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RectanglzComponent } from '../rectanglz.component';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RectanglzState } from '../RectanglzState';
import { RectanglzConfig, RectanglzRules } from '../RectanglzRules';
import { RectanglzMove } from '../RectanglzMove';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RectanglzFailure } from '../RectanglzFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('RectanglzComponent', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;
    const defaultConfig: MGPOptional<RectanglzConfig> = RectanglzRules.get().getDefaultRulesConfig();

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
            const previousState: RectanglzState = RectanglzRules.get().getInitialState(defaultConfig);
            const previousMove: RectanglzMove = RectanglzMove.from(new Coord(0, 0), new Coord(1, 1)).get();
            await testUtils.setupState(state, { previousMove, previousState });
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#space_0_0', ['base']);
            testUtils.expectElementToHaveClasses('#piece_1_1', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#space_1_1', ['base', 'moved-fill']);

            // When doing that first click
            await testUtils.expectClickSuccess('#click_0_7');

            // Then the last move should be hidden
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#space_0_0', ['base']);
            testUtils.expectElementToHaveClasses('#piece_1_1', ['base', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#space_1_1', ['base']);
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

        it('should cancel move attempt when clicking on invalid landing', fakeAsync(async() => {
            // Given a board with a selected piece
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'selected-stroke']);

            // When licking on invalid landing space
            await testUtils.expectClickFailure('#click_5_5', RectanglzFailure.MAX_DISTANCE_IS_(2));

            // Then the piece should no longer be selected
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill']);
        }));

        it('should change selected piece when clicking on another of your piece', fakeAsync(async() => {
            // Given a board with a selected piece
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToHaveClass('#piece_0_0', 'selected-stroke');

            // When clicking on another piece
            await testUtils.expectClickSuccess('#click_7_7');

            // Then new clicked piece should be highlighted, not the previous
            testUtils.expectElementNotToHaveClass('#piece_0_0', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_7_7', 'selected-stroke');
        }));

        it('should cancel move without throwing when clicking on piece again', fakeAsync(async() => {
            // Given the initial board with one selected piece
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'selected-stroke']);

            // When clicking that piece again
            await testUtils.expectClickSuccess('#click_0_0');

            // Then the piece should no longer be selected
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill']);
        }));

        it('should show captured piece after move', fakeAsync(async() => {
            // Given a board with a selected piece
            const state: RectanglzState = new RectanglzState([
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O],
            ], 2);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click_0_2');

            // When clicking on valid landing space
            const move: RectanglzMove = RectanglzMove.from(new Coord(0, 2), new Coord(0, 4)).get();
            await testUtils.expectMoveSuccess('#click_0_4', move);

            // Then captured piece should be displayed
            testUtils.expectElementToHaveClasses('#space_0_4', ['base', 'moved-fill']);
            testUtils.expectElementToHaveClasses('#space_0_5', ['base', 'captured-fill']);
        }));

        it('should should show left square when doing a jump', fakeAsync(async() => {
            // Given a board with a selected piece
            await testUtils.expectClickSuccess('#click_0_0');

            // When clicking on valid landing space
            const move: RectanglzMove = RectanglzMove.from(new Coord(0, 0), new Coord(2, 2)).get();
            await testUtils.expectMoveSuccess('#click_2_2', move);

            // Then both piece should be displayed as last-move
            testUtils.expectElementNotToExist('#piece_0_0');
            testUtils.expectElementToHaveClasses('#piece_2_2', ['base', 'player0-fill', 'last-move-stroke']);
            // But only created space should be displayed as last-move
            testUtils.expectElementToHaveClasses('#space_0_0', ['base', 'moved-fill']);
            testUtils.expectElementToHaveClasses('#space_2_2', ['base', 'moved-fill']);
        }));

    });

});

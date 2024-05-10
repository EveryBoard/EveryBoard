/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { SquarzComponent } from '../squarz.component';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { SquarzState } from '../SquarzState';
import { SquarzConfig, SquarzRules } from '../SquarzRules';
import { SquarzMove } from '../SquarzMove';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { SquarzFailure } from '../SquarzFailure';
import { MGPOptional } from '@everyboard/lib';

describe('SquarzComponent', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;
    const defaultConfig: MGPOptional<SquarzConfig> = SquarzRules.get().getDefaultRulesConfig();

    let testUtils: ComponentTestUtils<SquarzComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<SquarzComponent>('Squarz');
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
            // Then it should fail
            const opponentPiece: string = '#click_7_0';
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            await testUtils.expectClickFailure(opponentPiece, reason);
        }));

        it('should toast when selecting empty space piece', fakeAsync( async() => {
            // Given any state
            // When clicking on an empty space
            // Then it should fail
            await testUtils.expectClickFailure('#click_2_2', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }));

        it('should hide previous move', fakeAsync(async() => {
            // Given a board with a previous move
            const state: SquarzState = new SquarzState([
                [O, _, _, _, _, _, _, X],
                [_, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, O],
            ], 1);
            const previousState: SquarzState = SquarzRules.get().getInitialState(defaultConfig);
            const previousMove: SquarzMove = SquarzMove.from(new Coord(0, 0), new Coord(1, 1)).get();
            await testUtils.setupState(state, { previousMove, previousState });
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#space_0_0', ['base']);
            testUtils.expectElementToHaveClasses('#piece_1_1', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#space_1_1', ['base', 'moved-fill']);

            // When doing a first click
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
            const move: SquarzMove = SquarzMove.from(new Coord(0, 0), new Coord(1, 1)).get();
            await testUtils.expectMoveSuccess('#click_1_1', move);

            // Then both pieces should be displayed as last-move-stroke
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#piece_1_1', ['base', 'player0-fill', 'last-move-stroke']);
            // But only created the space should be displayed as moved-fill
            testUtils.expectElementToHaveClasses('#space_0_0', ['base']);
            testUtils.expectElementToHaveClasses('#space_1_1', ['base', 'moved-fill']);
        }));

        it('should cancel move attempt when clicking on invalid landing', fakeAsync(async() => {
            // Given a board with a selected piece
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'selected-stroke']);

            // When clicking on an invalid landing space
            const move: SquarzMove = SquarzMove.from(new Coord(0, 0), new Coord(5, 5)).get();
            await testUtils.expectMoveFailure('#click_5_5', SquarzFailure.MAX_DISTANCE_IS_N(2), move);

            // Then the piece should not be highlighted
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill']);
        }));

        it('should change selected piece when clicking on another of your piece', fakeAsync(async() => {
            // Given a board with a selected piece
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToHaveClass('#piece_0_0', 'selected-stroke');

            // When clicking on another piece
            await testUtils.expectClickSuccess('#click_7_7');

            // Then newly selected piece should be highlighted, not the previous one
            testUtils.expectElementNotToHaveClass('#piece_0_0', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_7_7', 'selected-stroke');
        }));

        it('should cancel move without throwing when clicking on piece again', fakeAsync(async() => {
            // Given the initial board with one selected piece
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill', 'selected-stroke']);

            // When clicking that piece again
            await testUtils.expectClickSuccess('#click_0_0');

            // Then the piece should not be highlighted
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player0-fill']);
        }));

        it('should show captured piece after move', fakeAsync(async() => {
            // Given a board with a selected piece
            const state: SquarzState = new SquarzState([
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

            // When clicking on a valid landing space
            const move: SquarzMove = SquarzMove.from(new Coord(0, 2), new Coord(0, 4)).get();
            await testUtils.expectMoveSuccess('#click_0_4', move);

            // Then the captured piece should be displayed
            testUtils.expectElementToHaveClasses('#space_0_4', ['base', 'moved-fill']);
            testUtils.expectElementToHaveClasses('#space_0_5', ['base', 'captured-fill']);
        }));

        it('should should show left square when doing a jump', fakeAsync(async() => {
            // Given a board with a selected piece
            await testUtils.expectClickSuccess('#click_0_0');

            // When clicking on a valid landing space
            const move: SquarzMove = SquarzMove.from(new Coord(0, 0), new Coord(2, 2)).get();
            await testUtils.expectMoveSuccess('#click_2_2', move);

            // Then both spaces should be displayed as last-moved-fill
            testUtils.expectElementToHaveClasses('#space_0_0', ['base', 'moved-fill']);
            testUtils.expectElementToHaveClasses('#space_2_2', ['base', 'moved-fill']);
            // But only the landing piece should exist (as last-move-stroke)
            testUtils.expectElementNotToExist('#piece_0_0');
            testUtils.expectElementToHaveClasses('#piece_2_2', ['base', 'player0-fill', 'last-move-stroke']);
        }));

    });

});

/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { Coord } from '../../../jscaip/Coord';
import { DirectionFailure } from '../../../jscaip/Direction';
import { PlayerOrNone } from '../../../jscaip/Player';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { Table } from '../../../jscaip/TableUtils';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { LinesOfActionFailure } from '../LinesOfActionFailure';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';
import { LinesOfActionComponent } from '../lines-of-action.component';

describe('LinesOfActionComponent', () => {

    let testUtils: ComponentTestUtils<LinesOfActionComponent>;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LinesOfActionComponent>('LinesOfAction');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('First click', () => {

        it('should forbid selecting a piece that has no valid targets', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [X, O, O, O, O, O, O, _],
                [O, O, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [_, O, _, O, O, O, O, _],
            ];
            const state: LinesOfActionState = new LinesOfActionState(board, 1);
            await testUtils.setupState(state);

            await testUtils.expectClickFailure('#click-0-0', LinesOfActionFailure.PIECE_CANNOT_MOVE());
        }));

        it('should forbid selecting an empty piece', fakeAsync(async() => {
            await testUtils.expectClickFailure('#click-2-2', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }));

        it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
            await testUtils.expectClickFailure('#click-0-2', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }));

        it('should show selected piece', fakeAsync(async() => {
            // Given any board
            // When clicking on a piece of the user
            await testUtils.expectClickSuccess('#click-2-0');

            // Then the piece should be shown as selected
            testUtils.expectElementToHaveClass('#piece-2-0', 'selected-stroke');
        }));

    });

    describe('Second click', () => {

        it('should allow a simple move', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click-2-0');
            const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 0), new Coord(2, 2)).get();
            await testUtils.expectMoveSuccess('#click-2-2', move);
        }));

        it('should forbid moving in an invalid direction', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click-2-0');
            await testUtils.expectClickFailure('#click-4-5', DirectionFailure.DIRECTION_MUST_BE_LINEAR());
        }));

        it('should show last move spaces', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click-2-0');
            const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 0), new Coord(2, 2)).get();
            await testUtils.expectMoveSuccess('#click-2-2', move);

            const component: LinesOfActionComponent = testUtils.getGameComponent();
            expect(component.getSquareClasses(2, 2)).toEqual(['moved-fill']);
            expect(component.getSquareClasses(2, 0)).toEqual(['moved-fill']);
        }));

        it('should show captures', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [X, O, O, O, O, O, O, O],
                [_, _, _, _, _, _, _, X],
                [_, _, X, _, _, _, _, _],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [X, _, _, _, _, _, _, X],
                [_, O, _, O, O, O, O, _],
            ];
            const state: LinesOfActionState = new LinesOfActionState(board, 0);
            await testUtils.setupState(state);

            await testUtils.expectClickSuccess('#click-2-0');
            const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 0), new Coord(2, 2)).get();
            await testUtils.expectMoveSuccess('#click-2-2', move);

            const component: LinesOfActionComponent = testUtils.getGameComponent();
            expect(component.getSquareClasses(2, 2)).toEqual(['captured-fill']);
        }));

        it('should change selected piece when clicking another piece', fakeAsync(async() => {
            // Given a board on which you have a selected piece
            await testUtils.expectClickSuccess('#click-2-0');

            // When clicking on another one
            await testUtils.expectClickSuccess('#click-3-0');

            // Then the secondly clicked coord should be selected
            testUtils.expectElementToHaveClass('#piece-3-0', 'selected-stroke');
            // And the previous one no longer
            testUtils.expectElementNotToHaveClass('#piece-2-0', 'selected-stroke');
        }));

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given any board with a piece selected
            await testUtils.expectClickSuccess('#click-2-0');

            // When clicking on that piece again
            await testUtils.expectClickFailure('#click-2-0');

            // Then it should no longer be selected
            testUtils.expectElementNotToHaveClass('#piece-2-0', 'selected-stroke');
        }));

    });

    it('should hide first move when taking back', fakeAsync(async() => {
        // Given a state with a first move done
        const board: Table<PlayerOrNone> = [
            [_, O, _, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, O, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 1);
        const previousMove: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 0), new Coord(2, 2)).get();
        const previousState: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        await testUtils.setupState(state, { previousState, previousMove });

        // When taking it back
        await testUtils.expectInterfaceClickSuccess('#take-back');

        // Then no highlight should be found
        testUtils.expectElementNotToHaveClass('#space-2-0', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#space-2-2', 'moved-fill');
    }));
});

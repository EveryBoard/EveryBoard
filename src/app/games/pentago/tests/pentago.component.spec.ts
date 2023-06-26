/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PentagoComponent } from '../pentago.component';
import { PentagoMove } from '../PentagoMove';
import { PentagoState } from '../PentagoState';

describe('PentagoComponent', () => {

    let testUtils: ComponentTestUtils<PentagoComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<PentagoComponent>('Pentago');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    describe('first click', () => {
        it('should do move in one click when click make all block are neutral', fakeAsync(async() => {
            const move: PentagoMove = PentagoMove.rotationless(1, 1);
            await testUtils.expectMoveSuccess('#click_1_1', move);
        }));
        it('should not display arrows on neutral blocks and display dropped piece meanwhile', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [_, _, X, _, _, _],
                [_, O, _, _, _, _],
                [X, _, X, _, _, _],
                [_, _, _, _, O, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
            ];
            const state: PentagoState = new PentagoState(board, 5);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementNotToExist('#rotate_0_clockwise');
        }));
        it('should not accept click on pieces', fakeAsync(async() => {
            // Given an initial state with a piece on it
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
            ];
            const state: PentagoState = new PentagoState(board, 5);

            // When rendering the board
            await testUtils.setupState(state);

            // Then there should not be clickable thing there
            await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }));
        it('should hide last rotation when starting the move', fakeAsync(async() => {
            // Given a board with a last move with rotation
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, O],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
            ];
            const state: PentagoState = new PentagoState(board, 1);
            const lastMove: PentagoMove = PentagoMove.withRotation(5, 5, 3, false);
            await testUtils.setupState(state, PentagoState.getInitialState(), lastMove);
            testUtils.expectElementToHaveClass('#last_rotation_3_counterclockwise', 'last-move-stroke');

            // When clicking on a piece (and when having to click again to finish the move)
            await testUtils.expectClickSuccess('#click_0_0');

            // Then the last rotation should be hidden
            testUtils.expectElementNotToExist('#last_rotation_3_counterclockwise');
        }));
    });
    describe('second click', () => {
        it('should show a "skip rotation button" when there is both neutral and non-neutral blocks', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_0_0');
            const move: PentagoMove = PentagoMove.rotationless(0, 0);
            await testUtils.expectMoveSuccess('#skipRotation', move);
        }));
        it('should display arrows to allow rotating specific block', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_0_0');
            testUtils.expectElementToExist('#currentDrop_0_0');
            const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
            await testUtils.expectMoveSuccess('#rotate_0_clockwise', move);
        }));
        it('should show highlighted winning line', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _],
                [X, _, _, _, _, _],
                [X, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, X, X, _, _, _],
            ];
            const state: PentagoState = new PentagoState(board, 5);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click_0_5');
            const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, true);
            await testUtils.expectMoveSuccess('#rotate_2_clockwise', move);
            testUtils.expectElementToExist('#victoryCoord_0_1');
            testUtils.expectElementToExist('#victoryCoord_0_5');
        }));
        it('should highlight last move (with rotation of last drop, clockwise)', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_5_5');
            const move: PentagoMove = PentagoMove.withRotation(5, 5, 3, true);
            await testUtils.expectMoveSuccess('#rotate_3_clockwise', move);
            const component: PentagoComponent = testUtils.getComponent();
            expect(component.getBlockClasses(1, 1)).toEqual(['last-move-stroke']);
            testUtils.expectElementToHaveClass('#last_rotation_3_clockwise', 'last-move-stroke');
            expect(component.getSquareClasses(3, 5)).toEqual(['player0-fill', 'last-move-stroke']);
        }));
        it('should highlight last move (with rotation of last drop, counterclockwise)', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_0_5');
            const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, false);
            await testUtils.expectMoveSuccess('#rotate_2_counterclockwise', move);
            const component: PentagoComponent = testUtils.getComponent();
            expect(component.getBlockClasses(0, 1)).toEqual(['last-move-stroke']);
            expect(component.getSquareClasses(2, 5)).toEqual(['player0-fill', 'last-move-stroke']);
        }));
        it('should highlight last move (with rotation, but not of last drop)', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _],
                [_, _, _, O, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
            ];
            const state: PentagoState = new PentagoState(board, 5);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click_0_1');
            const move: PentagoMove = PentagoMove.withRotation(0, 1, 1, false);
            await testUtils.expectMoveSuccess('#rotate_1_counterclockwise', move);
            const component: PentagoComponent = testUtils.getComponent();
            expect(component.getBlockClasses(1, 0)).toEqual(['last-move-stroke']);
            expect(component.getSquareClasses(0, 1)).toEqual(['player1-fill', 'last-move-stroke']);
        }));
    });
    it('should hide first move when taking back', fakeAsync(async() => {
        // Given a state with a first move done
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, O],
        ];
        const state: PentagoState = new PentagoState(board, 1);
        const move: PentagoMove = PentagoMove.rotationless(5, 5);
        await testUtils.setupState(state, PentagoState.getInitialState(), move);

        // When taking it back
        await testUtils.expectInterfaceClickSuccess('#takeBack');

        // Then no highlight should be found
        testUtils.expectElementNotToHaveClass('#click_5_5', 'last-move-stroke');
    }));
});

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
        expect(testUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(testUtils.getComponent()).toBeTruthy('PentagoComponent should be created');
    });
    it('Should do move in one click when click make all block are neutral', fakeAsync(async() => {
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        await testUtils.expectMoveSuccess('#click_1_1', move);
    }));
    it('Should show a "skip rotation button" when there is both neutral and non-neutral blocks', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_0_0');
        const move: PentagoMove = PentagoMove.rotationless(0, 0);
        await testUtils.expectMoveSuccess('#skipRotation', move);
    }));
    it('Should display arrows to allow rotating specific block', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_0_0');
        testUtils.expectElementToExist('#currentDrop_0_0');
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
        await testUtils.expectMoveSuccess('#rotate_0_clockwise', move);
        // TODO: test that block itself is of moved style
    }));
    it('Should not display arrows on neutral blocks and display dropped piece meanwhile', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [_, _, X, _, _, _],
            [_, O, _, _, _, _],
            [X, _, X, _, _, _],
            [_, _, _, _, O, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 5);
        testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click_0_0');
        testUtils.expectElementNotToExist('#rotate_0_clockwise');
    }));
    it('Should show highlighted winning line', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _],
            [X, _, _, _, _, _],
            [X, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, X, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 5);
        testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click_0_5');
        const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, true);
        await testUtils.expectMoveSuccess('#rotate_2_clockwise', move);
        testUtils.expectElementToExist('#victoryCoord_0_1');
        testUtils.expectElementToExist('#victoryCoord_0_5');
    }));
    it('Should highlight last move (with rotation of last drop, clockwise)', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_5_5');
        const move: PentagoMove = PentagoMove.withRotation(5, 5, 3, true);
        await testUtils.expectMoveSuccess('#rotate_3_clockwise', move);
        const component: PentagoComponent = testUtils.getComponent();
        expect(component.getBlockClasses(1, 1)).toEqual(['moved-fill']);
        expect(component.getSquareClasses(3, 5)).toEqual(['player0-fill', 'last-move-stroke']);
    }));
    it('Should highlight last move (with rotation of last drop, counterclockwise)', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_0_5');
        const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, false);
        await testUtils.expectMoveSuccess('#rotate_2_counterclockwise', move);
        const component: PentagoComponent = testUtils.getComponent();
        expect(component.getBlockClasses(0, 1)).toEqual(['moved-fill']);
        expect(component.getSquareClasses(2, 5)).toEqual(['player0-fill', 'last-move-stroke']);
    }));
    it('Should highlight last move (with rotation, but not of last drop)', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _],
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 5);
        testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click_0_1');
        const move: PentagoMove = PentagoMove.withRotation(0, 1, 1, false);
        await testUtils.expectMoveSuccess('#rotate_1_counterclockwise', move);
        const component: PentagoComponent = testUtils.getComponent();
        expect(component.getBlockClasses(1, 0)).toEqual(['moved-fill']);
        expect(component.getSquareClasses(0, 1)).toEqual(['player1-fill', 'last-move-stroke']);
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
        testUtils.setupState(state);

        // "then" there should not be clickable thing there
        await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    }));
});

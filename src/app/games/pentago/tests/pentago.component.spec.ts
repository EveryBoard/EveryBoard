import { fakeAsync } from '@angular/core/testing';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PentagoComponent } from '../pentago.component';
import { PentagoMove } from '../PentagoMove';
import { PentagoState } from '../PentagoState';

describe('PentagoComponent', () => {

    let componentTestUtils: ComponentTestUtils<PentagoComponent>;

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<PentagoComponent>('Pentago');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('PentagoComponent should be created');
    });
    it('Should do move in one click when click make all block are neutral', fakeAsync(async() => {
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        await componentTestUtils.expectMoveSuccess('#click_1_1', move);
    }));
    it('Should show a "skip rotation button" when there is both neutral and non-neutral blocks', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_0');
        const move: PentagoMove = PentagoMove.rotationless(0, 0);
        await componentTestUtils.expectMoveSuccess('#skipRotation', move);
    }));
    it('Should display arrows to allow rotating specific block', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_0');
        componentTestUtils.expectElementToExist('#currentDrop_0_0');
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
        await componentTestUtils.expectMoveSuccess('#rotate_0_clockwise', move);
        // TODO: test that block itself is of moved style
    }));
    it('Should not display arrows on neutral blocks and display dropped piece meanwhile', fakeAsync(async() => {
        const board: Table<Player> = [
            [_, _, X, _, _, _],
            [_, O, _, _, _, _],
            [X, _, X, _, _, _],
            [_, _, _, _, O, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 5);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#click_0_0');
        componentTestUtils.expectElementNotToExist('#rotate_0_clockwise');
    }));
    it('Should show highlighted winning line', fakeAsync(async() => {
        const board: Table<Player> = [
            [_, _, _, _, _, _],
            [X, _, _, _, _, _],
            [X, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, X, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 5);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#click_0_5');
        const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, true);
        await componentTestUtils.expectMoveSuccess('#rotate_2_clockwise', move);
        componentTestUtils.expectElementToExist('#victoryCoord_0_1');
        componentTestUtils.expectElementToExist('#victoryCoord_0_5');
    }));
    it('Should highlight last move (with rotation of last drop, clockwise)', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_5_5');
        const move: PentagoMove = PentagoMove.withRotation(5, 5, 3, true);
        await componentTestUtils.expectMoveSuccess('#rotate_3_clockwise', move);
        const component: PentagoComponent = componentTestUtils.getComponent();
        expect(component.getBlockClasses(1, 1)).toEqual(['moved']);
        expect(component.getCaseClasses(3, 5)).toEqual(['player0', 'last-move']);
    }));
    it('Should highlight last move (with rotation of last drop, counterclockwise)', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_5');
        const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, false);
        await componentTestUtils.expectMoveSuccess('#rotate_2_counterclockwise', move);
        const component: PentagoComponent = componentTestUtils.getComponent();
        expect(component.getBlockClasses(0, 1)).toEqual(['moved']);
        expect(component.getCaseClasses(2, 5)).toEqual(['player0', 'last-move']);
    }));
    it('Should highlight last move (with rotation, but not of last drop)', fakeAsync(async() => {
        const board: Table<Player> = [
            [_, _, _, _, _, _],
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 5);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#click_0_1');
        const move: PentagoMove = PentagoMove.withRotation(0, 1, 1, false);
        await componentTestUtils.expectMoveSuccess('#rotate_1_counterclockwise', move);
        const component: PentagoComponent = componentTestUtils.getComponent();
        expect(component.getBlockClasses(1, 0)).toEqual(['moved']);
        expect(component.getCaseClasses(0, 1)).toEqual(['player1', 'last-move']);
    }));
    it('should not accept click on pieces', fakeAsync(async() => {
        // Given an initial state with a piece on it
        const board: Table<Player> = [
            [O, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 5);
        componentTestUtils.setupState(state);

        // "then" there should not be clickable thing there
        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    }));
});

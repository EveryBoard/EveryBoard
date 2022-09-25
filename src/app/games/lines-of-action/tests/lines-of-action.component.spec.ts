/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LinesOfActionComponent } from '../lines-of-action.component';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionFailure } from '../LinesOfActionFailure';
import { LinesOfActionState } from '../LinesOfActionState';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';

describe('LinesOfActionComponent', () => {

    let testUtils: ComponentTestUtils<LinesOfActionComponent>;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LinesOfActionComponent>('LinesOfAction');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('LinesOfActionComponent should be created').toBeTruthy();
    });
    it('should allow a simple move', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_2_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        await testUtils.expectMoveSuccess('#click_2_2', move);
    }));
    it('should forbid moving in an invalid direction', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_2_0');
        await testUtils.expectClickFailure('#click_4_5', LinesOfActionFailure.INVALID_DIRECTION());
    }));
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
        testUtils.setupState(state);

        await testUtils.expectClickFailure('#click_0_0', LinesOfActionFailure.PIECE_CANNOT_MOVE());
    }));
    it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
        await testUtils.expectClickFailure('#click_0_2', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should allow selecting a different piece in one click', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_2_0');
        await testUtils.expectClickSuccess('#click_3_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(3, 0), new Coord(3, 2)).get();
        await testUtils.expectMoveSuccess('#click_3_2', move);
    }));
    it('should show selected piece', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_2_0');
        const component: LinesOfActionComponent = testUtils.getComponent();
        expect(component.getPieceClasses(2, 0)).toEqual(['player0-fill', 'selected-stroke']);
    }));
    it('should show last move cases', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_2_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        await testUtils.expectMoveSuccess('#click_2_2', move);

        const component: LinesOfActionComponent = testUtils.getComponent();
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
        testUtils.setupState(state);

        await testUtils.expectClickSuccess('#click_2_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        await testUtils.expectMoveSuccess('#click_2_2', move);

        const component: LinesOfActionComponent = testUtils.getComponent();
        expect(component.getSquareClasses(2, 2)).toEqual(['captured-fill']);
    }));
});

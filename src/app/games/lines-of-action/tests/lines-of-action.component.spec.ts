/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LinesOfActionComponent } from '../lines-of-action.component';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionFailure } from '../LinesOfActionFailure';
import { LinesOfActionState } from '../LinesOfActionState';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';

describe('LinesOfActionComponent', () => {

    let componentTestUtils: ComponentTestUtils<LinesOfActionComponent>;
    const X: Player = Player.ZERO;
    const O: Player = Player.ONE;
    const _: Player = Player.NONE;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<LinesOfActionComponent>('LinesOfAction');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('LinesOfActionComponent should be created').toBeTruthy();
    });
    it('should allow a simple move', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        await componentTestUtils.expectMoveSuccess('#click_2_2', move);
    }));
    it('should forbid moving in an invalid direction', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        await componentTestUtils.expectClickFailure('#click_4_5', LinesOfActionFailure.INVALID_DIRECTION());
    }));
    it('should forbid selecting a piece that has no valid targets', fakeAsync(async() => {
        const board: Table<Player> = [
            [O, X, X, X, X, X, X, _],
            [X, X, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, _, X, X, X, X, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 1);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#click_0_0', LinesOfActionFailure.PIECE_CANNOT_MOVE());
    }));
    it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_0_2', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should allow selecting a different piece in one click', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        await componentTestUtils.expectClickSuccess('#click_3_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(3, 0), new Coord(3, 2)).get();
        await componentTestUtils.expectMoveSuccess('#click_3_2', move);
    }));
    it('should show selected piece', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        const component: LinesOfActionComponent = componentTestUtils.getComponent();
        expect(component.getPieceClasses(2, 0)).toEqual(['player0', 'selected']);
    }));
    it('should show last move cases', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        await componentTestUtils.expectMoveSuccess('#click_2_2', move);

        const component: LinesOfActionComponent = componentTestUtils.getComponent();
        expect(component.getSquareClasses(2, 2)).toEqual(['moved']);
        expect(component.getSquareClasses(2, 0)).toEqual(['moved']);
    }));
    it('should show captures', fakeAsync(async() => {
        const board: Table<Player> = [
            [O, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, O],
            [_, _, O, _, _, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, _, X, X, X, X, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_2_0');
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        await componentTestUtils.expectMoveSuccess('#click_2_2', move);

        const component: LinesOfActionComponent = componentTestUtils.getComponent();
        expect(component.getSquareClasses(2, 2)).toEqual(['captured']);
    }));
});

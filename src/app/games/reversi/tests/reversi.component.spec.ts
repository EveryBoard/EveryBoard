/* eslint-disable max-lines-per-function */
import { ReversiComponent } from '../reversi.component';
import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { ReversiState } from 'src/app/games/reversi/ReversiState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('ReversiComponent', () => {

    let testUtils: ComponentTestUtils<ReversiComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<ReversiComponent>('Reversi');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should show last move and captures', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, X, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, X, O, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, O, _, _, _, _],
        ];
        const initialState: ReversiState = new ReversiState(board, 0);
        testUtils.setupState(initialState);

        const move: ReversiMove = new ReversiMove(0, 4);
        await testUtils.expectMoveSuccess('#click_0_4', move);

        const tablutGameComponent: ReversiComponent = testUtils.getGameComponent();
        expect(tablutGameComponent.getRectClasses(1, 3)).not.toContain('captured-fill');
        expect(tablutGameComponent.getRectClasses(2, 2)).not.toContain('captured-fill');
        expect(tablutGameComponent.getRectClasses(3, 1)).not.toContain('captured-fill');
        expect(tablutGameComponent.getRectClasses(4, 0)).not.toContain('captured-fill');

        expect(tablutGameComponent.getRectClasses(1, 4)).toEqual(['captured-fill']);

        expect(tablutGameComponent.getRectClasses(1, 5)).toEqual(['captured-fill']);
        expect(tablutGameComponent.getRectClasses(2, 6)).toEqual(['captured-fill']);

        expect(tablutGameComponent.getRectClasses(0, 4)).toEqual(['moved-fill']);
    }));
    it('should fake a click on ReversiMove.PASS.coord to pass', fakeAsync(async() => {
        // Given a fictitious board on which player can only pass
        const state: ReversiState = new ReversiState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [O, X, _, _, _, _, _, _],
        ], 1);

        // When displaying the board
        testUtils.setupState(state);

        // Then the player can pass
        await testUtils.expectPassSuccess(ReversiMove.PASS);
    }));
});

/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { ReversiMove } from '../common/ReversiMove';
import { ReversiState } from '../common/ReversiState';

import { ToricReversiComponent } from './toric-reversi.component';

describe('ToricReversiComponent', () => {

    let testUtils: ComponentTestUtils<ToricReversiComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<ToricReversiComponent>('ToricReversi');
    }));

    it('should hightlight toric captures', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, X, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _],
        ];
        const state: ReversiState = new ReversiState(board, 0);
        await testUtils.setupState(state);
        const move: ReversiMove = new ReversiMove(7, 4);
        await testUtils.expectMoveSuccess('#click_7_4', move);
        const gameComponent: ToricReversiComponent = testUtils.getGameComponent();
        expect(gameComponent.getRectClasses(0, 3)).not.toContain('captured-fill');
        expect(gameComponent.getRectClasses(1, 2)).not.toContain('captured-fill');
        expect(gameComponent.getRectClasses(2, 1)).not.toContain('captured-fill');
        expect(gameComponent.getRectClasses(3, 0)).not.toContain('captured-fill');
        expect(gameComponent.getRectClasses(0, 4)).toEqual(['captured-fill']);
        expect(gameComponent.getRectClasses(0, 5)).toEqual(['captured-fill']);
        expect(gameComponent.getRectClasses(1, 6)).toEqual(['captured-fill']);
        expect(gameComponent.getRectClasses(7, 4)).toEqual(['moved-fill']);
    }));

});

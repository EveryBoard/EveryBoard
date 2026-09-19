/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { PlayerOrNone } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { ReversiMove } from '@everyboard/games';
import { ReversiState } from '@everyboard/games';

import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { ToricReversiComponent } from '../toric-reversi.component';

describe('ToricReversiComponent', () => {

    let testUtils: ComponentTestUtils<ToricReversiComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<ToricReversiComponent>('ToricReversi');
    }));

    it('should hightlight toric captures', fakeAsync(async() => {
        // Given a board where a toric capture could happend
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

        // When doing that capturing move
        const move: ReversiMove = new ReversiMove(7, 4);

        // Then it should work and the captured coord be highlighted
        await testUtils.expectMoveSuccess('#click-7-4', move);
        testUtils.expectElementNotToHaveClass('#click-0-3', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-1-2', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-2-1', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-3-0', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-0-4', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-0-5', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-1-6', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-7-4', 'moved-fill');
    }));

});

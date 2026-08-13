/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { PlayerOrNone } from '@everyboard/games';

import { Table } from '../../../../jscaip/TableUtils';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { ReversiConfig } from '../../common/AbstractReversiRules';
import { ReversiMove } from '../../common/ReversiMove';
import { ReversiState } from '../../common/ReversiState';
import { ReversiRules } from '../ReversiRules';
import { ReversiComponent } from '../reversi.component';

describe('ReversiComponent', () => {

    let testUtils: ComponentTestUtils<ReversiComponent>;
    const defaultConfig: ReversiConfig = ReversiRules.get().getDefaultRulesConfig();

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
        const state: ReversiState = new ReversiState(board, 0);
        await testUtils.setupState(state);

        const move: ReversiMove = new ReversiMove(0, 4);
        await testUtils.expectMoveSuccess('#click-0-4', move);

        testUtils.expectElementNotToHaveClass('#click-1-3', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-2-2', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-3-1', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-4-0', 'captured-fill');

        testUtils.expectElementToHaveClasses('#click-1-4', ['base', 'captured-fill']);

        testUtils.expectElementToHaveClasses('#click-1-5', ['base', 'captured-fill']);
        testUtils.expectElementToHaveClasses('#click-2-6', ['base', 'captured-fill']);

        testUtils.expectElementToHaveClasses('#click-0-4', ['base', 'moved-fill']);
    }));

    describe('first click', () => {

        it(`should hide last move's capture`, fakeAsync(async() => {
            // Given a board with a last move
            const previousState: ReversiState = ReversiRules.get().getInitialState(defaultConfig);
            const previousMove: ReversiMove = new ReversiMove(5, 3);
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, O, O, O, _, _],
                [_, _, _, X, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const state: ReversiState = new ReversiState(board, 1);
            await testUtils.setupState(state, { previousState, previousMove });

            const move: ReversiMove = new ReversiMove(5, 4);
            await testUtils.expectMoveSuccess('#click-5-4', move);

            testUtils.expectElementNotToHaveClass('#click-4-3', 'captured-fill');
            testUtils.expectElementToHaveClass('#click-4-4', 'captured-fill');
        }));

    });

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
        await testUtils.setupState(state);

        // Then the player can pass
        await testUtils.expectPassSuccess(ReversiMove.PASS);
    }));
});

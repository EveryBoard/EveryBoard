/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { ReversiConfig } from '../common/AbstractReversiRules';
import { ReversiMove } from '../common/ReversiMove';
import { ReversiState } from '../common/ReversiState';
import { ReversiComponent } from '../reversi/reversi.component';

import { ReversiRules } from './ReversiRules';

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
        await testUtils.expectMoveSuccess('#click_0_4', move);

        const component: ReversiComponent = testUtils.getGameComponent();
        expect(component.getRectClasses(1, 3)).not.toContain('captured-fill');
        expect(component.getRectClasses(2, 2)).not.toContain('captured-fill');
        expect(component.getRectClasses(3, 1)).not.toContain('captured-fill');
        expect(component.getRectClasses(4, 0)).not.toContain('captured-fill');

        expect(component.getRectClasses(1, 4)).toEqual(['captured-fill']);

        expect(component.getRectClasses(1, 5)).toEqual(['captured-fill']);
        expect(component.getRectClasses(2, 6)).toEqual(['captured-fill']);

        expect(component.getRectClasses(0, 4)).toEqual(['moved-fill']);
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
        await testUtils.setupState(state);

        // Then the player can pass
        await testUtils.expectPassSuccess(ReversiMove.PASS);
    }));

    describe('Toric Configuration', () => {

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
            const customConfig: ReversiConfig = {
                ...defaultConfig,
                toric: true,
            };
            await testUtils.setupState(state, { config: customConfig });

            const move: ReversiMove = new ReversiMove(7, 4);
            await testUtils.expectMoveSuccess('#click_7_4', move);

            const tablutGameComponent: ReversiComponent = testUtils.getGameComponent();
            expect(tablutGameComponent.getRectClasses(0, 3)).not.toContain('captured-fill');
            expect(tablutGameComponent.getRectClasses(1, 2)).not.toContain('captured-fill');
            expect(tablutGameComponent.getRectClasses(2, 1)).not.toContain('captured-fill');
            expect(tablutGameComponent.getRectClasses(3, 0)).not.toContain('captured-fill');

            expect(tablutGameComponent.getRectClasses(0, 4)).toEqual(['captured-fill']);

            expect(tablutGameComponent.getRectClasses(0, 5)).toEqual(['captured-fill']);
            expect(tablutGameComponent.getRectClasses(1, 6)).toEqual(['captured-fill']);

            expect(tablutGameComponent.getRectClasses(7, 4)).toEqual(['moved-fill']);
        }));

    });
});

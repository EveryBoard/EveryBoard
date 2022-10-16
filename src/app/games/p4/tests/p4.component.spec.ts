/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { P4Component } from '../p4.component';
import { P4Move } from 'src/app/games/p4/P4Move';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { P4State } from '../P4State';
import { Table } from 'src/app/utils/ArrayUtils';

describe('P4Component', () => {

    let testUtils: ComponentTestUtils<P4Component>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<P4Component>('P4');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should accept simple move', fakeAsync(async() => {
        const move: P4Move = P4Move.THREE;
        await testUtils.expectMoveSuccess('#click_3', move);
    }));
    it('should highlight victory', fakeAsync(async() => {
        // Given a board with a victory
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state: P4State = new P4State(board, 0);

        // When rendering the board
        testUtils.setupState(state);

        // Then victorious coords should be shown
        testUtils.expectElementToHaveClass('#victory_coord_3_2', 'victory-stroke');
        testUtils.expectElementToHaveClass('#victory_coord_3_3', 'victory-stroke');
        testUtils.expectElementToHaveClass('#victory_coord_3_4', 'victory-stroke');
        testUtils.expectElementToHaveClass('#victory_coord_3_5', 'victory-stroke');
    }));
});

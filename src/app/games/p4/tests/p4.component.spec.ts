/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { P4Component } from '../p4.component';
import { P4Move } from 'src/app/games/p4/P4Move';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { P4State } from '../P4State';
import { Table } from 'src/app/utils/ArrayUtils';

describe('P4Component', () => {

    let componentTestUtils: ComponentTestUtils<P4Component>;

    const O: Player = Player.ZERO;
    const _: Player = Player.NONE;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<P4Component>('P4');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should accept simple move', fakeAsync(async() => {
        const move: P4Move = P4Move.THREE;
        await componentTestUtils.expectMoveSuccess('#click_3', move);
    }));
    it('should highlight victory', fakeAsync(async() => {
        // Given a board with a victory
        const board: Table<Player> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state: P4State = new P4State(board, 0);

        // When rendering it
        componentTestUtils.setupState(state);

        // Then victorious coords should be shown
        componentTestUtils.expectElementToHaveClass('#victory_coord_3_2', 'victory-stroke');
        componentTestUtils.expectElementToHaveClass('#victory_coord_3_3', 'victory-stroke');
        componentTestUtils.expectElementToHaveClass('#victory_coord_3_4', 'victory-stroke');
        componentTestUtils.expectElementToHaveClass('#victory_coord_3_5', 'victory-stroke');
    }));
});

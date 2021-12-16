import { ReversiComponent } from '../reversi.component';
import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { ReversiState } from 'src/app/games/reversi/ReversiState';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('ReversiComponent', () => {

    let componentTestUtils: ComponentTestUtils<ReversiComponent>;

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<ReversiComponent>('Reversi');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should show last move and captures', fakeAsync(async() => {
        const board: Table<Player> = [
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
        componentTestUtils.setupState(initialState);

        const move: ReversiMove = new ReversiMove(0, 4);
        await componentTestUtils.expectMoveSuccess('#click_0_4', move, undefined, [2, 7]);

        const tablutGameComponent: ReversiComponent = componentTestUtils.getComponent();
        expect(tablutGameComponent.getRectClasses(1, 3)).not.toContain('captured');
        expect(tablutGameComponent.getRectClasses(2, 2)).not.toContain('captured');
        expect(tablutGameComponent.getRectClasses(3, 1)).not.toContain('captured');
        expect(tablutGameComponent.getRectClasses(4, 0)).not.toContain('captured');

        expect(tablutGameComponent.getRectClasses(1, 4)).toEqual(['captured']);

        expect(tablutGameComponent.getRectClasses(1, 5)).toEqual(['captured']);
        expect(tablutGameComponent.getRectClasses(2, 6)).toEqual(['captured']);

        expect(tablutGameComponent.getRectClasses(0, 4)).toEqual(['moved']);
    }));
    it('should fake a click on ReversiMove.PASS.coord to pass', fakeAsync(async() => {
        // Given a fictitious board on which player can only pass
        componentTestUtils.setupState(new ReversiState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [O, X, _, _, _, _, _, _],
        ], 1));

        // when passing, it should be legal
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue();
    }));
});

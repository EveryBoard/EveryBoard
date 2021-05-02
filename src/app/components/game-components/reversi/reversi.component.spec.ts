import { ReversiComponent } from './reversi.component';
import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { ReversiPartSlice } from 'src/app/games/reversi/ReversiPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('ReversiComponent', () => {
    let componentTestUtils: ComponentTestUtils<ReversiComponent>;

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    beforeEach(fakeAsync(() => {
        componentTestUtils = new ComponentTestUtils<ReversiComponent>('Reversi');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should show last move and captures', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, X, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, X, O, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, O, _, _, _, _],
        ];
        const initialSlice: ReversiPartSlice = new ReversiPartSlice(board, 0);
        componentTestUtils.setupSlice(initialSlice);

        const move: ReversiMove = new ReversiMove(0, 4);
        await componentTestUtils.expectMoveSuccess('#click_0_4', move, undefined, 2, 7);

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
    it('should delegate decoding to move', () => {
        spyOn(ReversiMove, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(5);
        expect(ReversiMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(ReversiMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(new ReversiMove(1, 1));
        expect(ReversiMove.encode).toHaveBeenCalledTimes(1);
    });
});

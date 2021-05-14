import { fakeAsync } from '@angular/core/testing';
import { P4Component } from '../p4.component';
import { P4Move } from 'src/app/games/p4/P4Move';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { P4PartSlice } from '../P4PartSlice';

describe('P4Component', () => {
    let componentTestUtils: ComponentTestUtils<P4Component>;

    const O: number = Player.ZERO.value;
    const _: number = Player.NONE.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<P4Component>('P4');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should accept simple move', fakeAsync(async() => {
        const move: P4Move = P4Move.THREE;
        await componentTestUtils.expectMoveSuccess('#click_3', move);
    }));
    it('should highlight victory', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 0);
        componentTestUtils.setupSlice(slice);
        expect(componentTestUtils.getComponent().getCaseClasses(3, 3)).toContain('victory-stroke');
    }));
    it('should delegate decoding to move', () => {
        spyOn(P4Move, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(5);
        expect(P4Move.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(P4Move, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(P4Move.of(5));
        expect(P4Move.encode).toHaveBeenCalledTimes(1);
    });
});

import { GoComponent } from './go.component';
import { GoMove } from 'src/app/games/go/go-move/GoMove';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { GoPartSlice, GoPiece, Phase } from 'src/app/games/go/go-part-slice/GoPartSlice';
import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('GoComponent', () => {
    let componentTestUtils: ComponentTestUtils<GoComponent>;

    const _: GoPiece = GoPiece.EMPTY;
    const O: GoPiece = GoPiece.BLACK;
    const X: GoPiece = GoPiece.WHITE;

    beforeAll(() => {
        GoPartSlice.HEIGHT = 5;
        GoPartSlice.WIDTH = 5;
    });
    beforeEach(fakeAsync(() => {
        componentTestUtils = new ComponentTestUtils<GoComponent>('Go');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('Should allow to pass twice, then use "pass" as the method to "accept"', async() => {
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Passed
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Counting
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Accept

        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Finished

        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeFalse();
    });
    it('Should show captures', fakeAsync(async() => {
        const board: Table<GoPiece> = [
            [O, X, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
        componentTestUtils.setupSlice(slice);

        const move: GoMove = new GoMove(0, 1);
        await componentTestUtils.expectMoveSuccess('#click_0_1', move, undefined, 0, 0);
        const goComponent: GoComponent = componentTestUtils.getComponent();
        expect(goComponent.captures).toEqual([new Coord(0, 0)]);
    }));
    it('Should allow simple clicks', fakeAsync(async() => {
        const move: GoMove = new GoMove(1, 1);
        await componentTestUtils.expectMoveSuccess('#click_1_1', move, undefined, 0, 0);
        const secondMove: GoMove = new GoMove(2, 2);
        await componentTestUtils.expectMoveSuccess('#click_2_2', secondMove, undefined, 0, 0);
    }));
    it('should delegate decoding to move', () => {
        spyOn(GoMove, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(5);
        expect(GoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(GoMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(new GoMove(1, 1));
        expect(GoMove.encode).toHaveBeenCalledTimes(1);
    });
});

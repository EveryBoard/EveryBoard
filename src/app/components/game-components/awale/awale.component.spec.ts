import { AwaleComponent } from './awale.component';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';

describe('AwaleComponent', () => {
    let componentTestUtils: ComponentTestUtils<AwaleComponent>;

    beforeEach(fakeAsync(() => {
        componentTestUtils = new ComponentTestUtils<AwaleComponent>('Awale');
    }));
    it('should create', async() => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('AwaleComponent should be created');
    });
    describe('encode/decode', () => {
        it('should delegate decoding to move', () => {
            spyOn(AwaleMove, 'decode').and.callThrough();
            componentTestUtils.getComponent().decodeMove(5);
            expect(AwaleMove.decode).toHaveBeenCalledTimes(1);
        });
        it('should delegate encoding to move', () => {
            spyOn(AwaleMove, 'encode').and.callThrough();
            componentTestUtils.getComponent().encodeMove(new AwaleMove(1, 1));
            expect(AwaleMove.encode).toHaveBeenCalledTimes(1);
        });
    });
    it('should accept simple move for player zero, show captured and moved', fakeAsync(async() => {
        const board: number[][] = [
            [4, 4, 4, 4, 4, 2],
            [4, 4, 4, 4, 1, 4],
        ];
        const slice: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        componentTestUtils.setupSlice(slice);

        const move: AwaleMove = new AwaleMove(5, 0);
        componentTestUtils.expectMoveSuccess('#click_5_0', move, undefined, 0, 0);
        const awaleComponent: AwaleComponent = componentTestUtils.getComponent() as AwaleComponent;
        expect(awaleComponent.getCaseClasses(5, 0)).toEqual(['moved', 'highlighted']);
        expect(awaleComponent.getCaseClasses(5, 1)).toEqual(['moved']);
        expect(awaleComponent.getCaseClasses(4, 1)).toEqual(['captured']);
    }));
    it('should tell to user empty house cannot be moved', fakeAsync(async() => {
        const board: number[][] = [
            [0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const slice: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        componentTestUtils.setupSlice(slice);

        const move: AwaleMove = new AwaleMove(0, 0);
        const message: string = 'You must choose a non-empty house to distribute.';
        await componentTestUtils.expectMoveFailure('#click_0_0', message, move, undefined, 0, 0);
    }));
});

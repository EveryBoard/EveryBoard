import { AwaleComponent } from '../awale.component';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AwaleFailure } from '../AwaleFailure';

describe('AwaleComponent', () => {
    let componentTestUtils: ComponentTestUtils<AwaleComponent>;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<AwaleComponent>('Awale');
    }));
    it('should create', fakeAsync(async() => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('AwaleComponent should be created').toBeTruthy();
    }));
    it('should accept simple move for player zero, show captured and moved', fakeAsync(async() => {
        const board: number[][] = [
            [4, 4, 4, 4, 4, 2],
            [4, 4, 4, 4, 1, 4],
        ];
        const slice: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        componentTestUtils.setupSlice(slice);

        const move: AwaleMove = AwaleMove.FIVE;
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

        const move: AwaleMove = AwaleMove.ZERO;
        await componentTestUtils.expectMoveFailure('#click_0_0',
                                                   AwaleFailure.MUST_CHOOSE_NONEMPTY_HOUSE(),
                                                   move, undefined, 0, 0);
    }));
});

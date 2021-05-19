import { fakeAsync } from '@angular/core/testing';
import { MinimaxTestingComponent } from '../minimax-testing.component';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('MinimaxTestingComponent', () => {
    let componentTestUtils: ComponentTestUtils<MinimaxTestingComponent>;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<MinimaxTestingComponent>('MinimaxTesting');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should delegate decoding to move', () => {
        spyOn(MinimaxTestingMove, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(1);
        expect(MinimaxTestingMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(MinimaxTestingMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(MinimaxTestingMove.DOWN);
        expect(MinimaxTestingMove.encode).toHaveBeenCalledTimes(1);
    });
    it('should allow simple moves', fakeAsync(async() => {
        await componentTestUtils.expectMoveSuccess('#click_down', MinimaxTestingMove.DOWN);
        await componentTestUtils.expectMoveSuccess('#click_right', MinimaxTestingMove.RIGHT);
    }));
});

/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { MinimaxTestingComponent } from '../minimax-testing.component';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('MinimaxTestingComponent', () => {

    let testUtils: ComponentTestUtils<MinimaxTestingComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<MinimaxTestingComponent>('MinimaxTesting');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(testUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('Should allow simple moves', fakeAsync(async() => {
        await testUtils.expectMoveSuccess('#click_down', MinimaxTestingMove.DOWN);
        await testUtils.expectMoveSuccess('#click_right', MinimaxTestingMove.RIGHT);
    }));
});

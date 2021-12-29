/* eslint-disable max-lines-per-function */
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
    it('should allow simple moves', fakeAsync(async() => {
        await componentTestUtils.expectMoveSuccess('#click_down', MinimaxTestingMove.DOWN);
        await componentTestUtils.expectMoveSuccess('#click_right', MinimaxTestingMove.RIGHT);
    }));
});

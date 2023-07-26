/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameCreationComponent } from '../online-game-creation/online-game-creation.component';
import { OnlineGameSelectionComponent } from './online-game-selection.component';

describe('OnlineGameSelectionComponent', () => {

    let testUtils: SimpleComponentTestUtils<OnlineGameSelectionComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameSelectionComponent);
        testUtils.detectChanges();
    }));
    it('should redirect to OnlineGameCreation to create chosen game', fakeAsync(async() => {
        // Given a chosen game
        testUtils.getComponent().pickGame('whateverGame');
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();

        // When clicking on 'play'
        await testUtils.clickElement('#launchGame');
        tick();

        // Then the user is redirected to the game
        expectValidRouting(router, ['/play', 'whateverGame'], OnlineGameCreationComponent);
    }));
    it('should display refusal reason when user cannot join game', fakeAsync(async() => {
        // Given a chosen game and a user that cannot join game
        const component: OnlineGameSelectionComponent = testUtils.getComponent();
        testUtils.getComponent().pickGame('whateverGame');
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();
        const reason: string = 'some refusal reason from the service';
        spyOn(component.observedPartService, 'canUserCreate').and.returnValue(MGPValidation.failure(reason));

        // When clicking on 'play'
        await testUtils.clickElement('#launchGame');
        tick();

        // Then refusal should be toasted and router not called
        expect(router.navigate).not.toHaveBeenCalled();
        testUtils.expectCriticalMessageToHaveBeenDisplayed(reason);
    }));
});

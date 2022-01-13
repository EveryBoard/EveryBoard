/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameSelectionComponent } from './online-game-selection.component';

describe('OnlineGameSelectionComponent', () => {

    let testUtils: SimpleComponentTestUtils<OnlineGameSelectionComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameSelectionComponent);
        testUtils.detectChanges();
    }));
    it('should redirect to OnlineGameSelection to create chosen game', fakeAsync(async() => {
        // Given a chosen game
        testUtils.getComponent().pickGame('whateverGame');
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        // When clicking on 'play'
        await testUtils.clickElement('#playOnline');
        tick();

        // Then the user is redirected to the game
        expect(router.navigate).toHaveBeenCalledWith(['/play/', 'whateverGame']);
    }));
});

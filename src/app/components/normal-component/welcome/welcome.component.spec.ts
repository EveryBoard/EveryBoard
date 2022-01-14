/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {

    let testUtils: SimpleComponentTestUtils<WelcomeComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(WelcomeComponent);
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should redirect to online game creation when selecting an online game', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#playOnline_Awale');

        expect(router.navigate).toHaveBeenCalledWith(['/play/', 'Awale']);
    }));
    it('should redirect to local game when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#playLocally_Awale');

        expect(router.navigate).toHaveBeenCalledWith(['/local/', 'Awale']);
    }));
    it('should redirect to local game when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#startTutorial_Awale');

        expect(router.navigate).toHaveBeenCalledWith(['/tutorial/', 'Awale']);
    }));
    describe('game list', () => {
        it('should open a modal dialog when clicking on a game image', fakeAsync(async() => {
            // Given that the page is loaded

            // When clicking on the info for a game
            await testUtils.clickElement('#image_Awale');

            // Then the modal dialog is shown
            testUtils.expectElementToExist('#gameInfoModal');
        }));
        it('should close the modal dialog when clicking anywhere on its background', fakeAsync(async() => {
            // Given that the modal dialog is shown for a game
            await testUtils.clickElement('#image_Awale');

            // When clicking on its background
            await testUtils.clickElement('#modalBackground');

            // Then the modal dialog disappears
            testUtils.expectElementNotToExist('#gameInfoModal');
        }));
        it('should close the modal dialog when clicking anywhere on its close button', fakeAsync(async() => {
            // Given that the modal dialog is shown for a game
            await testUtils.clickElement('#image_Awale');

            // When clicking on its close button
            await testUtils.clickElement('#closeInfo');

            // Then the modal dialog disappears
            testUtils.expectElementNotToExist('#gameInfoModal');
        }));
    });

});

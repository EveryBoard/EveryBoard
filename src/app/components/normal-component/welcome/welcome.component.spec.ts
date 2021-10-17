import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
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
    it('should rely on game service to create online games', fakeAsync(async() => {
        const gameService: GameService = TestBed.inject(GameService);
        spyOn(gameService, 'createGameAndRedirectOrShowError');

        await testUtils.clickElement('#playOnline_Awale');

        expect(gameService.createGameAndRedirectOrShowError).toHaveBeenCalledWith('Awale');
    }));
    it('should redirect to local game when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#playLocally_Awale');

        expect(router.navigate).toHaveBeenCalledWith(['/local/Awale']);
    }));
    it('should redirect to local game when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#startTutorial_Awale');

        expect(router.navigate).toHaveBeenCalledWith(['/tutorial/Awale']);
    }));

});

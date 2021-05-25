import { fakeAsync, TestBed } from '@angular/core/testing';
import { ServerPageComponent } from './server-page.component';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';

describe('ServerPageComponent', () => {
    let testUtils: SimpleComponentTestUtils<ServerPageComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(ServerPageComponent);
        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeDefined();
    });
    it('should rely on game service to create online games', fakeAsync(async() => {
        const gameService: GameService = TestBed.inject(GameService);
        spyOn(gameService, 'createGameAndRedirectOrShowError');
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.getComponent().ngOnInit();

        testUtils.getComponent().pickGame('Awale');
        testUtils.getComponent().createGame();
        testUtils.detectChanges();

        expect(gameService.createGameAndRedirectOrShowError).toHaveBeenCalledWith('Awale');

    }));
    it('Should be legal for unlogged user to create local game', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);
        spyOn(router, 'navigate');
        testUtils.getComponent().ngOnInit();

        testUtils.getComponent().playLocally();
        testUtils.detectChanges();

        expect(router.navigate).toHaveBeenCalledWith(['local/undefined']);
    }));
});

/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PartDAO } from 'src/app/dao/PartDAO';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { GameServiceMessages } from 'src/app/services/GameServiceMessages';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameCreationComponent } from './online-game-creation.component';

describe('OnlineGameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<OnlineGameCreationComponent>;

    const game: string = 'P4';
    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameCreationComponent, new ActivatedRouteStub(game));
    }));
    it('should create and redirect to the game upon success', fakeAsync(async() => {
        // Given that the page is loaded for a specific game by an online user that can create a game
        const game: string = 'whatever-game';
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        const partDAO: PartDAO = TestBed.inject(PartDAO);
        spyOn(partDAO, 'userHasActivePart').and.resolveTo(false);

        // When the page is rendered
        testUtils.detectChanges();

        // Then the user is redirected to the game
        expect(router.navigate).toHaveBeenCalledOnceWith(['/play/' + game, 'PartDAOMock0']);
    }));
    it('should show toast and navigate to server when creator has active parts', fakeAsync(async() => {
        // Given that the page is loaded for a specific game by a connected user that already has an active part
        const router: Router = TestBed.inject(Router);
        const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
        spyOn(router, 'navigate').and.callThrough();
        spyOn(messageDisplayer, 'infoMessage').and.callThrough();
        const partDAO: PartDAO = TestBed.inject(PartDAO);
        spyOn(partDAO, 'userHasActivePart').and.resolveTo(false);

        // When the page is rendered
        testUtils.detectChanges();

        // It should toast, and navigate to server
        expect(messageDisplayer.infoMessage).toHaveBeenCalledOnceWith(GameServiceMessages.ALREADY_INGAME());
        expect(router.navigate).toHaveBeenCalledOnceWith(['/server']);
    }));
});

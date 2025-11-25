/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MGPFallible, MGPValidation } from '@everyboard/lib';

import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { CurrentGameService, GameActionFailure } from 'src/app/services/CurrentGameService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { ActivatedRouteStub, expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { GameWrapperMessages } from '../../wrapper-components/GameWrapper';
import { OnlineGameWrapperComponent } from '../../wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { LobbyComponent } from '../lobby/lobby.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { OnlineGameCreationComponent } from './online-game-creation.component';
import { WelcomeComponent } from '../welcome/welcome.component';
import { GameService } from 'src/app/services/GameService';

describe('OnlineGameCreationComponent for non-existing game', () => {

    it('should redirect to /notFound', fakeAsync(async() => {
        // Given a creation of a game that does not exist
        const testUtils: SimpleComponentTestUtils<OnlineGameCreationComponent> =
            await SimpleComponentTestUtils.create(OnlineGameCreationComponent,
                                                  new ActivatedRouteStub('invalid-game'));
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When loading the wrapper
        testUtils.detectChanges();
        tick(0);

        // Then it goes to /notFound with the expected error message
        const route: string[] = ['/notFound', GameWrapperMessages.NO_MATCHING_GAME('invalid-game')];
        expectValidRouting(router, route, NotFoundComponent, { skipLocationChange: true });
    }));

});

describe('OnlineGameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<OnlineGameCreationComponent>;

    const game: string = 'P4';
    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameCreationComponent,
                                                          new ActivatedRouteStub(game));
    }));

    it('should create and redirect to the game upon success', fakeAsync(async() => {
        // Given a page that is loaded for a specific game by an online user that can create a game
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);

        // When the page is rendered
        testUtils.detectChanges();
        tick(0);

        // Then the user should be redirected to the game
        expectValidRouting(router, ['/play', game, 'gameId'], OnlineGameWrapperComponent);
    }));

    it('should show toast and navigate to / when creator has a current game', fakeAsync(async() => {
        // Given a page that is loaded for a specific game by a connected user that already has an active part
        const router: Router = TestBed.inject(Router);
        const currentGameService: CurrentGameService = TestBed.inject(CurrentGameService);
        const refusalReason: string = 'whatever reason the service has';
        spyOn(currentGameService, 'canUserCreate').and.returnValue(MGPValidation.failure(refusalReason));
        spyOn(router, 'navigate').and.resolveTo(true);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);

        // When the page is rendered
        // Then it should toast, and navigate to /
        await testUtils.expectToDisplayInfoMessage(refusalReason, async() => {
            testUtils.detectChanges();
        });

        expectValidRouting(router, ['/'], WelcomeComponent);
    }));

    it('should show toast and navigate to / when there is a backend erro', fakeAsync(async() => {
        // Given a page that is loaded for a specific game by a connected user
        const router: Router = TestBed.inject(Router);
        const gameService: GameService = TestBed.inject(GameService);
        spyOn(gameService, 'createGame').and.callFake(async() => MGPFallible.failure('some-error'));
        spyOn(router, 'navigate').and.resolveTo(true);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);

        // When the page is rendered and there is a backend error
        // Then it should toast, and navigate to /
        await testUtils.expectToDisplayInfoMessage(GameActionFailure.UNEXPECTED_BACKEND_ERROR('some-error'), async() => {
            testUtils.detectChanges();
        });

        expectValidRouting(router, ['/lobby'], LobbyComponent);
    }));

});

/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MGPMap, MGPOptional, MGPValidation } from '@everyboard/lib';

import { ConfigRoom } from '../../../domain/ConfigRoom';
import { ConfigRoomMocks } from '../../../domain/ConfigRoomMocks.spec';
import { UserMocks } from '../../../domain/UserMocks.spec';
import { CurrentGameMocks } from '../../../domain/mocks/CurrentGameMocks.spec';
import { AbstractActiveConfigRoomsService, ActiveConfigRoomsService } from '../../../services/ActiveConfigRoomsService';
import { AbstractBackendService, BackendService } from '../../../services/BackendService';
import { CurrentGameService, GameActionFailure } from '../../../services/CurrentGameService';
import { ActiveConfigRoomsServiceMock } from '../../../services/tests/ActiveConfigRoomServiceMock.spec';
import { BackendServiceMock } from '../../../services/tests/BackendServiceMock.spec';
import { ConnectedUserServiceMock } from '../../../services/tests/ConnectedUserService.spec';
import { CurrentGameServiceMock } from '../../../services/tests/CurrentGameServiceMock.spec';
import { expectValidRouting, prepareUnsubscribeCheck, SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { OnlineGameWrapperComponent } from '../../wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { WelcomeComponent } from '../welcome/welcome.component';

import { LobbyComponent } from './lobby.component';

describe('LobbyComponent', () => {

    let testUtils: SimpleComponentTestUtils<LobbyComponent>;
    let component: LobbyComponent;
    let router: Router;
    let currentGameService: CurrentGameService;

    const configRoom: ConfigRoom = ConfigRoomMocks.withAcceptedConfig(MGPOptional.empty());

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LobbyComponent);
        ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
        component = testUtils.getComponent();
        router = TestBed.inject(Router);
        currentGameService = TestBed.inject(CurrentGameService);
        spyOn(router, 'navigate').and.resolveTo();
    }));

    it('should create', fakeAsync(async() => {
        testUtils.detectChanges();
        expect(component).toBeDefined();
    }));

    describe('error management', () => {

        it('should forbid user to join lobby when the backend rejects it because they are already subscribed', fakeAsync(async() => {
            // Given loaded lobby
            const backendService: BackendServiceMock =
                TestBed.inject(BackendService) as AbstractBackendService as BackendServiceMock;
            testUtils.detectChanges();
            tick(0);
            // When it receives an already-subscribed error from the backend
            // Then it should toast and redirect to /
            await testUtils.expectToDisplayCriticalMessage(
                GameActionFailure.YOU_ALREADY_HAVE_ANOTHER_TAB(),
                async() => {
                    backendService.mockReceivedMessage('Error', { reason: 'already-subscribed' });
                });
            await expectValidRouting(router, ['/'], WelcomeComponent);
        }));

        it('should forbid user to join lobby when the backend rejects it because of an unexpected failure', fakeAsync(async() => {
            // Given loaded lobby
            const backendService: BackendServiceMock =
                TestBed.inject(BackendService) as AbstractBackendService as BackendServiceMock;
            testUtils.detectChanges();
            tick(0);
            // When it receives an error from the backend
            // Then it should toast and redirect to /
            await testUtils.expectToDisplayCriticalMessage(
                GameActionFailure.UNEXPECTED_BACKEND_ERROR('some-error'),
                async() => {
                    backendService.mockReceivedMessage('Error', { reason: 'some-error' });
                });
            await expectValidRouting(router, ['/'], WelcomeComponent);
        }));
    });

    describe('tab-create element', () => {

        it('should display online-game-selection component when clicking on it when allowed by connectedUserService', fakeAsync(async() => {
            // Given a lobby
            testUtils.detectChanges();
            // where you are allowed by currentGameService
            spyOn(currentGameService, 'canUserCreate').and.returnValue(MGPValidation.SUCCESS);

            // When clicking on the 'create game' tab
            await testUtils.clickElement('#tab-create');

            // Then online-game-selection component should be on the page
            testUtils.expectElementToExist('#online-game-selection');
        }));

        it('should refuse to change page when clicking on it while not allowed by connectedUserService, and toast the reason', fakeAsync(async() => {
            // Given a lobby
            testUtils.detectChanges();
            // where you are forbidden by connectedUserService
            const error: string = `Si je dit non, c'est non!!!`;
            spyOn(currentGameService, 'canUserCreate').and.returnValue(MGPValidation.failure(error));

            // When clicking on the 'create game' tab
            // Then online-game-selection component should not be visible and an error should be toasted
            await testUtils.expectToDisplayCriticalMessage(error, async() => {
                await testUtils.clickElement('#tab-create');
            });

            testUtils.expectElementToHaveClass('#game-creator-tab', 'is-hidden');
        }));

        it('should disable the tab when the user already has a current game', fakeAsync(async() => {
            // Given a lobby where current game is set
            testUtils.detectChanges();
            CurrentGameServiceMock.setCurrentGame(MGPOptional.of(CurrentGameMocks.CREATOR_WITH_OPPONENT));

            // When displaying the page
            testUtils.detectChanges();

            // Then the tab should be disabled
            testUtils.expectElementToHaveClass('#tab-create', 'disabled-tab');
        }));

        it('should enable the tab when the user does not have a current game', fakeAsync(async() => {
            // Given a lobby where current game is not set
            testUtils.detectChanges();
            CurrentGameServiceMock.setCurrentGame(MGPOptional.empty());

            // When displaying the page
            testUtils.detectChanges();

            // Then the tab should be enabled
            testUtils.expectElementNotToHaveClass('#tab-create', 'disabled-tab');
        }));

    });

    function setActiveConfigRooms(rooms: MGPMap<string, ConfigRoom>): void {
        const activeConfigRoomsService: ActiveConfigRoomsServiceMock = TestBed.inject(ActiveConfigRoomsService) as
          AbstractActiveConfigRoomsService as ActiveConfigRoomsServiceMock;
        activeConfigRoomsService.updateRooms(rooms);
    }

    async function shouldAllowToJoinConfigRoom(room: ConfigRoom): Promise<void> {
        // Given a lobby with the given config room
        setActiveConfigRooms(MGPMap.from({ gameId: room }));
        testUtils.detectChanges();

        // When clicking on the first part
        await testUtils.clickElement('#part-0');

        // Then the component should have navigate to the part
        await expectValidRouting(router, ['/play', 'P4', 'gameId'], OnlineGameWrapperComponent);
    }

    async function shouldForbidToJoinConfigRoom(room: ConfigRoom, reason: string): Promise<void> {
        // Given a lobby with the given config room
        setActiveConfigRooms(MGPMap.from({ gameId: room }));
        testUtils.detectChanges();

        // When clicking on the first part
        // Then the refusal reason should be given
        await testUtils.expectToDisplayCriticalMessage(reason, async() => {
            await testUtils.clickElement('#part-0');
        });
    }

    describe('clicking on a game', () => {

        it('should redirect to /play when the user is allowed to participate to the game', fakeAsync(async() => {
            // Given a user not part of any game
            spyOn(currentGameService, 'canUserJoin').and.returnValue(MGPValidation.SUCCESS);
            testUtils.detectChanges();

            // And a lobby with one active config room
            // Then the user should be able to join
            await shouldAllowToJoinConfigRoom(configRoom);

        }));

        it('should forbid user to join a game if they are not allowed to participate', fakeAsync(async() => {
            // Given a user not allowed to participate to the game
            spyOn(currentGameService, 'canUserJoin').and.returnValue(MGPValidation.failure(GameActionFailure.YOU_ARE_ALREADY_PLAYING()));
            testUtils.detectChanges();

            // And a lobby with one active config room
            // Then the user should not be able to join
            await shouldForbidToJoinConfigRoom(configRoom, GameActionFailure.YOU_ARE_ALREADY_PLAYING());
        }));

    });

    it('should unsubscribe from active config rooms when destroying component', fakeAsync(async() => {
        // Given the lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(ActiveConfigRoomsService), 'subscribe');
        testUtils.detectChanges();
        tick(0);

        // When it is destroyed
        await component.ngOnDestroy();

        // Then it should have unsubscribed from active config rooms
        expectUnsubscribeToHaveBeenCalled();
    }));

    it('should unsubscribe from observed part when destroying component', fakeAsync(async() => {
        // Given an initialized lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(CurrentGameService), 'subscribeToCurrentGame');
        testUtils.detectChanges();
        tick(0);

        // When it is destroyed
        await component.ngOnDestroy();

        // Then it should have unsubscribed from active users
        expectUnsubscribeToHaveBeenCalled();
    }));

    it('should unsubscribe from error part when destroying component', fakeAsync(async() => {
        // Given an initialized lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(BackendService), 'setCallback');
        testUtils.detectChanges();
        tick(0);

        // When it is destroyed
        await component.ngOnDestroy();

        // Then it should have unsubscribed from active users
        expectUnsubscribeToHaveBeenCalled();
    }));

    it('should display game name for humans', fakeAsync(async() => {
        // Given a lobby with an existing game, with a game name different from their URL name
        testUtils.detectChanges();
        setActiveConfigRooms(MGPMap.from({ gameId: { ...configRoom, gameName: 'P4' } }));

        // When displaying it
        testUtils.detectChanges();

        // Then it should show the game name
        testUtils.expectElementToExist('#part-0 > .data-game-name');
        const gameName: DebugElement = testUtils.findElement('#part-0 > .data-game-name');
        expect(gameName.nativeElement.innerText).toEqual('Four in a Row');
    }));

    it('should display creator elo as a whole rounded number', fakeAsync(async() => {
        // Given a lobby with an existing game, with a creator elo
        testUtils.detectChanges();
        setActiveConfigRooms(MGPMap.from({ gameId: { ...configRoom, creatorElo: 12.67865 } }));

        // When displaying it
        testUtils.detectChanges();

        // Then it should show the creator elo as a whole number
        const creatorElo: DebugElement = testUtils.findElement('#part-of-creator');
        expect(creatorElo.nativeElement.innerText).toEqual('creator (13)');
    }));

    it('should show the chat when clicking on the corresponding tab', fakeAsync(async() => {
        // Given a lobby

        // When clicking on the chat tab
        await testUtils.clickElement('#tab-chat');
        tick(0);
        testUtils.detectChanges();

        // Then it should show the chat
        testUtils.expectElementToExist('#chat');
    }));
});

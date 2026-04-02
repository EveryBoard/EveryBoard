/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MGPOptional } from '@everyboard/lib';

import { UserDAO } from '../../../dao/UserDAO';
import { ConfigRoomMocks } from '../../../domain/ConfigRoomMocks.spec';
import { GameMocks } from '../../../domain/GameMocks.spec';
import { MinimalUser } from '../../../domain/MinimalUser';
import { UserMocks } from '../../../domain/UserMocks.spec';
import { P4Component } from '../../../games/p4/p4.component';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { AbstractConfigRoomService, ConfigRoomService } from '../../../services/ConfigRoomService';
import { ConnectedUserService } from '../../../services/ConnectedUserService';
import { AbstractGameService, GameService } from '../../../services/GameService';
import { ConfigRoomServiceMock } from '../../../services/tests/ConfigRoomServiceMock.spec';
import { ConnectedUserServiceMock } from '../../../services/tests/ConnectedUserService.spec';
import { GameServiceMock } from '../../../services/tests/GameServiceMock.spec';
import { ComponentTestUtils, expectValidRouting, prepareUnsubscribeCheck } from '../../../utils/tests/TestUtils.spec';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { NotFoundComponent } from '../../normal-component/not-found/not-found.component';
import { GameWrapperMessages } from '../GameWrapper';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';

describe('OnlineGameWrapper for non-existing game', () => {

    it('should redirect to /notFound', fakeAsync(async() => {
        // Given a game wrapper for a game that does not exist
        const testUtils: ComponentTestUtils<AbstractGameComponent, MinimalUser> =
            await ComponentTestUtils.basic('invalid-game');
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        testUtils.prepareFixture(OnlineGameWrapperComponent);
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
        await TestBed.inject(UserDAO).set(UserMocks.CONNECTED_AUTH_USER.id, UserMocks.CONNECTED);

        // When loading the component
        testUtils.detectChanges();
        tick(0);

        // Then it goes to /notFound with the expected error message
        const expectedRoute: string[] = ['/notFound', GameWrapperMessages.NO_MATCHING_GAME('invalid-game')];
        expectValidRouting(router, expectedRoute, NotFoundComponent, { skipLocationChange: true });

        discardPeriodicTasks();
    }));

});

describe('OnlineGameWrapperComponent Lifecycle', () => {

    // Life cycle summary
    // component construction (beforeEach)
    // stage 0
    // ngOnInit (triggered by detectChanges)
    // stage 1: GameCreationComponent appear
    // startGame, launched by user if game was not started yet, or automatically (via GameCreationComponent)
    // stage 2: GameCreationComponent disappears, game component appear
    // tick(0): the async part of startGame is now finished
    // stage 3: P4Component appear
    // differents scenarios

    let testUtils: ComponentTestUtils<P4Component, MinimalUser>;
    let wrapper: OnlineGameWrapperComponent;
    let configRoomService: ConfigRoomServiceMock;
    const config: RulesConfig = { width: 7, height: 6 };

    async function prepareComponent(accepted: boolean): Promise<void> {
        const userDAO: UserDAO = TestBed.inject(UserDAO);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        testUtils.detectChanges();

        if (accepted) {
            await startGame();
        } else {
            configRoomService.mockConfigRoomUpdate(ConfigRoomMocks.getInitial(MGPOptional.of(config)));
        }
    }

    async function startGame(): Promise<void> {
        configRoomService.mockConfigRoomUpdate(ConfigRoomMocks.withAcceptedConfig(MGPOptional.of(config)));
        testUtils.detectChanges();
        tick(2);
        testUtils.detectChanges();
        testUtils.bindGameComponent();
        testUtils.prepareSpies();

        const gameService: GameServiceMock =
            TestBed.inject(GameService) as AbstractGameService as GameServiceMock;
        await gameService.mockGameUpdate(GameMocks.STARTED);
        await gameService.mockGameEvent({
            timestamp: 0,
            user: UserMocks.CREATOR_MINIMAL_USER,
            eventType: 'Action',
            action: 'StartGame',
        }, 0);
    }

    async function finishTest(): Promise<void> {
        testUtils.detectChanges();
        tick(ConfigRoomMocks.getInitial(MGPOptional.empty()).moveDuration * 1000);
    }

    beforeEach(async() => {
        testUtils = await ComponentTestUtils.basic('P4');
        configRoomService =
            TestBed.inject(ConfigRoomService) as AbstractConfigRoomService as ConfigRoomServiceMock;
        ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER); // Normally, the header does that

        testUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = testUtils.getWrapper() as OnlineGameWrapperComponent;
        spyOn(TestBed.inject(ConnectedUserService), 'getIdToken').and.callFake(async() => {
            return 'idToken';
        });
    });

    describe('for creator', () => {

        it('should have GameCreationComponent calling startGame when config accepted', fakeAsync(async() => {
            // Given component where the game is not started
            spyOn(wrapper, 'startGame').and.callThrough();
            await prepareComponent(false);
            expect(wrapper.startGame).not.toHaveBeenCalled();

            // When the game starts
            await startGame();

            // Then startGame should be called
            expect(wrapper.startGame).toHaveBeenCalledTimes(1);

            testUtils.detectChanges(); // Needed so GameCreation is destroyed and game component created

            tick(wrapper.configRoom.moveDuration * 1000);
        }));

        it('should have a GameCreationComponent before starting', fakeAsync(async() => {
            // Given a component without accepted config
            await prepareComponent(false);
            // When the game is not started yet
            expect(wrapper.gameStarted).toBeFalse();
            // Then game creation should exist
            const gameCreationId: DebugElement = testUtils.findElement('#gameCreation');
            expect(gameCreationId).withContext('GameCreationComponent id should be present after ngOnInit').toBeTruthy();

            // Finish the game to have no timeout still running
            await finishTest();
        }));

        it('should not have game tags before starting', fakeAsync(async() => {
            // Given a component where the game is not started
            await prepareComponent(false);
            // When the game is not started yet
            expect(wrapper.gameStarted).toBeFalse();
            // Then the p4 and chat tags should not be present
            testUtils.expectElementNotToExist('app-p4');
            testUtils.expectElementNotToExist('app-chat');

            // Finish the game to have no timeout still running
            await finishTest();
        }));

        it('should replace GameCreationComponent by game tag upon game start', fakeAsync(async() => {
            // Given a component where the game is started
            await prepareComponent(true);
            // When it is loaded
            testUtils.detectChanges();

            // Then game creation is removed and game appears
            expect(wrapper.gameStarted).withContext('game should be started').toBeTrue();
            testUtils.expectElementNotToExist('#gameCreation');
            testUtils.expectElementToExist('#game');
            testUtils.expectElementToExist('app-p4');
        }));

    });

    describe('for ChosenOpponent', () => {
        it('should replace GameCreationComponent by game component upon start', fakeAsync(async() => {
            // Given a component loaded with non creator
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await prepareComponent(true);
            // When it is loaded
            testUtils.detectChanges();

            // Then game the game should appear
            expect(wrapper.gameStarted).withContext('game should be started').toBeTrue();
            testUtils.expectElementNotToExist('#gameCreation');
            testUtils.expectElementToExist('#game');
            testUtils.expectElementToExist('app-p4');
        }));

    });

    it('should unsubscribe from the game upon destruction', fakeAsync(async() => {
        // Given a started game
        const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(TestBed.inject(GameService), 'subscribeTo');

        await prepareComponent(true);

        // When the component is destroyed
        await wrapper.ngOnDestroy();

        // Then it unsubscribed from the game
        expectUnsubscribeToHaveBeenCalled();
    }));

});

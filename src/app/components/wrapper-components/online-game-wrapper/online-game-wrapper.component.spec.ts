/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { OnlineGameWrapperComponent, OnlineGameWrapperMessages } from './online-game-wrapper.component';
import { ConfigRoomService } from 'src/app/services/ConfigRoomService';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { ConfigRoom } from 'src/app/domain/ConfigRoom';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ComponentTestUtils, expectValidRouting, prepareUnsubscribeCheck } from 'src/app/utils/tests/TestUtils.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { P4Component } from 'src/app/games/p4/p4.component';
import { Part } from 'src/app/domain/Part';
import { NotFoundComponent } from '../../normal-component/not-found/not-found.component';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { GameWrapperMessages } from '../GameWrapper';
import { GameService } from 'src/app/services/GameService';
import { MinimalUser } from 'src/app/domain/MinimalUser';

describe('OnlineGameWrapper for non-existing game', () => {

    let testUtils: ComponentTestUtils<AbstractGameComponent, MinimalUser>;

    it('should redirect to /notFound', fakeAsync(async() => {
        // Given a game wrapper for a game that does not exist
        testUtils = await ComponentTestUtils.basic('invalid-game');
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        testUtils.prepareFixture(OnlineGameWrapperComponent);
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        await TestBed.inject(ConfigRoomDAO).set('configRoomId', ConfigRoomMocks.INITIAL);
        await TestBed.inject(PartDAO).set('configRoomId', { ...PartMocks.INITIAL, typeGame: 'invalid-game' });
        await TestBed.inject(ChatDAO).set('configRoomId', { });
        await TestBed.inject(UserDAO).set(UserMocks.CONNECTED_AUTH_USER.id, UserMocks.CONNECTED);
        testUtils.detectChanges();

        // When loading the component
        tick(1);

        // Then it goes to /notFound with the expected error message
        const expectedRoute: string[] = ['/notFound', GameWrapperMessages.NO_MATCHING_GAME('invalid-game')];
        expectValidRouting(router, expectedRoute, NotFoundComponent, { skipLocationChange: true });

        discardPeriodicTasks();
    }));
});

describe('OnlineGameWrapperComponent Lifecycle', () => {

    /* Life cycle summary
     * component construction (beforeEach)
     * stage 0
     * ngOnInit (triggered by detectChanges)
     * stage 1: PartCreationComponent appear
     * startGame, launched by user if game was not started yet, or automatically (via partCreationComponent)
     * stage 2: PartCreationComponent disappear, GameIncluderComponent appear
     * tick(1): the async part of startGame is now finished
     * stage 3: P4Component appear
     * differents scenarios
     */
    let testUtils: ComponentTestUtils<P4Component, MinimalUser>;
    let wrapper: OnlineGameWrapperComponent;
    let configRoomDAO: ConfigRoomDAO;

    async function prepareComponent(initialConfigRoom: ConfigRoom, initialPart: Part): Promise<void> {
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
        await configRoomDAO.set('configRoomId', initialConfigRoom);
        await TestBed.inject(PartDAO).set('configRoomId', initialPart);
        await TestBed.inject(ChatDAO).set('configRoomId', { });
        const userDAO: UserDAO = TestBed.inject(UserDAO);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        return Promise.resolve();
    }
    async function finishTest(): Promise<void> {
        testUtils.detectChanges();
        tick();
        await configRoomDAO.set('configRoomId', ConfigRoomMocks.WITH_ACCEPTED_CONFIG);
        testUtils.detectChanges();
        tick(ConfigRoomMocks.INITIAL.maximalMoveDuration * 1000);
    }
    describe('for creator', () => {
        beforeEach(async() => {
            testUtils = await ComponentTestUtils.basic('P4');
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER); // Normally, the header does that

            testUtils.prepareFixture(OnlineGameWrapperComponent);
            wrapper = testUtils.wrapper as OnlineGameWrapperComponent;
        });
        it('Initialization should lead to child component PartCreation to call ConfigRoomService', fakeAsync(async() => {
            // Given a starting component for the creator
            await prepareComponent(ConfigRoomMocks.INITIAL, PartMocks.INITIAL);
            const configRoomService: ConfigRoomService = TestBed.inject(ConfigRoomService);

            spyOn(configRoomService, 'joinGame').and.callThrough();
            spyOn(configRoomService, 'subscribeToChanges').and.callThrough();
            expect(wrapper.currentPartId).not.toBeDefined();
            expect(configRoomService.joinGame).not.toHaveBeenCalled();
            expect(configRoomService.subscribeToChanges).not.toHaveBeenCalled();

            // When ngOnInit runs to completion
            testUtils.detectChanges();
            tick();

            // Then joinGame and observe should have been called
            expect(wrapper.currentPartId).withContext('currentPartId should be defined').toBeDefined();
            expect(configRoomService.joinGame).toHaveBeenCalledOnceWith('configRoomId');
            expect(configRoomService.subscribeToChanges).toHaveBeenCalledTimes(1);

            // finish the game to have no timeout still running
            await finishTest();
        }));
        it('Initialization on accepted config should lead to PartCreationComponent to call startGame', fakeAsync(async() => {
            await prepareComponent(ConfigRoomMocks.WITH_ACCEPTED_CONFIG, PartMocks.INITIAL);
            testUtils.detectChanges();

            spyOn(wrapper, 'startGame').and.callThrough();
            expect(wrapper.startGame).not.toHaveBeenCalled();

            tick(); // Finish calling async code from PartCreationComponent initialization

            expect(wrapper.startGame).toHaveBeenCalledTimes(1);

            testUtils.detectChanges();
            // Needed so PartCreation is destroyed and GameIncluder Component created

            tick(1);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('Some tags are needed before initialization', fakeAsync(async() => {
            await prepareComponent(ConfigRoomMocks.INITIAL, PartMocks.INITIAL);
            expect(wrapper).toBeTruthy();
            const partCreationTag: DebugElement = testUtils.querySelector('app-part-creation');
            const gameIncluderTag: DebugElement = testUtils.querySelector('app-game-includer');
            const p4Tag: DebugElement = testUtils.querySelector('app-p4');
            const chatTag: DebugElement = testUtils.querySelector('app-chat');

            expect(wrapper.gameStarted).toBeFalse();
            expect(partCreationTag).withContext('app-part-creation tag should be absent at start').toBeFalsy();
            expect(gameIncluderTag).withContext('app-game-includer tag should be absent at start').toBeFalsy();
            expect(p4Tag).withContext('app-p4 tag should be absent at start').toBeFalsy();
            expect(chatTag).withContext('app-chat tag should be present at start').toBeTruthy();

            // finish the game to have no timeout still running
            await finishTest();
        }));
        it('Some ids are needed before initialization', fakeAsync(async() => {
            await prepareComponent(ConfigRoomMocks.INITIAL, PartMocks.INITIAL);
            const partCreationId: DebugElement = testUtils.findElement('#partCreation');
            const gameId: DebugElement = testUtils.findElement('#game');
            const chatId: DebugElement = testUtils.findElement('#chat');

            expect(wrapper.gameStarted).toBeFalse();
            expect(partCreationId).withContext('partCreation id should be present at start').toBeFalsy();
            expect(gameId).withContext('game id should be absent at start').toBeFalsy();
            expect(chatId).withContext('chat id should be present at start').toBeTruthy();

            // finish the game to have no timeout still running
            await finishTest();
        }));
        it('Initialization should make appear PartCreationComponent', fakeAsync(async() => {
            await prepareComponent(ConfigRoomMocks.INITIAL, PartMocks.INITIAL);
            let partCreationId: DebugElement = testUtils.findElement('#partCreation');
            expect(partCreationId).withContext('partCreation id should be absent before ngOnInit').toBeFalsy();

            testUtils.detectChanges();
            tick(1);

            partCreationId = testUtils.findElement('#partCreation');
            expect(partCreationId).withContext('partCreation id should be present after ngOnInit').toBeTruthy();

            // finish the game to have no timeout still running
            await finishTest();
        }));
        it('StartGame should replace PartCreationComponent by GameIncluderComponent', fakeAsync(async() => {
            await prepareComponent(ConfigRoomMocks.WITH_ACCEPTED_CONFIG, PartMocks.INITIAL);
            testUtils.detectChanges();
            tick();

            testUtils.detectChanges();

            const partCreationId: DebugElement = testUtils.findElement('#partCreation');
            const gameId: DebugElement = testUtils.findElement('#game');
            const p4Tag: DebugElement = testUtils.querySelector('app-p4');

            expect(wrapper.gameStarted).withContext('game should be started').toBeTrue();
            expect(partCreationId).withContext('partCreation id should be absent after startGame call').toBeFalsy();
            expect(gameId).withContext('game id should be present after startGame call').toBeTruthy();
            expect(p4Tag).withContext('p4Tag id should still be absent after startGame call').toBeNull();
            tick(2);
        }));
        it('stage three should make the game component appear at last', fakeAsync(async() => {
            await prepareComponent(ConfigRoomMocks.WITH_ACCEPTED_CONFIG, PartMocks.INITIAL);
            testUtils.detectChanges();
            tick();

            testUtils.detectChanges();
            expect(testUtils.querySelector('app-p4'))
                .withContext(`p4Tag id should be absent before startGame's async method has complete`)
                .toBeNull();

            tick(2);

            expect(testUtils.querySelector('app-p4'))
                .withContext(`p4Tag id should be present after startGame's async method has complete`)
                .toBeTruthy();
            tick(1000);
        }));
    });
    describe('for ChosenOpponent', () => {
        beforeEach(async() => {
            testUtils = await ComponentTestUtils.basic('P4');
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER); // Normally, the header does that

            testUtils.prepareFixture(OnlineGameWrapperComponent);
            wrapper = testUtils.wrapper as OnlineGameWrapperComponent;
        });
        xit('StartGame should replace PartCreationComponent by GameIncluderComponent', fakeAsync(async() => {
            // Given a component loaded with non creator
            await prepareComponent(ConfigRoomMocks.WITH_ACCEPTED_CONFIG, PartMocks.INITIAL);
            testUtils.detectChanges();
            tick();

            testUtils.detectChanges();

            const partCreationId: DebugElement = testUtils.findElement('#partCreation');
            const gameId: DebugElement = testUtils.findElement('#game');
            const p4Tag: DebugElement = testUtils.querySelector('app-p4');

            expect(partCreationId).withContext('partCreation id should be absent after startGame call').toBeFalsy();
            expect(gameId).withContext('game id should be present after startGame call').toBeTruthy();
            expect(p4Tag).withContext('p4Tag id should still be absent after startGame call').toBeNull();
            tick(1);
        }));
    });
    it('should redirect to /notFound if part does not exist', fakeAsync(async() => {
        testUtils = await ComponentTestUtils.basic('P4');
        ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);

        testUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = testUtils.wrapper as OnlineGameWrapperComponent;
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();
        await TestBed.inject(ChatDAO).set('configRoomId', { messages: [], status: `I don't have a clue` });
        testUtils.detectChanges();
        tick(3000); // Since a criticalToast will pop

        expectValidRouting(router, ['/notFound', OnlineGameWrapperMessages.NO_MATCHING_PART()], NotFoundComponent, { skipLocationChange: true });
    }));
    it('should unsubscribe from the part upon destruction', fakeAsync(async() => {
        // Given a started part
        testUtils = await ComponentTestUtils.basic('P4');
        ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER); // Normally, the header does that
        const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(TestBed.inject(GameService), 'subscribeToChanges');

        testUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = testUtils.wrapper as OnlineGameWrapperComponent;

        await prepareComponent(ConfigRoomMocks.WITH_ACCEPTED_CONFIG, PartMocks.INITIAL);
        testUtils.detectChanges();
        tick();
        testUtils.detectChanges();
        tick(2); // Need to wait for startPart to be called

        // When the component is destroyed
        await wrapper.ngOnDestroy();

        // Then it unsubscribed from the part
        expectUnsubscribeToHaveBeenCalled();
    }));
});

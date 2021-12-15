import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { JoinerService } from 'src/app/services/JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { IJoiner } from 'src/app/domain/ijoiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { P4Component } from 'src/app/games/p4/p4.component';
import { IPart } from 'src/app/domain/icurrentpart';

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
    let componentTestUtils: ComponentTestUtils<P4Component>;
    let wrapper: OnlineGameWrapperComponent;

    async function prepareComponent(initialJoiner: IJoiner, initialPart: IPart): Promise<void> {
        await TestBed.inject(JoinerDAO).set('joinerId', initialJoiner);
        await TestBed.inject(PartDAO).set('joinerId', initialPart);
        await TestBed.inject(ChatDAO).set('joinerId', { messages: [], status: `I don't have a clue` });
        return Promise.resolve();
    }
    beforeEach(async() => {
        componentTestUtils = await ComponentTestUtils.basic('P4');
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        componentTestUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as OnlineGameWrapperComponent;
    });
    describe('for creator', () => {
        it('Initialization should lead to child component PartCreation to call JoinerService', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.doc, PartMocks.INITIAL.doc);
            const joinerService: JoinerService = TestBed.inject(JoinerService);

            spyOn(joinerService, 'joinGame').and.callThrough();
            spyOn(joinerService, 'observe').and.callThrough();
            expect(wrapper.currentPartId).not.toBeDefined();
            expect(joinerService.joinGame).not.toHaveBeenCalled();
            expect(joinerService.observe).not.toHaveBeenCalled();

            componentTestUtils.detectChanges();
            tick();

            expect(wrapper.currentPartId).withContext('currentPartId should be defined').toBeDefined();
            expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
            expect(joinerService.observe).toHaveBeenCalledTimes(1);
        }));
        it('Initialization on accepted config should lead to PartCreationComponent to call startGame', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.doc, PartMocks.INITIAL.doc);
            componentTestUtils.detectChanges();

            spyOn(wrapper, 'startGame').and.callThrough();
            expect(wrapper.startGame).not.toHaveBeenCalled();

            tick(); // Finish calling async code from PartCreationComponent initialisation

            expect(wrapper.startGame).toHaveBeenCalledTimes(1);

            componentTestUtils.detectChanges();
            // Needed so PartCreation is destroyed and GameIncluder Component created

            tick(1);
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('Some tags are needed before initialisation', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.doc, PartMocks.INITIAL.doc);
            expect(wrapper).toBeTruthy();
            const partCreationTag: DebugElement = componentTestUtils.querySelector('app-part-creation');
            const gameIncluderTag: DebugElement = componentTestUtils.querySelector('app-game-includer');
            const p4Tag: DebugElement = componentTestUtils.querySelector('app-p4');
            const chatTag: DebugElement = componentTestUtils.querySelector('app-chat');

            expect(wrapper.gameStarted).toBeFalse();
            expect(partCreationTag).withContext('app-part-creation tag should be present at start').toBeFalsy();
            expect(gameIncluderTag).withContext('app-game-includer tag should be absent at start').toBeFalsy();
            expect(p4Tag).withContext('app-p4 tag should be absent at start').toBeFalsy();
            expect(chatTag).withContext('app-chat tag should be present at start').toBeTruthy();

            componentTestUtils.detectChanges();
            tick(1);
        }));
        it('Some ids are needed before initialisation', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.doc, PartMocks.INITIAL.doc);
            const partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
            const gameId: DebugElement = componentTestUtils.findElement('#game');
            const chatId: DebugElement = componentTestUtils.findElement('#chat');

            expect(wrapper.gameStarted).toBeFalse();
            expect(partCreationId).withContext('partCreation id should be present at start').toBeFalsy();
            expect(gameId).withContext('game id should be absent at start').toBeFalsy();
            expect(chatId).withContext('chat id should be present at start').toBeTruthy();

            componentTestUtils.detectChanges();
            tick(1);
        }));
        it('Initialization should make appear PartCreationComponent', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.INITIAL.doc, PartMocks.INITIAL.doc);
            let partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
            expect(partCreationId).withContext('partCreation id should be absent before ngOnInit').toBeFalsy();

            componentTestUtils.detectChanges();
            tick(1);

            partCreationId = componentTestUtils.findElement('#partCreation');
            expect(partCreationId).withContext('partCreation id should be present after ngOnInit').toBeTruthy();
        }));
        it('StartGame should replace PartCreationComponent by GameIncluderComponent', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.doc, PartMocks.INITIAL.doc);
            componentTestUtils.detectChanges();
            tick();

            componentTestUtils.detectChanges();

            const partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
            const gameId: DebugElement = componentTestUtils.findElement('#game');
            const p4Tag: DebugElement = componentTestUtils.querySelector('app-p4');

            expect(wrapper.gameStarted).toBeTrue();
            expect(partCreationId).withContext('partCreation id should be absent after startGame call').toBeFalsy();
            expect(gameId).withContext('game id should be present after startGame call').toBeTruthy();
            expect(p4Tag).withContext('p4Tag id should still be absent after startGame call').toBeNull();
            tick(1000);
        }));
        it('stage three should make the game component appear at last', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.doc, PartMocks.INITIAL.doc);
            componentTestUtils.detectChanges();
            tick();

            componentTestUtils.detectChanges();
            expect(componentTestUtils.querySelector('app-p4'))
                .withContext(`p4Tag id should be absent before startGame's async method has complete`)
                .toBeNull();

            tick(1);

            expect(componentTestUtils.querySelector('app-p4'))
                .withContext(`p4Tag id should be present after startGame's async method has complete`)
                .toBeTruthy();
            tick(1000);
        }));
    });
    describe('for chosenPlayer', () => {
        it('StartGame should replace PartCreationComponent by GameIncluderComponent', fakeAsync(async() => {
            await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.doc, PartMocks.INITIAL.doc);
            componentTestUtils.detectChanges();
            tick();

            componentTestUtils.detectChanges();

            const partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
            const gameId: DebugElement = componentTestUtils.findElement('#game');
            const p4Tag: DebugElement = componentTestUtils.querySelector('app-p4');

            expect(wrapper.gameStarted).toBeTrue();
            expect(partCreationId).withContext('partCreation id should be absent after startGame call').toBeFalsy();
            expect(gameId).withContext('game id should be present after startGame call').toBeTruthy();
            expect(p4Tag).withContext('p4Tag id should still be absent after startGame call').toBeNull();

            flush();
        }));
    });
    it('should redirect to index page if part does not exist', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        await TestBed.inject(ChatDAO).set('joinerId', { messages: [], status: `I don't have a clue` });
        componentTestUtils.detectChanges();
        tick();

        expect(router.navigate).toHaveBeenCalledOnceWith(['/notFound']);
    }));
});

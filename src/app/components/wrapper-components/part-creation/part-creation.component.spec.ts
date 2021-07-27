import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { PartCreationComponent } from './part-creation.component';
import { JoinerService } from 'src/app/services/JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { IPart } from 'src/app/domain/icurrentpart';
import { JoueursDAO } from 'src/app/dao/JoueursDAO';
import { IJoueur } from 'src/app/domain/iuser';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { FirstPlayer, PartStatus, PartType } from 'src/app/domain/ijoiner';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';
import { Utils } from 'src/app/utils/utils';

describe('PartCreationComponent:', () => {
    let testUtils: SimpleComponentTestUtils<PartCreationComponent>;
    let component: PartCreationComponent;

    let joinerDAOMock: JoinerDAO;
    let partDAOMock: PartDAOMock;
    let joueursDAOMock: JoueursDAO;

    const CREATOR: IJoueur = {
        pseudo: 'creator',
        state: 'online',
    };
    const OPPONENT: IJoueur = {
        pseudo: 'firstCandidate',
        state: 'online',
    };

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PartCreationComponent);
        const chatDAOMock: ChatDAO = TestBed.inject(ChatDAO);
        partDAOMock = TestBed.get(PartDAO);
        joinerDAOMock = TestBed.inject(JoinerDAO);
        joueursDAOMock = TestBed.inject(JoueursDAO);
        component = testUtils.getComponent();
        component.partId = 'joinerId';
        await chatDAOMock.set('joinerId', { messages: [], status: 'dummy status' });
        await joueursDAOMock.set('creator', CREATOR);
        await joueursDAOMock.set('opponent', OPPONENT);
        await partDAOMock.set('joinerId', PartMocks.INITIAL.doc);
    }));
    it('Player arrival on component should call joinGame and observe', fakeAsync(async() => {
        component.userName = 'creator';
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        spyOn(joinerService, 'joinGame').and.callThrough();
        spyOn(joinerService, 'observe').and.callThrough();
        testUtils.detectChanges();
        tick();
        await testUtils.whenStable();

        expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
        expect(joinerService.observe).toHaveBeenCalledTimes(1);
        expect(component).withContext('PartCreationComponent should have been created').toBeTruthy();
    }));
    it('Joiner arrival should change joiner doc', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        tick();
        testUtils.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.doc);
    }));
    it('Config proposal by creator should change joiner doc', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        await testUtils.whenStable();
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        await testUtils.whenStable();
        await joinerDAOMock.update('joinerId', {
            partStatus: PartStatus.PART_CREATED.value,
            candidates: ['firstCandidate'],
            chosenPlayer: 'firstCandidate',
        });
        // TODO: replace by real actor action (chooseCandidate)
        await testUtils.whenStable();
        testUtils.detectChanges();

        await component.proposeConfig();
        testUtils.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_PROPOSED_CONFIG.doc);
    }));
    it('(10) Config acceptation by joiner should change joiner doc and part doc', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges(); // joiner arrival
        await testUtils.whenStable();
        await joinerDAOMock.update('joinerId', {
            partStatus: PartStatus.PART_CREATED.value,
            candidates: ['firstCandidate'],
            chosenPlayer: 'firstCandidate',
        });
        await testUtils.whenStable();
        await joinerDAOMock.update('joinerId', {
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            maximalMoveDuration: 120,
            totalPartDuration: 1800,
            firstPlayer: FirstPlayer.CREATOR.value,
        });
        await testUtils.whenStable();
        testUtils.detectChanges();
        spyOn(component.gameStartNotification, 'emit');

        await component.acceptConfig();
        await testUtils.whenStable();
        testUtils.detectChanges();

        expect(component.gameStartNotification.emit).toHaveBeenCalledWith({
            ...JoinerMocks.WITH_ACCEPTED_CONFIG.doc,
            firstPlayer: FirstPlayer.CREATOR.value,
        });
        expect(component.currentJoiner).toEqual({
            ...JoinerMocks.WITH_ACCEPTED_CONFIG.doc,
            firstPlayer: FirstPlayer.CREATOR.value,
        });
        const currentPart: IPart = partDAOMock.getStaticDB().get('joinerId').get().subject.value.doc;
        const expectedPart: IPart = { ...PartMocks.STARTING.doc, beginning: currentPart.beginning };
        expect(currentPart).toEqual(expectedPart);
    }));
    describe('Form for creator', () => {
        beforeEach(fakeAsync(async() => {
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            tick();
            testUtils.detectChanges();
        }));
        describe('Handshake end', () => {
            it('when chosenPlayer leaves lobby, part creation should go back from start', fakeAsync(async() => {
                await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
                testUtils.detectChanges();
                component.selectOpponent('firstCandidate');
                testUtils.detectChanges();

                testUtils.expectElementToExist('#selected_firstCandidate');
                await joinerDAOMock.update('joinerId', {
                    partStatus: PartStatus.PART_CREATED.value,
                    chosenPlayer: '',
                    candidates: [],
                });
                testUtils.detectChanges();

                testUtils.expectElementNotToExist('#selected_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL.doc);
            }));
            it('when chosenPlayer disconnect, part creation should go back from start', fakeAsync(async() => {
                await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
                testUtils.detectChanges();
                tick();

                component.selectOpponent('firstCandidate');
                testUtils.detectChanges();
                tick();

                testUtils.expectElementToExist('#selected_firstCandidate');
                joueursDAOMock.update('opponent', { state: 'offline' });
                testUtils.detectChanges();
                tick();
                flush();

                testUtils.expectElementNotToExist('#selected_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL.doc);
            }));
        });
        it('should make candidate choice possible for creator when candidate arrives', fakeAsync(async() => {
            testUtils.expectElementNotToExist('#chooseCandidate');

            await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
            testUtils.detectChanges();
            tick();
            testUtils.detectChanges();
            await testUtils.whenStable();

            expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.doc);
            testUtils.expectElementToExist('#chooseCandidate');
        }));
        it('should make config proposal possible and change joiner doc when choosing candidate', fakeAsync(async() => {
            await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
            testUtils.detectChanges();
            testUtils.expectElementToExist('#presenceOf_firstCandidate');

            expect(testUtils.findElement('#proposeConfig').nativeElement.disabled)
                .withContext('Proposing config should be impossible before there is a chosenPlayer')
                .toBeTruthy();
            component.selectOpponent('firstCandidate');
            testUtils.detectChanges();

            testUtils.expectElementToExist('#selected_firstCandidate');
            expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_PLAYER.doc);
            expect(testUtils.findElement('#proposeConfig').nativeElement.disabled)
                .withContext('Choosing candidate should become possible after chosenPlayer is set')
                .toBeFalsy();
        }));
        it('should update the form data when changing first player', fakeAsync(async() => {
            testUtils.clickElement('#firstPlayerOpponent');

            expect(component.configFormGroup.get('firstPlayer').value).toEqual(FirstPlayer.CHOSEN_PLAYER.value);
        }));
        it('should show detailed timing options when choosing a custom part type', fakeAsync(async() => {
            await testUtils.clickElement('#partTypeCustom');
            testUtils.detectChanges();
            await testUtils.whenStable();
            tick();
            testUtils.detectChanges();
            tick();
            await testUtils.whenStable();

            testUtils.expectElementToExist('#customTime');
        }));
        it('should update the timings when selecting blitz part', fakeAsync(async() => {
            await testUtils.clickElement('#partTypeBlitz');
            testUtils.detectChanges();

            expect(component.configFormGroup.get('maximalMoveDuration').value).toBe(PartType.BLITZ_MOVE_DURATION);
            expect(component.configFormGroup.get('totalPartDuration').value).toBe(PartType.BLITZ_PART_DURATION);
        }));
        it('should update the timings when reselecting normal part', fakeAsync(async() => {
            await testUtils.clickElement('#partTypeBlitz');
            await testUtils.clickElement('#partTypeStandard');
            testUtils.detectChanges();

            expect(component.configFormGroup.get('maximalMoveDuration').value).toBe(PartType.NORMAL_MOVE_DURATION);
            expect(component.configFormGroup.get('totalPartDuration').value).toBe(PartType.NORMAL_PART_DURATION);
        }));
        it('should dispatch to joiner service when clicking on review config button', fakeAsync(async() => {
            await joinerDAOMock.update('joinerId', {
                partStatus: PartStatus.CONFIG_PROPOSED.value,
                maximalMoveDuration: 10,
                totalPartDuration: 60,
                firstPlayer: FirstPlayer.CREATOR.value,
            });
            testUtils.detectChanges();

            spyOn(joinerDAOMock, 'update');

            expectAsync(testUtils.clickElement('#reviewConfig')).toBeResolvedTo(true);
            testUtils.detectChanges();
            await testUtils.whenStable();

            expect(joinerDAOMock.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
            });
        }));
        it('should delete the game, joiner and chat when cancelling game', fakeAsync(async() => {
            const gameService: GameService = TestBed.inject(GameService);
            const joinerService: JoinerService = TestBed.inject(JoinerService);
            const chatService: ChatService = TestBed.inject(ChatService);
            spyOn(gameService, 'deletePart');
            spyOn(joinerService, 'deleteJoiner');
            spyOn(chatService, 'deleteChat');

            expectAsync(testUtils.clickElement('#cancel')).toBeResolvedTo(true);
            testUtils.detectChanges();
            await testUtils.whenStable();
            testUtils.detectChanges();
            tick(1);

            expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
            expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
            expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');

        }));
        it('should reroute to server when game is cancelled', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            // TODO: should use joinerDAOMock.delete('joinerId'), but that method is broken
            testUtils.getComponent()['onCurrentJoinerUpdate'](null);

            testUtils.detectChanges();
            await testUtils.whenStable();
            testUtils.detectChanges();
            tick(1);
            flush();

            expect(router.navigate).toHaveBeenCalledWith(['server']);
        }));
        it('should remember settings after a joiner update', fakeAsync(async() => {
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            await testUtils.whenStable();
            tick();
            testUtils.detectChanges();
            await testUtils.whenStable();
            tick();

            expectAsync(testUtils.clickElement('#firstPlayerCreator')).toBeResolvedTo(true);
            expectAsync(testUtils.clickElement('#partTypeBlitz')).toBeResolvedTo(true);

            // new candidate appears
            await joinerDAOMock.update('joinerId', {
                candidates: ['firstCandidate'],
            });

            testUtils.detectChanges();
            await testUtils.whenStable();
            tick();

            testUtils.expectElementToHaveClass('#firstPlayerCreator', 'is-selected');
            testUtils.expectElementToHaveClass('#partTypeBlitz', 'is-selected');
        }));
        it('should update candidate list when a non-chosen player leaves', fakeAsync(async() => {
            await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
            testUtils.detectChanges();
            tick();

            testUtils.expectElementToExist('#candidate_firstCandidate');
            await joueursDAOMock.update('opponent', { state: 'offline' });
            testUtils.detectChanges();
            tick();

            testUtils.expectElementNotToExist('#candidate_firstCandidate');
            expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL.doc);
        }));
    });
    describe('form for candidate', () => {
        beforeEach(fakeAsync(async() => {
            component.userName = 'firstCandidate';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            await testUtils.whenStable();
        }));
        it('should make config acceptation possible for joiner when config is proposed', fakeAsync(async() => {
            await joinerDAOMock.update('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
                candidates: [],
                chosenPlayer: 'firstCandidate',
            });
            testUtils.detectChanges();

            testUtils.expectElementNotToExist('#acceptConfig');
            await joinerDAOMock.update('joinerId', {
                partStatus: PartStatus.CONFIG_PROPOSED.value,
                maximalMoveDuration: 10,
                totalPartDuration: 60,
                firstPlayer: FirstPlayer.CREATOR.value,
            });
            testUtils.detectChanges();

            testUtils.expectElementToExist('#acceptConfig');
        }));
    });
    it('should delete part when observer sees that creator leaves', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        await testUtils.whenStable();
        testUtils.detectChanges();
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        testUtils.detectChanges();
        tick();

        const gameService: GameService = TestBed.inject(GameService);
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        const chatService: ChatService = TestBed.inject(ChatService);
        spyOn(gameService, 'deletePart');
        spyOn(joinerService, 'deleteJoiner');
        spyOn(chatService, 'deleteChat');

        await joueursDAOMock.update('creator', { state: 'offline' });
        testUtils.detectChanges();
        await testUtils.whenStable();
        tick();

        expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
        expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
        expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
    }));
    it('should delete part when creator is not there', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joueursDAOMock.update('creator', { state: 'offline' });
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        const gameService: GameService = TestBed.inject(GameService);
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        const chatService: ChatService = TestBed.inject(ChatService);
        spyOn(gameService, 'deletePart');
        spyOn(joinerService, 'deleteJoiner');
        spyOn(chatService, 'deleteChat');

        testUtils.detectChanges();
        await testUtils.whenStable();
        testUtils.detectChanges();
        tick();

        expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
        expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
        expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
    }));
    it('should not start observing joiner if part does not exist', fakeAsync(async() => {
        component.userName = 'creator';
        component.partId = 'does not exist';
        const joinerDAOMock: JoinerDAO = TestBed.inject(JoinerDAO);
        spyOn(joinerDAOMock, 'read').and.returnValue(Promise.resolve(null));
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        spyOn(joinerService, 'startObserving');

        testUtils.detectChanges();
        await testUtils.whenStable();

        expect(joinerService.startObserving).not.toHaveBeenCalled();
    }));
    it('should not fail if joiner update is null, and redirect to server', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        tick();
        testUtils.detectChanges();

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await joinerDAOMock.set('joinerId', null);

        testUtils.detectChanges();
        await testUtils.whenStable();
        flush();
        expect(router.navigate).toHaveBeenCalledWith(['server']);
    }));
    it('should see candidate disappear and reappear if candidates disconnects and reconnects');

    describe('graceful handling of unexpected situations', () => {
        beforeEach(() => {
            spyOn(Utils, 'handleError').and.callFake((): void => {
                return;
            });
        });
        xit('should remove part and treat as error to handle if creator is deleted', fakeAsync(async() => {
            component.userName = 'firstCandidate';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            tick();
            testUtils.detectChanges();

            const gameService: GameService = TestBed.inject(GameService);
            const joinerService: JoinerService = TestBed.inject(JoinerService);
            const chatService: ChatService = TestBed.inject(ChatService);
            spyOn(gameService, 'deletePart');
            spyOn(joinerService, 'deleteJoiner');
            spyOn(chatService, 'deleteChat');

            // TODO: mock's delete method is incorrect: it results in the call onDocumentModified([{}]) !
            // (onDocumentDeleted is actually completely ignored by the mock)
            await joueursDAOMock.delete('creator');
            testUtils.detectChanges();
            tick();
            testUtils.detectChanges();

            expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
            expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
            expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');

            expect(Utils.handleError).toHaveBeenCalledWith('OnlineGameWrapper: Creator was deleted: creator');
        }));
        xit('should remove candidate from lobby if it directly appears offline', fakeAsync(async() => {
            component.userName = 'creator';
            await joueursDAOMock.set('opponent', { ...OPPONENT, state: 'offline' });
            await joinerDAOMock.set('joinerId', { ...JoinerMocks.INITIAL.doc, candidates: ['firstCandidate'] });
            testUtils.detectChanges();
            tick(100);
            testUtils.detectChanges();
            tick(100);
            flush();

            testUtils.expectElementNotToExist('#presenceOf_firstCandidate');

            expect(Utils.handleError).toHaveBeenCalledWith('OnlineGameWrapper: firstCandidate is already offline!');
        }));
        xit('should not fail if an user has to be removed from the lobby but is not in it', fakeAsync(async() => {
            // This could happen if we receive twice the same update to a user that needs to be removed
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            await testUtils.whenStable();
            testUtils.detectChanges();

            await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
            testUtils.detectChanges();
            tick();

            await joueursDAOMock.update('opponent', { state: 'offline' });
            testUtils.detectChanges();
            tick();

            testUtils.expectElementNotToExist('#candidate_firstCandidate');
            expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL.doc);

            await joueursDAOMock.update('opponent', { state: 'offline', dummyField: true });
            testUtils.expectElementNotToExist('#candidate_firstCandidate');

            testUtils.detectChanges();
            tick();

            testUtils.expectElementNotToExist('#presenceOf_firstCandidate');
            expect(Utils.handleError).toHaveBeenCalledWith('OnlineGameWrapper: firstCandidate is already offline!');
        }));
        it('should remove candidate from lobby if it is deleted', fakeAsync(async() => {
        }));
    });
    afterEach(fakeAsync(async() => {
        testUtils.destroy();
        await testUtils.whenStable();
        tick();
    }));
});

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
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
import { FirstPlayer, IJoiner, PartStatus, PartType } from 'src/app/domain/ijoiner';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';

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
    it('(0) Player arrival on component should call joinGame and startObserving', fakeAsync(async() => {
        component.userName = 'creator';
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        spyOn(joinerService, 'joinGame').and.callThrough();
        spyOn(joinerService, 'startObserving').and.callThrough();

        testUtils.detectChanges();
        await testUtils.whenStable();

        expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
        expect(joinerService.startObserving).toHaveBeenCalledTimes(1);
        expect(component).withContext('PartCreationComponent should have been created').toBeTruthy();
    }));
    it('(1) Candidates arrival should make candidate choice possible for creator', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        await testUtils.whenStable();

        testUtils.expectElementNotToExist('#chooseCandidate');
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        testUtils.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.doc);
        testUtils.expectElementToExist('#chooseCandidate');
    }));
    it('(2) Joiner arrival should change joiner doc', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);

        testUtils.detectChanges();
        await testUtils.whenStable();

        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.doc);
    }));
    it('(3) (4) Candidate choice should change joiner doc and make config proposal possible', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        await testUtils.whenStable();
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
    describe('Handshake end', () => {
        it('when chosenPlayer leaves lobby, part creation should go back from start', fakeAsync(async() => {
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            tick();
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
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            tick();

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

            testUtils.expectElementNotToExist('#selected_firstCandidate');
            expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL.doc);
        }));
    });
    it('(8) Config proposal should make config acceptation possible for joiner', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        await testUtils.whenStable();
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
    it('(9) Config proposal by creator should change joiner doc', fakeAsync(async() => {
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
    describe('Form', () => {
        beforeEach(fakeAsync(async() => {
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            testUtils.detectChanges();
            await testUtils.whenStable();
            testUtils.detectChanges();
        }));
        it('should update the form data when changing first player', fakeAsync(async() => {
            testUtils.clickElement('#firstPlayerOpponent');

            expect(component.configFormGroup.get('firstPlayer').value).toEqual(FirstPlayer.CHOSEN_PLAYER.value);
        }));
        it('should show detailed timing options when choosing a custom part type', fakeAsync(async() => {
            testUtils.clickElement('#partTypeCustom');
            testUtils.detectChanges();

            testUtils.expectElementToExist('#customTime');
        }));
        it('should update the timings when selecting blitz part', () => {
            testUtils.clickElement('#partTypeBlitz');
            testUtils.detectChanges();

            expect(component.configFormGroup.get('maximalMoveDuration').value).toBe(PartType.BLITZ_MOVE_DURATION);
            expect(component.configFormGroup.get('totalPartDuration').value).toBe(PartType.BLITZ_PART_DURATION);
        });
        it('should update the timings when reselecting normal part', () => {
            testUtils.clickElement('#partTypeBlitz');
            testUtils.clickElement('#partTypeStandard');
            testUtils.detectChanges();

            expect(component.configFormGroup.get('maximalMoveDuration').value).toBe(PartType.NORMAL_MOVE_DURATION);
            expect(component.configFormGroup.get('totalPartDuration').value).toBe(PartType.NORMAL_PART_DURATION);
        });
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
        it('should delete the game, joiner, chat and reroute to server when cancelling game', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            const gameService: GameService = TestBed.inject(GameService);
            const joinerService: JoinerService = TestBed.inject(JoinerService);
            const chatService: ChatService = TestBed.inject(ChatService);
            spyOn(gameService, 'deletePart');
            spyOn(joinerService, 'deleteJoiner');
            spyOn(chatService, 'deleteChat');
            spyOn(router, 'navigate');

            expectAsync(testUtils.clickElement('#cancel')).toBeResolvedTo(true);
            testUtils.detectChanges();
            await testUtils.whenStable();
            tick(1);

            expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
            expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
            expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
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
    });
    it('should update candidate list when a non-chosen player leaves', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        await testUtils.whenStable();
        testUtils.detectChanges();
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
    it('should delete part when observer sees that creator has left', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        testUtils.detectChanges();
        await testUtils.whenStable();
        testUtils.detectChanges();
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        testUtils.detectChanges();
        tick();

        const router: Router = TestBed.inject(Router);
        const gameService: GameService = TestBed.inject(GameService);
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        const chatService: ChatService = TestBed.inject(ChatService);
        spyOn(gameService, 'deletePart');
        spyOn(joinerService, 'deleteJoiner');
        spyOn(chatService, 'deleteChat');
        spyOn(router, 'navigate');

        await joueursDAOMock.update('creator', { state: 'offline' });
        testUtils.detectChanges();
        await testUtils.whenStable();
        tick();

        expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
        expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
        expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
        expect(router.navigate).toHaveBeenCalledWith(['server']);
    }));
    it('should delete part when creator is not there');
    it('should show a message to observer when game is deleted');
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
    afterEach(fakeAsync(async() => {
        testUtils.destroy();
        await testUtils.whenStable();
        tick();
    }));
});

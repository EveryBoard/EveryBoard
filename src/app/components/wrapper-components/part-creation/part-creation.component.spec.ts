/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PartCreationComponent } from './part-creation.component';
import { JoinerService } from 'src/app/services/JoinerService';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { UserDAO } from 'src/app/dao/UserDAO';
import { Part } from 'src/app/domain/Part';
import { User } from 'src/app/domain/User';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { FirstPlayer, PartStatus, PartType } from 'src/app/domain/Joiner';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('PartCreationComponent:', () => {

    let testUtils: SimpleComponentTestUtils<PartCreationComponent>;
    let component: PartCreationComponent;

    let joinerDAOMock: JoinerDAO;
    let partDAOMock: PartDAO;
    let joueursDAOMock: UserDAO;
    let joinerService: JoinerService;
    let gameService: GameService;
    let chatService: ChatService;

    async function selectCustomGameAndChangeConfig(): Promise<void> {
        await testUtils.clickElement('#partTypeCustom');
        Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).setValue(100);
        Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).setValue(1000);
        testUtils.detectChanges();
    }
    async function mockCandidateArrival(): Promise<void> {
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        testUtils.detectChanges();
    }
    async function chooseOpponent(): Promise<void> {
        await component.selectOpponent('firstCandidate');
        testUtils.detectChanges();
    }
    const CREATOR: User = {
        username: 'creator',
        state: 'online',
        verified: true,
    };
    const OPPONENT: User = {
        username: 'firstCandidate',
        state: 'online',
        verified: true,
    };
    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PartCreationComponent);
        const chatDAOMock: ChatDAO = TestBed.inject(ChatDAO);
        partDAOMock = TestBed.inject(PartDAO);
        joinerDAOMock = TestBed.inject(JoinerDAO);
        joueursDAOMock = TestBed.inject(UserDAO);
        joinerService = TestBed.inject(JoinerService);
        gameService = TestBed.inject(GameService);
        chatService = TestBed.inject(ChatService);
        component = testUtils.getComponent();
        component.partId = 'joinerId';
        await chatDAOMock.set('joinerId', { messages: [], status: 'dummy status' });
        await joueursDAOMock.set('creator', CREATOR);
        await joueursDAOMock.set('opponent', OPPONENT);
        await partDAOMock.set('joinerId', PartMocks.INITIAL);
    }));
    describe('For creator', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Creator arrival on component', () => {
            it('should call joinGame and observe', fakeAsync(async() => {
                spyOn(joinerService, 'joinGame').and.callThrough();
                spyOn(joinerService, 'observe').and.callThrough();

                // When the component is loaded
                testUtils.detectChanges();
                await testUtils.whenStable();

                // Then joinGame and observe are called
                expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
                expect(joinerService.observe).toHaveBeenCalledTimes(1);
                expect(component).withContext('PartCreationComponent should have been created').toBeTruthy();
            }));
            it('should not start observing joiner if part does not exist', fakeAsync(async() => {
                // Given a part that does not exist
                component.partId = 'does not exist';
                spyOn(joinerDAOMock, 'read').and.resolveTo(MGPOptional.empty());
                spyOn(joinerService, 'observe');

                // When the component is loaded
                testUtils.detectChanges();
                await testUtils.whenStable();

                // Then observe is not called
                expect(joinerService.observe).not.toHaveBeenCalled();
            }));
        });
        describe('Candidate arrival', () => {
            it('should make candidate choice possible for creator when candidate arrives', fakeAsync(async() => {
                // Given a component that is loaded and there is no candidate
                testUtils.detectChanges();
                await testUtils.whenStable();
                testUtils.expectElementNotToExist('#chooseCandidate');

                // When the candidate arrives
                await mockCandidateArrival();

                // Then it is possible to choose a candidate
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
                testUtils.expectElementToExist('#chooseCandidate');
            }));
            it('should not see candidate change if it is modified', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                testUtils.expectElementToExist('#candidate_firstCandidate');

                // When the candidate user's document changes
                await joueursDAOMock.update('opponent', { last_changed: { seconds: 42, nanoseconds: 31415 } });
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then it is in the list of candidates
                testUtils.expectElementToExist('#candidate_firstCandidate');
            }));
        });
        describe('Candidate departure', () => {
            it('should go back to start when chosenPlayer leaves', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                testUtils.expectElementToExist('#selected_firstCandidate');

                // When the candidate leaves
                await joinerDAOMock.update('joinerId', {
                    partStatus: PartStatus.PART_CREATED.value,
                    chosenPlayer: null,
                    candidates: [],
                });
                testUtils.detectChanges();

                // Then it is not selected anymore
                testUtils.expectElementNotToExist('#selected_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
            }));
            it('should go back to start when chosenPlayer goes offline', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                testUtils.expectElementToExist('#selected_firstCandidate');

                // When the candidate goes offline
                await joueursDAOMock.update('opponent', { state: 'offline' });
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then it is not selected anymore
                testUtils.expectElementNotToExist('#selected_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
            }));
            it('should update candidate list when a non-chosen player leaves', fakeAsync(async() => {
                // Given a component that is loaded and there is a non-chosen candidate
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                testUtils.expectElementToExist('#candidate_firstCandidate');

                // When the candidate leaves
                await joueursDAOMock.update('opponent', { state: 'offline' });
                testUtils.detectChanges();

                // Then the candidate has disappeared and the joiner has been updated
                testUtils.expectElementNotToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
            }));
            it('should deselect candidate, remove it, and call handleError when a candidate is removed from db', fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake(() => {});

                // Given a part with a candidate that has been chosen
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                testUtils.expectElementToExist('#selected_firstCandidate');

                // When the candidate is deleted
                await joueursDAOMock.delete('opponent');
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then handleError has been called as this is an unusual situation
                expect(Utils.handleError).toHaveBeenCalledOnceWith('OnlineGameWrapper: firstCandidate was deleted (opponent)');
                // and the candidate has been deselected
                testUtils.expectElementNotToExist('#selected_firstCandidate');
                // and the candidate has been removed from the lobby
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
            }));
            it('should remove candidate from lobby if it directly appears offline', fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake(() => {});
                // Given a page that is loaded and there is no candidate yet
                testUtils.detectChanges();
                await testUtils.whenStable();

                // When the candidate joins but is directly offline
                await joueursDAOMock.set('opponent', { ...OPPONENT, state: 'offline' });
                await mockCandidateArrival();
                testUtils.detectChanges();
                await testUtils.whenStable();

                // Then the candidate does not appear on the page
                testUtils.expectElementNotToExist('#presenceOf_firstCandidate');
                // and handleError was called as this is an unexpected situation
                expect(Utils.handleError).toHaveBeenCalledWith('OnlineGameWrapper: firstCandidate is already offline!');
            }));
            it('should not fail if an user has to be removed from the lobby but is not in it', fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake(() => {});
                // This could happen if we receive twice the same update to a user that needs to be removed

                // Given a part creation with a candidate
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();

                // If the candidate updates twice with the offline status
                await joueursDAOMock.update('opponent', { state: 'offline' });
                testUtils.detectChanges();
                testUtils.expectElementNotToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);

                await joueursDAOMock.update('opponent', { state: 'offline', dummyField: true });
                testUtils.detectChanges();
                testUtils.expectElementNotToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);

                // Then it is not displayed among the candidates, and no error has been produced
                testUtils.expectElementNotToExist('#candidate_firstCandidate');
                expect(Utils.handleError).not.toHaveBeenCalled();
            }));
            it('should see candidate reappear if candidates disconnects and reconnects', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                testUtils.expectElementToExist('#candidate_firstCandidate');

                // When the candidate goes offline and then back online
                await joueursDAOMock.update('opponent', { state: 'offline' });
                testUtils.detectChanges();
                tick(3000); // needs to be >2999
                await joueursDAOMock.update('opponent', { state: 'online' });
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then it is in the list of candidates
                testUtils.expectElementNotToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
            }));
        });
        describe('Config proposal', () => {
            it('should send what creator sees, not what is stored in the joiner', fakeAsync(async() => {
                // Given a component where creator has changed the maximalMoveDuration and totalPartDuration
                testUtils.detectChanges();
                await testUtils.whenStable();
                testUtils.detectChanges();
                await selectCustomGameAndChangeConfig();

                // When a candidate arrives and is proposed a config
                await mockCandidateArrival();
                await chooseOpponent();
                spyOn(joinerDAOMock, 'update').and.callThrough();
                await component.proposeConfig();

                // Then the data sent should be what creator saw
                expect(joinerDAOMock.update).toHaveBeenCalledOnceWith('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.CUSTOM.value,
                    maximalMoveDuration: 100,
                    totalPartDuration: 1000,
                    chosenPlayer: 'firstCandidate',
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
            }));
            it('should support blitz part', fakeAsync(async() => {
                // Given a component with a candidate where blitz is selected
                testUtils.detectChanges();
                await mockCandidateArrival();
                await chooseOpponent();
                await testUtils.clickElement('#partTypeBlitz');

                spyOn(joinerDAOMock, 'update').and.callThrough();

                // When proposing the config
                await component.proposeConfig();
                testUtils.detectChanges();

                // The blitz should be part of it
                expect(joinerDAOMock.update).toHaveBeenCalledOnceWith('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.BLITZ.value,
                    maximalMoveDuration: 30,
                    totalPartDuration: 900,
                    chosenPlayer: 'firstCandidate',
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
            }));
            it('should change joiner doc', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();

                // When proposing config
                await component.proposeConfig();

                // Then currentJoiner should be updated with the proposed config
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_PROPOSED_CONFIG);
            }));
        });
        describe('Form interaction', () => {
            it('should modify joiner, make proposal possible, and select opponent when choosing opponent', fakeAsync(async() => {
                // Given a component with candidate present but not selected
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                testUtils.expectElementToExist('#presenceOf_firstCandidate');

                expect(testUtils.findElement('#proposeConfig').nativeElement.disabled)
                    .withContext('Proposing config should be impossible before there is a chosenPlayer')
                    .toBeTruthy();

                // When choosing the opponent
                await chooseOpponent();

                // Then joiner doc should be updated
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_PLAYER);
                // and proposal should now be possible
                expect(testUtils.findElement('#proposeConfig').nativeElement.disabled)
                    .withContext('Proposing config should become possible after chosenPlayer is set')
                    .toBeFalsy();
                // and opponent should be selected
                testUtils.expectElementToExist('#selected_firstCandidate');
            }));
            it('should update the form data when changing first player', fakeAsync(async() => {
                // Given a part being created
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();

                // When changing the first player
                await testUtils.clickElement('#firstPlayerOpponent');

                // Then form is updated
                const firstPlayer: string = Utils.getNonNullable(component.configFormGroup.get('firstPlayer')).value;
                expect(firstPlayer).toEqual(FirstPlayer.CHOSEN_PLAYER.value);
            }));
            it('should show detailed timing options when choosing a custom part type', fakeAsync(async() => {
                // Given a part being created
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();

                // When setting the part type to custom
                await testUtils.clickElement('#partTypeCustom');

                // Then the detailed timing options are shown
                testUtils.expectElementToExist('#customTime');
            }));
            it('should update the timings when selecting blitz part', fakeAsync(async() => {
                // Given a part creation
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();

                // When setting the part type to 'blitz'
                await testUtils.clickElement('#partTypeBlitz');
                testUtils.detectChanges();

                // Then the timings in the form are updated
                const maximalMoveDuration: number = Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).value;
                expect(maximalMoveDuration).toBe(PartType.BLITZ_MOVE_DURATION);
                const totalPartDuration: number = Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).value;
                expect(totalPartDuration).toBe(PartType.BLITZ_PART_DURATION);
            }));
            it('should update the timings when reselecting normal part', fakeAsync(async() => {
                // Given a part creation with blitz selected
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();
                await testUtils.clickElement('#partTypeBlitz');

                // When setting the part type back to standard
                await testUtils.clickElement('#partTypeStandard');

                // Then  the timings are updated
                const maximalMoveDuration: number = Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).value;
                expect(maximalMoveDuration).toBe(PartType.NORMAL_MOVE_DURATION);
                const totalPartDuration: number = Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).value;
                expect(totalPartDuration).toBe(PartType.NORMAL_PART_DURATION);
            }));
            it('should go back to created status when clicking on review config button', fakeAsync(async() => {
                // Given a part creation where the config has been proposed
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();
                await joinerDAOMock.update('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    maximalMoveDuration: 10,
                    totalPartDuration: 60,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                testUtils.detectChanges();

                spyOn(joinerDAOMock, 'update');

                // When the config is reviewed
                await testUtils.clickElement('#reviewConfig');

                // Then the part is set back to created
                expect(joinerDAOMock.update).toHaveBeenCalledWith('joinerId', {
                    partStatus: PartStatus.PART_CREATED.value,
                });
            }));
            it('should delete the game, joiner and chat when cancelling game', fakeAsync(async() => {
                // Given a part creation
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();

                spyOn(gameService, 'deletePart');
                spyOn(joinerService, 'deleteJoiner');
                spyOn(chatService, 'deleteChat');

                // When clicking on cancel
                await testUtils.clickElement('#cancel');

                // Then game, joiner, and chat are deleted
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');

            }));
            it('should remember settings after a joiner update', fakeAsync(async() => {
                // Given a part creation with some changes to the config
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();
                await testUtils.clickElement('#firstPlayerCreator');
                await testUtils.clickElement('#partTypeBlitz');

                // When a new candidate appears
                await mockCandidateArrival();

                // Then the config does not change
                testUtils.expectElementToHaveClass('#firstPlayerCreator', 'is-selected');
                testUtils.expectElementToHaveClass('#partTypeBlitz', 'is-selected');
            }));
        });
    });
    describe('Candidate', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component where user is a candidate
            component.userName = 'firstCandidate';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Arrival', () => {
            it('should change joiner doc', fakeAsync(async() => {
                spyOn(joinerDAOMock, 'update').and.callThrough();

                // When candidate arrives
                testUtils.detectChanges();
                tick();

                // Then the candidate is added to the joiner and the joiner is updated
                expect(joinerDAOMock.update).toHaveBeenCalledOnceWith('joinerId', {
                    candidates: ['firstCandidate'],
                });
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
            }));
        });
        describe('Creator leaves', () => {
            it('should delete part when observer sees that creator leaves', fakeAsync(async() => {
                spyOn(gameService, 'deletePart');
                spyOn(joinerService, 'deleteJoiner');
                spyOn(chatService, 'deleteChat');

                // Given a component with creator and candidate present
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();

                // When the creator goes offline
                await joueursDAOMock.update('creator', { state: 'offline' });
                testUtils.detectChanges();
                await testUtils.whenStable();

                // Then the part is deleted
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
            }));
            it('should delete part when creator is not there', fakeAsync(async() => {
                spyOn(gameService, 'deletePart').and.callThrough();
                spyOn(joinerService, 'deleteJoiner').and.callThrough();
                spyOn(chatService, 'deleteChat').and.callThrough();

                // Given a component where creator is offline
                await joueursDAOMock.update('creator', { state: 'offline' });
                await partDAOMock.set('joinerId', PartMocks.INITIAL);

                // When arriving on that component
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then the part and all its related data should be removed
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
            }));
        });
        describe('Waiting for config', () => {
            it('should reroute to server when game is cancelled', fakeAsync(async() => {
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate');

                // Given component that has loaded
                testUtils.detectChanges();
                await testUtils.whenStable();

                // When the joiner is deleted (because the game has been cancelled)
                await joinerDAOMock.delete('joinerId');

                // Then the user is rerouted to the server
                testUtils.detectChanges();
                tick(3000); // needs to be >2999
                expect(router.navigate).toHaveBeenCalledWith(['server']);
            }));
        });
        describe('Receiving config', () => {
            it('should make config acceptation possible for joiner when config is proposed', fakeAsync(async() => {
                // Given a part in creation where the candidate is chosen
                testUtils.detectChanges();
                await testUtils.whenStable();
                await joinerDAOMock.update('joinerId', {
                    partStatus: PartStatus.PART_CREATED.value,
                    candidates: [],
                    chosenPlayer: 'firstCandidate',
                });
                testUtils.detectChanges();
                testUtils.expectElementNotToExist('#acceptConfig');

                // When the config is proposed
                await joinerDAOMock.update('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    maximalMoveDuration: 10,
                    totalPartDuration: 60,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                testUtils.detectChanges();

                // Then the candidate can accept the config
                testUtils.expectElementToExist('#acceptConfig');
            }));
        });
        describe('Accepting config', () => {
            it('shoud change joiner and part', fakeAsync(async() => {
                spyOn(component.gameStartNotification, 'emit');
                // Given a part where the config has been proposed
                testUtils.detectChanges();
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

                // When accepting the config
                await component.acceptConfig();

                // Then the game start notification is emitted
                expect(component.gameStartNotification.emit).toHaveBeenCalledWith({
                    ...JoinerMocks.WITH_ACCEPTED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                // the joiner is updated
                expect(component.currentJoiner).toEqual({
                    ...JoinerMocks.WITH_ACCEPTED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                // and the part is set to starting
                const currentPart: Part = (await partDAOMock.read('joinerId')).get();
                const expectedPart: Part = { ...PartMocks.STARTING, beginning: currentPart.beginning };
                expect(currentPart).toEqual(expectedPart);
            }));
        });
    });
    afterEach(fakeAsync(async() => {
        testUtils.destroy();
        await testUtils.whenStable();
        tick();
    }));
});


describe('PartType', () => {
    it('Should map correctly with PartType.of', () => {
        expect(PartType.of('STANDARD').value).toBe('STANDARD');
        expect(PartType.of('BLITZ').value).toBe('BLITZ');
        expect(PartType.of('CUSTOM').value).toBe('CUSTOM');
        expect(() => PartType.of('caca')).toThrowError('Invalid part type: caca.');
    });
});

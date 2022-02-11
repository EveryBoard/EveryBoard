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
import { expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { FirstPlayer, MinimalUser, PartStatus, PartType } from 'src/app/domain/Joiner';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { UserService } from 'src/app/services/UserService';

fdescribe('PartCreationComponent:', () => {

    let testUtils: SimpleComponentTestUtils<PartCreationComponent>;
    let component: PartCreationComponent;

    let joinerDAOMock: JoinerDAO;
    let partDAOMock: PartDAO;
    let userDAOMock: UserDAO;
    let joinerService: JoinerService;
    let gameService: GameService;
    let chatService: ChatService;
    let userService: UserService;

    async function selectCustomGameAndChangeConfig(): Promise<void> {
        await testUtils.clickElement('#partTypeCustom');
        Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).setValue(100);
        Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).setValue(1000);
        testUtils.detectChanges();
    }
    async function mockCandidateArrival(): Promise<void> {
        // Require component.unsubscribeFrom at the end of function using it
        // Because when joiner arrive it get observed and if the unsubscription is not done by the end of the function
        // it is delegated to ngOnDestroy but karma will complain
        await joinerDAOMock.update('joinerId', { candidates: [OPPONENT_MINIMAL_USER] });
        testUtils.detectChanges();
    }
    async function acceptConfig(): Promise<void> {
        await testUtils.clickElement('#acceptConfig');
        testUtils.detectChanges();
    }
    async function proposeConfig(): Promise<void> {
        await testUtils.clickElement('#proposeConfig');
        testUtils.detectChanges();
    }
    async function chooseOpponent(): Promise<void> {
        await testUtils.clickElement('#presenceOf_' + OPPONENT.username);
        testUtils.detectChanges();
    }
    const CREATOR: User = {
        username: 'creator',
        state: 'online',
        verified: true,
    };
    const CREATOR_AUTH_USER: AuthUser = new AuthUser('creator-user-doc-id', MGPOptional.of('cre@tor'), MGPOptional.of('creator'), true);
    const OPPONENT_AUTH_USER: AuthUser = new AuthUser('firstCandidate-user-doc-id', MGPOptional.of('opp@nante'), MGPOptional.of('firstCandidate'), true);
    const OPPONENT: User = {
        username: OPPONENT_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    const OPPONENT_MINIMAL_USER: MinimalUser = {
        id: OPPONENT_AUTH_USER.userId,
        name: OPPONENT_AUTH_USER.username.get(),
    };
    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PartCreationComponent);
        const chatDAOMock: ChatDAO = TestBed.inject(ChatDAO);
        partDAOMock = TestBed.inject(PartDAO);
        joinerDAOMock = TestBed.inject(JoinerDAO);
        userDAOMock = TestBed.inject(UserDAO);
        joinerService = TestBed.inject(JoinerService);
        gameService = TestBed.inject(GameService);
        chatService = TestBed.inject(ChatService);
        userService = TestBed.inject(UserService);
        component = testUtils.getComponent();
        component.partId = 'joinerId';
        await chatDAOMock.set('joinerId', { messages: [], status: 'dummy status' });
        await userDAOMock.set(CREATOR_AUTH_USER.userId, CREATOR);
        await userDAOMock.set(OPPONENT_AUTH_USER.userId, OPPONENT);
        await partDAOMock.set('joinerId', PartMocks.INITIAL);
    }));
    describe('For creator:', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            component.authUser = CREATOR_AUTH_USER;
            // meaning that before clicking it, user was subscribed to himself
            userService.setObservedUserId(component.authUser.userId);
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Creator arrival on component:', () => {
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
                spyOn(joinerService, 'observe').and.callThrough();

                // When the component is loaded
                testUtils.detectChanges();
                await testUtils.whenStable();

                // Then observe is not called
                expect(joinerService.observe).not.toHaveBeenCalled();
            }));
        });
        describe('Candidate arrival:', () => {
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
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            it('should not see candidate change if it is modified', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                testUtils.expectElementToExist('#candidate_firstCandidate');

                // When the candidate user's document changes
                await userDAOMock.update(OPPONENT_AUTH_USER.userId,
                                         { last_changed: { seconds: 42, nanoseconds: 31415 } });
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then it is in the list of candidates
                testUtils.expectElementToExist('#candidate_firstCandidate');
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
        });
        describe('Candidate/chosen player departure (exit, disconnection and removal):', () => {
            it('should go back to start when chosenPlayer leaves', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                testUtils.expectElementToExist('#selected_' + OPPONENT.username);

                // When the candidate leaves
                await joinerDAOMock.update('joinerId', {
                    partStatus: PartStatus.PART_CREATED.value,
                    chosenPlayer: null,
                    candidates: [],
                });
                testUtils.detectChanges();

                // Then it is not selected anymore
                testUtils.expectElementNotToExist('#selected_' + OPPONENT.username);
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            it('should not go back to start when chosenPlayer goes offline', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                testUtils.expectElementToExist('#selected_' + OPPONENT.username);

                // When the candidate goes offline
                await userDAOMock.update(OPPONENT_AUTH_USER.userId,
                                         { state: 'offline' });
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then it is still selected
                testUtils.expectElementToExist('#selected_' + OPPONENT.username);
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            it('should not remove disconnected candidates from the list', fakeAsync(async() => {
                // Given a component that is loaded and there is a non-chosen candidate
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                testUtils.expectElementToExist('#candidate_firstCandidate');

                // When the candidate goes "offline"
                await userDAOMock.update(OPPONENT_AUTH_USER.userId,
                                         { state: 'offline' });
                testUtils.detectChanges();

                // Then the candidate has not disappeared and the joiner has been updated
                testUtils.expectElementToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            xit('should deselect candidate, remove it, and call handleError when a candidate is removed from db', fakeAsync(async() => {
                console.clear();
                spyOn(Utils, 'handleError').and.callFake(() => {});

                // Given a part with a candidate that has been chosen
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                testUtils.expectElementToExist('#selected_' + OPPONENT.username);

                // When the candidate is deleted
                await userDAOMock.delete(OPPONENT_AUTH_USER.userId);
                // testUtils.detectChanges();
                // tick(3000); // needs to be >2999

                // Then handleError has been called as this is an unusual situation
                const error: string = 'Assertion failure: found no user while observing firstCandidate-user-doc-id !';
                expect(Utils.handleError).toHaveBeenCalledOnceWith(error);
                // and the candidate has been deselected
                testUtils.expectElementNotToExist('#selected_' + OPPONENT.username);
                // and the candidate has been removed from the lobby
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            it('should not remove candidate from lobby if it directly appears offline', fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake(() => {});
                // Given a page that is loaded and there is no candidate yet
                testUtils.detectChanges();
                await testUtils.whenStable();

                // When the candidate joins but is directly offline
                await userDAOMock.set(OPPONENT_AUTH_USER.userId,
                                      { ...OPPONENT, state: 'offline' });
                await mockCandidateArrival();
                testUtils.detectChanges();
                await testUtils.whenStable();

                // Then the candidate does appear on the page
                testUtils.expectElementToExist('#presenceOf_firstCandidate');
                // and handleError was not called as this is an expected situation
                expect(Utils.handleError).not.toHaveBeenCalled();
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            it(`should not fail when receiving twice an 'offline' update`, fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake(() => {});

                // Given a part creation with a candidate
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();

                // When the candidate updates twice with the offline status
                await userDAOMock.update(OPPONENT_AUTH_USER.userId,
                                         { state: 'offline' });
                testUtils.detectChanges();
                testUtils.expectElementToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);

                await userDAOMock.update(OPPONENT_AUTH_USER.userId,
                                         { state: 'offline', dummyField: true });
                testUtils.detectChanges();
                testUtils.expectElementToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);

                // Then it is still displayed amongst the candidates, and no error has been produced
                // this is because we don't put too many trust in offline/online status since we had issue in the past
                testUtils.expectElementToExist('#candidate_firstCandidate');
                expect(Utils.handleError).not.toHaveBeenCalled();
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
        });
        describe('Config proposal:', () => {
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
                await proposeConfig();

                // Then the data sent should be what creator saw
                expect(joinerDAOMock.update).toHaveBeenCalledOnceWith('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.CUSTOM.value,
                    maximalMoveDuration: 100,
                    totalPartDuration: 1000,
                    chosenPlayer: OPPONENT_AUTH_USER.username.get(),
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            it('should support blitz part', fakeAsync(async() => {
                // Given a component with a candidate where blitz is selected
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                await testUtils.clickElement('#partTypeBlitz');

                spyOn(joinerDAOMock, 'update').and.callThrough();

                // When proposing the config
                await proposeConfig();
                testUtils.detectChanges();

                // The blitz should be part of it
                expect(joinerDAOMock.update).toHaveBeenCalledOnceWith('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.BLITZ.value,
                    maximalMoveDuration: 30,
                    totalPartDuration: 900,
                    chosenPlayer: OPPONENT_AUTH_USER.username.get(),
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
            it('should change joiner doc', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();

                // When proposing config
                await proposeConfig();

                // Then currentJoiner should be updated with the proposed config
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_PROPOSED_CONFIG);
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
        });
        describe('Form interaction:', () => {
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
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);
                // and proposal should now be possible
                expect(testUtils.findElement('#proposeConfig').nativeElement.disabled)
                    .withContext('Proposing config should become possible after chosenPlayer is set')
                    .toBeFalsy();
                // and opponent should be selected
                testUtils.expectElementToExist('#selected_' + OPPONENT.username);
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
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
                component.unsubscribeFrom(OPPONENT_AUTH_USER.userId);
            }));
        });
        describe('Cancelling part creation:', () => {
            it('should delete the game, joiner and chat', fakeAsync(async() => {
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
            xit('should ask UserService to remove observedPart', fakeAsync(async() => {
                // Given any part with a non started game
                testUtils.detectChanges();
                tick();
                testUtils.detectChanges();

                // When user cancel game creation
                spyOn(userService, 'removeObservedPart').and.callThrough();
                await testUtils.clickElement('#cancel');

                // then observedPart should be emptied
                expect(userService.removeObservedPart).toHaveBeenCalledOnceWith();
            }));
        });
    });
    describe('Candidate:', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component where user is a candidate
            component.authUser = OPPONENT_AUTH_USER;
            userService.setObservedUserId(component.authUser.userId);
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Arrival:', () => {
            it('should add user to joiner doc', fakeAsync(async() => {
                spyOn(joinerDAOMock, 'update').and.callThrough();

                // When candidate arrives
                testUtils.detectChanges();
                tick();

                // Then the candidate is added to the joiner and the joiner is updated
                expect(joinerDAOMock.update).toHaveBeenCalledOnceWith('joinerId', {
                    candidates: [OPPONENT_MINIMAL_USER],
                });
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
            }));
            it('should add partObserved to user doc', fakeAsync(async() => {
                // Given a partCreation
                spyOn(userDAOMock, 'update').and.callThrough();
                // When candidate arrives
                testUtils.detectChanges();
                tick();

                // Then observedPart in user doc should be set
                expect(userDAOMock.update).toHaveBeenCalledOnceWith(OPPONENT_AUTH_USER.userId, {
                    observedPart: 'joinerId',
                });
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
            }));
            xit('should not delete part when finding a disconnected creator', fakeAsync(async() => {
                spyOn(gameService, 'deletePart').and.callThrough();
                spyOn(joinerService, 'deleteJoiner').and.callThrough();
                spyOn(chatService, 'deleteChat').and.callThrough();

                // Given a component where creator is offline
                await userDAOMock.update(CREATOR_AUTH_USER.userId, { state: 'offline' });
                await partDAOMock.set('joinerId', PartMocks.INITIAL);

                // When arriving on that component
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then the part and all its related data should be removed
                expect(gameService.deletePart).not.toHaveBeenCalled();
                expect(joinerService.deleteJoiner).not.toHaveBeenCalled();
                expect(chatService.deleteChat).not.toHaveBeenCalled();
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
            }));
        });
        describe('Leaving:', () => {
            xit('should remove yourself when leaving the room', () => {
                // Given a partCreation where user is but candidate
                // When leaving the page
                // Then the joiner doc should be updated and user's name taken out of the candidate list
                expect('TODO').toBe('done');
            });
            xit('should set observedPart as empty when leaving the room', () => {
                // Given a partCreation where user is but candidate
                // When leaving the page
                // Then the user's doc should be updated and observedPart become empty
                expect('TODO').toBe('done');
            });
        });
        describe('Hoping to get chosen:', () => {
            it('should reroute to server when game is cancelled', fakeAsync(() => {
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate');

                // Given component that has loaded
                testUtils.detectChanges();
                tick(1);

                // When the joiner is deleted (because the game has been cancelled)
                void joinerDAOMock.delete('joinerId');
                console.log('>>>> (4) let us detectChange')
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then the user is rerouted to the server
                expectValidRouting(router, ['/lobby'], LobbyComponent);
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
            }));
            it('should not delete part when observer seeing that creator goes offline', fakeAsync(() => {
                spyOn(gameService, 'deletePart');
                spyOn(joinerService, 'deleteJoiner');
                spyOn(chatService, 'deleteChat');

                // Given a component with creator and candidate present
                testUtils.detectChanges();
                tick();

                // When the creator goes offline
                void userDAOMock.update(CREATOR_AUTH_USER.userId, { state: 'offline' });
                testUtils.detectChanges();

                // Then the part is not deleted
                expect(gameService.deletePart).not.toHaveBeenCalled();
                expect(joinerService.deleteJoiner).not.toHaveBeenCalled();
                expect(chatService.deleteChat).not.toHaveBeenCalled();
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
            }));
            it('should start sending presence token once selected as chosen opponent', fakeAsync(() => {
                // Given a partCreation where user is candidate
                spyOn(component, 'startSendingPresenceTokensIfNotDone').and.callThrough();
                testUtils.detectChanges();
                void testUtils.whenStable();
                tick(1);

                // When user is selected as chosen opponent
                void joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
                testUtils.detectChanges();
                tick(1);

                // Then "start sending token" should have been called
                expect(component.startSendingPresenceTokensIfNotDone).toHaveBeenCalledOnceWith();
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId); // TODOTODO must I remove the other one
                component.stopSendingPresenceTokensIfNeeded(); // To avoid finishing test with periodic timer in queue
            }));
        });
        fdescribe('As the Chosen opponent:', () => {
            fit('each 5 second a presence token should be sent', fakeAsync(() => {
                console.log('------------------------ TIME let us detectChanges ---------------------')
                // Given a partCreation were you are already chosen as candidate
                testUtils.detectChanges();
                console.log('------------------------ TIME let us tick() ---------------------')
                tick();
                testUtils.detectChanges();
                // console.log('------------------------ TIME let us BECOME CHOSEN OPPONENT ---------------------')
                void joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
                tick();
                console.log('------------------------ TIME let us tick( 2 * INTERVAL ) ---------------------')

                // When 5 sec pass
                spyOn(userDAOMock, 'updatePresenceToken').and.callThrough();
                tick(PartCreationComponent.TOKEN_INTERVAL * 2);
                console.log('------------------------ TIME let us stopSendingPresenceTokensIfNeeded ---------------------')

                // Then a presence token should be emitted
                expect(userDAOMock.updatePresenceToken).toHaveBeenCalledTimes(2);
                component.stopSendingPresenceTokensIfNeeded(); // To avoid finishing test with periodic timer in queue
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
                console.log('------------------------ TIME let us finish ---------------------')
            }));
            it('should make config acceptation possible for joiner when config is proposed', fakeAsync(async() => {
                // Given a part in creation where the candidate is chosen
                console.log('>>>> (1) let us detectChanges')
                testUtils.detectChanges();
                console.log('>>>> (2) let us await whenStable')
                await testUtils.whenStable();
                console.log('>>>> (3) let us mock OPPONENT CHOICE')
                await joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
                console.log('>>>> (4) let us detectChanges')
                testUtils.detectChanges();
                testUtils.expectElementNotToExist('#acceptConfig');

                // When the config is proposed
                console.log('>>>> (5) let us mock CONFIG PROPOSAL')
                await joinerDAOMock.update('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    maximalMoveDuration: 10,
                    totalPartDuration: 60,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                console.log('>>>> (6) let us detectChanges')
                testUtils.detectChanges();

                // Then the candidate can accept the config
                testUtils.expectElementToExist('#acceptConfig');
                console.log('>>>> (7) let us unsubscribe from creator')
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
                console.log('>>>> (8) let us stop sending token')
                component.stopSendingPresenceTokensIfNeeded(); // To avoid finishing test with periodic timer in queue
            }));
            it('accepting config shoud change joiner and part', fakeAsync(async() => {
                spyOn(component.gameStartNotification, 'emit');
                // Given a part where the config has been proposed with creator as first player
                testUtils.detectChanges();
                await testUtils.whenStable();
                await joinerDAOMock.update('joinerId', {
                    ...JoinerMocks.WITH_PROPOSED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                testUtils.detectChanges();

                // When accepting the config
                await acceptConfig();
                await testUtils.whenStable();

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
                component.unsubscribeFrom(CREATOR_AUTH_USER.userId);
                component.stopSendingPresenceTokensIfNeeded(); // To avoid finishing test with periodic timer in queue
            }));
            it('should stop sending token when no longer chosen opponent', fakeAsync(async() => {
                // Given a component where user is chosen opponent
                testUtils.detectChanges();
                await testUtils.whenStable();
                await joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
                testUtils.detectChanges();

                // When an update notify user that he is no longer chosen opponent
                spyOn(component, 'stopSendingPresenceTokensIfNeeded').and.callThrough();
                await joinerDAOMock.update('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE);
                testUtils.detectChanges();

                // Then stopSendingPresenceTokensIfNeeded should have been called
                expect(component.stopSendingPresenceTokensIfNeeded).toHaveBeenCalledOnceWith();
            }));
        });
    });
    afterEach(fakeAsync(async() => {
        console.log('>>>>>>>> let us destroy')
        testUtils.destroy();
        console.log('>>>>>>>> let us await whenStable 3')
        await testUtils.whenStable();
        console.log('>>>>>>>> let us tick')
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

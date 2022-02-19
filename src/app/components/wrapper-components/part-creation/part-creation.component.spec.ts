/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { PartCreationComponent } from './part-creation.component';
import { JoinerService } from 'src/app/services/JoinerService';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { UserDAO } from 'src/app/dao/UserDAO';
import { Part } from 'src/app/domain/Part';
import { expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { FirstPlayer, Joiner, PartStatus, PartType } from 'src/app/domain/Joiner';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';
import { UserService } from 'src/app/services/UserService';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { DebugElement } from '@angular/core';

describe('PartCreationComponent:', () => {

    let testUtils: SimpleComponentTestUtils<PartCreationComponent>;
    let component: PartCreationComponent;

    let joinerDAO: JoinerDAO;
    let partDAO: PartDAO;
    let userDAO: UserDAO;
    let chatDAO: ChatDAO;
    let joinerService: JoinerService;
    let gameService: GameService;
    let chatService: ChatService;
    let userService: UserService;

    function mockCandidateArrival(): void {
        receiveJoinerUpdate({ candidates: [UserMocks.OPPONENT_MINIMAL_USER] });
    }
    function receiveJoinerUpdate(update: Partial<Joiner>): void {
        void joinerDAO.update('joinerId', update);
        tick();
    }
    function proposeConfig(): void {
        clickElement('#proposeConfig');
    }
    function chooseOpponent(): void {
        clickElement('#presenceOf_' + UserMocks.OPPONENT.username);
    }
    function awaitComponentInitialisation(): void {
        // Once tick is executed, ngOnInit of the PartCreationComponent is normally over
        testUtils.detectChanges();
        tick();
    }
    function clickElement(elementName: string): void {
        testUtils.detectChanges();
        void testUtils.clickElement(elementName); // TODOTODO FOR REVIEW: put that in testUtils but not with tick()
        tick();
    }
    function expectElementToExist(elementName: string): void { // TODOTODO FOR REVIEW: put that in testUtils
        testUtils.detectChanges();
        testUtils.expectElementToExist(elementName);
    }
    function expectElementNotToExist(elementName: string): void { // TODOTODO FOR REVIEW: put that in testUtils
        testUtils.detectChanges();
        testUtils.expectElementNotToExist(elementName);
    }
    function findElement(elementName: string): DebugElement { // TODOTODO FOR REVIEW: put that in testUtils
        testUtils.detectChanges();
        return testUtils.findElement(elementName);
    }
    function expectElementToHaveClass(elementName: string, classes: string): void {
        // TODOTODO FOR REVIEW: put that in testUtils
        testUtils.detectChanges();
        testUtils.expectElementToHaveClass(elementName, classes);
    }
    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PartCreationComponent);
        chatDAO = TestBed.inject(ChatDAO);
        partDAO = TestBed.inject(PartDAO);
        joinerDAO = TestBed.inject(JoinerDAO);
        userDAO = TestBed.inject(UserDAO);
        joinerService = TestBed.inject(JoinerService);
        gameService = TestBed.inject(GameService);
        chatService = TestBed.inject(ChatService);
        userService = TestBed.inject(UserService);
        component = testUtils.getComponent();
        component.partId = 'joinerId';
        await chatDAO.set('joinerId', { messages: [], status: 'dummy status' });
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.userId, UserMocks.CREATOR);
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.userId, UserMocks.OPPONENT);
        await partDAO.set('joinerId', PartMocks.INITIAL);
    }));
    describe('For creator:', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            component.authUser = UserMocks.CREATOR_AUTH_USER;
            // meaning that before clicking it, user was subscribed to himself
            userService.setObservedUserId(component.authUser.userId);
            await joinerDAO.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Creator arrival on component:', () => {
            it('should call joinGame and observe', fakeAsync(() => {
                spyOn(joinerService, 'joinGame').and.callThrough();
                spyOn(joinerService, 'observe').and.callThrough();

                // When the component is loaded
                awaitComponentInitialisation();

                // Then joinGame and observe are called
                expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
                expect(joinerService.observe).toHaveBeenCalledTimes(1);
                expect(component).withContext('PartCreationComponent should have been created').toBeTruthy();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not start observing joiner if part does not exist', fakeAsync(() => {
                // Given a part that does not exist
                component.partId = 'does not exist';
                spyOn(joinerDAO, 'read').and.resolveTo(MGPOptional.empty());
                spyOn(joinerService, 'observe').and.callThrough();

                // When the component is loaded
                awaitComponentInitialisation();

                // Then observe is not called
                expect(joinerService.observe).not.toHaveBeenCalled();
            }));
        });
        describe('Candidate arrival:', () => {
            it('should make candidate choice possible for creator when candidate arrives', fakeAsync(() => {
                // Given a component that is loaded and there is no candidate
                awaitComponentInitialisation();
                expectElementNotToExist('#chooseCandidate');

                // When the candidate arrives
                mockCandidateArrival();

                // Then it is possible to choose a candidate
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
                expectElementToExist('#chooseCandidate');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not see candidate change if it is modified', fakeAsync(() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                awaitComponentInitialisation();
                mockCandidateArrival();
                expectElementToExist('#candidate_firstCandidate');

                // When the candidate user's document changes
                void userDAO.update(UserMocks.OPPONENT_AUTH_USER.userId,
                                    { last_changed: { seconds: 42, nanoseconds: 31415 } });
                tick();

                // Then it is in the list of candidates
                expectElementToExist('#candidate_firstCandidate');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Candidate/chosen player departure (exit, disconnection and removal):', () => {
            it('should go back to start when chosenPlayer leaves', fakeAsync(() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                awaitComponentInitialisation();
                mockCandidateArrival();
                chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);

                // When the candidate leaves
                receiveJoinerUpdate({
                    partStatus: PartStatus.PART_CREATED.value,
                    chosenPlayer: null,
                    candidates: [],
                });

                // Then it is not selected anymore
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not go back to start when chosenPlayer goes offline', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                awaitComponentInitialisation();
                mockCandidateArrival();
                chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);

                // When the candidate goes offline
                await userDAO.update(UserMocks.OPPONENT_AUTH_USER.userId, { state: 'offline' });

                // Then it is still selected
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not remove disconnected candidates from the list', fakeAsync(async() => {
                // Given a component that is loaded and there is a non-chosen candidate
                awaitComponentInitialisation();
                mockCandidateArrival();
                expectElementToExist('#candidate_firstCandidate');

                // When the candidate goes "offline"
                await userDAO.update(UserMocks.OPPONENT_AUTH_USER.userId, { state: 'offline' });

                // Then the candidate has not disappeared and the joiner has been updated
                expectElementToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should deselect candidate, remove it, and call handleError when a candidate is removed from db', fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake((message: string) => {
                    console.log('MOCK HANDLE ERROR CALLED WITH: ' + message)
                });
                // Given a part with a candidate that has been chosen
                awaitComponentInitialisation();
                mockCandidateArrival();
                chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);

                // When the candidate is deleted
                await userDAO.delete(UserMocks.OPPONENT_AUTH_USER.userId);
                tick();

                // Then handleError has been called as this is an unusual situation
                const error: string = 'found no user while observing firstCandidate-user-doc-id !';
                expect(Utils.handleError).toHaveBeenCalledOnceWith(error);
                // and the candidate has been deselected
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                // and the candidate has been removed from the lobby
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                tick(3000); // Even with the mock it waits 3000 though
            }));
            it('should not remove candidate from lobby if it directly appears offline', fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake(() => {});
                // Given a page that is loaded and there is no candidate yet
                awaitComponentInitialisation();

                // When the candidate joins but is directly offline
                await userDAO.update(UserMocks.OPPONENT_AUTH_USER.userId, { state: 'offline' });
                mockCandidateArrival();

                // Then the candidate does appear on the page
                expectElementToExist('#presenceOf_firstCandidate');
                // and handleError was not called as this is an expected situation
                expect(Utils.handleError).not.toHaveBeenCalled();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it(`should not fail when receiving twice an 'offline' update`, fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake((message: string) => { console.log('HANDLE ERROR: ' + message)});

                // Given a part creation with a candidate
                awaitComponentInitialisation();
                mockCandidateArrival();

                // When the candidate updates twice with the offline status
                await userDAO.update(UserMocks.OPPONENT_AUTH_USER.userId, { state: 'offline' });
                expectElementToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);

                await userDAO.update(UserMocks.OPPONENT_AUTH_USER.userId, { state: 'offline', dummyField: true });
                expectElementToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);

                // Then it is still displayed amongst the candidates, and no error has been produced
                // this is because we don't put too many trust in offline/online status since we had issue in the past
                expectElementToExist('#candidate_firstCandidate');
                expect(Utils.handleError).not.toHaveBeenCalled();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Config proposal:', () => {
            it('should send what creator sees, not what is stored in the joiner', fakeAsync(() => {
                // Given a component where creator has changed the maximalMoveDuration and totalPartDuration
                awaitComponentInitialisation();
                clickElement('#partTypeCustom');
                Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).setValue(100);
                Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).setValue(1000);

                // When a candidate arrives and is proposed a config
                mockCandidateArrival();
                chooseOpponent();
                spyOn(joinerDAO, 'update').and.callThrough();
                proposeConfig();

                // Then the data sent should be what creator saw
                expect(joinerDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.CUSTOM.value,
                    maximalMoveDuration: 100,
                    totalPartDuration: 1000,
                    chosenPlayer: UserMocks.OPPONENT_AUTH_USER.username.get(),
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should support blitz part', fakeAsync(() => {
                // Given a component with a candidate where blitz is selected
                awaitComponentInitialisation();
                mockCandidateArrival();
                chooseOpponent();
                clickElement('#partTypeBlitz');

                spyOn(joinerDAO, 'update').and.callThrough();

                // When proposing the config
                proposeConfig();

                // The blitz should be part of it
                expect(joinerDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.BLITZ.value,
                    maximalMoveDuration: 30,
                    totalPartDuration: 900,
                    chosenPlayer: UserMocks.OPPONENT_AUTH_USER.username.get(),
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should change joiner doc', fakeAsync(() => {
                // Given a component where creator selected a config and chose an opponent
                awaitComponentInitialisation();
                mockCandidateArrival();
                chooseOpponent();

                // When proposing config
                proposeConfig();

                // Then currentJoiner should be updated with the proposed config
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_PROPOSED_CONFIG);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Form interaction:', () => {
            it('should modify joiner, make proposal possible, and select opponent when choosing opponent', fakeAsync(() => {
                // Given a component with candidate present but not selected
                awaitComponentInitialisation();
                mockCandidateArrival();
                expectElementToExist('#presenceOf_firstCandidate');

                const contextBefore: string = 'Proposing config should be impossible before there is a chosenPlayer';
                expect(findElement('#proposeConfig').nativeElement.disabled).withContext(contextBefore).toBeTruthy();

                // When choosing the opponent
                chooseOpponent();

                // Then joiner doc should be updated
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // and proposal should now be possible
                const proposeConfigDisabled: boolean = findElement('#proposeConfig').nativeElement.disabled;
                const contextAfter: string = 'Proposing config should become possible after chosenPlayer is set';
                expect(proposeConfigDisabled).withContext(contextAfter).toBeFalse();

                // and opponent should be selected
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should update the form data when changing first player', fakeAsync(() => {
                // Given a part being created
                awaitComponentInitialisation();

                // When changing the first player
                clickElement('#firstPlayerOpponent');

                // Then form is updated
                const firstPlayer: string = Utils.getNonNullable(component.configFormGroup.get('firstPlayer')).value;
                expect(firstPlayer).toEqual(FirstPlayer.CHOSEN_PLAYER.value);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should show detailed timing options when choosing a custom part type', fakeAsync(() => {
                // Given a part being created
                awaitComponentInitialisation();

                // When setting the part type to custom
                clickElement('#partTypeCustom');

                // Then the detailed timing options are shown
                expectElementToExist('#customTime');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should update the timings when selecting blitz part', fakeAsync(async() => {
                // Given a part creation
                awaitComponentInitialisation();

                // When setting the part type to 'blitz'
                clickElement('#partTypeBlitz');
                testUtils.detectChanges();

                // Then the timings in the form are updated
                const maximalMoveDuration: number = Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).value;
                expect(maximalMoveDuration).toBe(PartType.BLITZ_MOVE_DURATION);
                const totalPartDuration: number = Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).value;
                expect(totalPartDuration).toBe(PartType.BLITZ_PART_DURATION);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should update the timings when reselecting normal part', fakeAsync(() => {
                // Given a part creation with blitz selected
                awaitComponentInitialisation();
                clickElement('#partTypeBlitz');

                // When setting the part type back to standard
                clickElement('#partTypeStandard');

                // Then  the timings are updated
                const maximalMoveDuration: number = Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).value;
                expect(maximalMoveDuration).toBe(PartType.NORMAL_MOVE_DURATION);
                const totalPartDuration: number = Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).value;
                expect(totalPartDuration).toBe(PartType.NORMAL_PART_DURATION);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should go back to created status when clicking on review config button', fakeAsync(() => {
                // Given a part creation where the config has been proposed
                awaitComponentInitialisation();
                receiveJoinerUpdate({
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    maximalMoveDuration: 10,
                    totalPartDuration: 60,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });

                spyOn(joinerDAO, 'update');

                // When the config is reviewed
                clickElement('#reviewConfig');

                // Then the part is set back to created
                expect(joinerDAO.update).toHaveBeenCalledWith('joinerId', {
                    partStatus: PartStatus.PART_CREATED.value,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should remember settings after a joiner update', fakeAsync(() => {
                // Given a part creation with some changes to the config
                awaitComponentInitialisation();
                clickElement('#firstPlayerCreator');
                clickElement('#partTypeBlitz');

                // When a new candidate appears
                mockCandidateArrival();

                // Then the config does not change
                expectElementToHaveClass('#firstPlayerCreator', 'is-selected');
                expectElementToHaveClass('#partTypeBlitz', 'is-selected');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Cancelling part creation:', () => {
            it('should delete the game, joiner and chat', fakeAsync(() => {
                // Given a part creation
                awaitComponentInitialisation();

                spyOn(gameService, 'deletePart');
                spyOn(joinerService, 'deleteJoiner');
                spyOn(chatService, 'deleteChat');

                // When clicking on cancel
                clickElement('#cancel');

                // Then game, joiner, and chat are deleted
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should ask UserService to remove observedPart', fakeAsync(async() => {
                // Given any part with a non started game
                awaitComponentInitialisation();

                // When user cancel game creation
                spyOn(userService, 'removeObservedPart').and.callThrough();
                clickElement('#cancel');

                // then observedPart should be emptied
                expect(userService.removeObservedPart).toHaveBeenCalledOnceWith();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                // SO THE DESTRUCTION DON'T THROW ??? TODOTODO: check that it don't actually throw at user's place
                void partDAO.set('joinerId', PartMocks.INITIAL);
                void joinerDAO.set('joinerId', JoinerMocks.INITIAL);
                void chatDAO.set('joinerId', { messages: [], status: 'dummy status' });
                flush();
            }));
        });
    });
    describe('Candidate:', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component where user is a candidate
            component.authUser = UserMocks.OPPONENT_AUTH_USER;
            userService.setObservedUserId(component.authUser.userId);
            await joinerDAO.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Arrival:', () => {
            it('should add user to joiner doc', fakeAsync(() => {
                spyOn(joinerDAO, 'update').and.callThrough();

                // When candidate arrives
                awaitComponentInitialisation();

                // Then the candidate is added to the joiner and the joiner is updated
                expect(joinerDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    candidates: [UserMocks.OPPONENT_MINIMAL_USER],
                });
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
            }));
            it('should add partObserved to user doc', fakeAsync(() => {
                // Given a partCreation
                spyOn(userDAO, 'update').and.callThrough();

                // When candidate arrives
                awaitComponentInitialisation();

                // Then observedPart in user doc should be set
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.OPPONENT_AUTH_USER.userId, {
                    observedPart: 'joinerId',
                });
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
            }));
            it('should not delete part when finding a disconnected creator', fakeAsync(async() => {
                spyOn(gameService, 'deletePart').and.callThrough();
                spyOn(joinerService, 'deleteJoiner').and.callThrough();
                spyOn(chatService, 'deleteChat').and.callThrough();

                // Given a component where creator is offline
                await userDAO.update(UserMocks.CREATOR_AUTH_USER.userId, { state: 'offline' });
                await partDAO.set('joinerId', PartMocks.INITIAL);

                // When arriving on that component
                testUtils.detectChanges();
                tick(3000); // needs to be >2999 // TODOTODO FOR REVIEW check that it just toasted

                // Then the part and all its related data should be removed
                expect(gameService.deletePart).not.toHaveBeenCalled();
                expect(joinerService.deleteJoiner).not.toHaveBeenCalled();
                expect(chatService.deleteChat).not.toHaveBeenCalled();
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
            }));
        });
        describe('Leaving:', () => {
            it('should remove yourself when leaving the room', fakeAsync(() => {
                // Given a partCreation where user is but candidate
                awaitComponentInitialisation();
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);

                // When leaving the page (testing here by calling ngOnDestroy)
                spyOn(joinerService, 'cancelJoining').and.callFake(async(name: string) => {});
                void component.ngOnDestroy();
                tick();

                // Then user's name taken out of the candidate list
                expect(joinerService.cancelJoining).toHaveBeenCalledOnceWith(UserMocks.OPPONENT_MINIMAL_USER.name);
            }));
            it('should set observedPart as empty when leaving the room', fakeAsync(() => {
                // Given a partCreation where user is but candidate
                awaitComponentInitialisation();
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);

                // When leaving the page (testing here by calling ngOnDestroy)
                spyOn(userService, 'removeObservedPart').and.callThrough();
                spyOn(joinerService, 'cancelJoining').and.callFake(async(name: string) => {});
                void component.ngOnDestroy();
                tick();

                // Then observed part should be removed
                expect(userService.removeObservedPart).toHaveBeenCalledOnceWith();
            }));
        });
        describe('Hoping to get chosen:', () => {
            it('should reroute to server when game is cancelled', fakeAsync(() => {
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate');

                // Given component that has loaded
                awaitComponentInitialisation();

                // When the joiner is deleted (because the game has been cancelled)
                void joinerDAO.delete('joinerId');
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then the user is rerouted to the server
                expectValidRouting(router, ['/lobby'], LobbyComponent);
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
            }));
            it('should not delete part when observer seeing that creator goes offline', fakeAsync(() => {
                spyOn(gameService, 'deletePart');
                spyOn(joinerService, 'deleteJoiner');
                spyOn(chatService, 'deleteChat');

                // Given a component with creator and candidate present
                awaitComponentInitialisation();

                // When the creator goes offline
                void userDAO.update(UserMocks.CREATOR_AUTH_USER.userId, { state: 'offline' });

                // Then the part is not deleted
                expect(gameService.deletePart).not.toHaveBeenCalled();
                expect(joinerService.deleteJoiner).not.toHaveBeenCalled();
                expect(chatService.deleteChat).not.toHaveBeenCalled();
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
            }));
            it('should start sending presence token once selected as chosen opponent', fakeAsync(() => {
                // Given a partCreation where user is candidate
                spyOn(component, 'startSendingPresenceTokensIfNotDone').and.callThrough();
                awaitComponentInitialisation();

                // When user is selected as chosen opponent
                receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // Then "start sending token" should have been called
                expect(component.startSendingPresenceTokensIfNotDone).toHaveBeenCalledOnceWith();
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('As the Chosen opponent:', () => {
            it('each 5 second a presence token should be sent', fakeAsync(() => {
                // Given a partCreation were you are already chosen as candidate
                awaitComponentInitialisation();
                receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // When 5 sec pass
                spyOn(userDAO, 'updatePresenceToken').and.callThrough();
                tick(PartCreationComponent.TOKEN_INTERVAL * 2);
                flush();

                // Then a presence token should be emitted
                expect(userDAO.updatePresenceToken).toHaveBeenCalledTimes(2);
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
            }));
            it('should make config acceptation possible for joiner when config is proposed', fakeAsync(() => {
                // Given a part in creation where the candidate is chosen
                awaitComponentInitialisation();
                receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);
                testUtils.expectElementNotToExist('#acceptConfig');

                // When the config is proposed
                receiveJoinerUpdate({
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    maximalMoveDuration: 10,
                    totalPartDuration: 60,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });

                // Then the candidate can accept the config
                expectElementToExist('#acceptConfig');
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('accepting config shoud change joiner and part', fakeAsync(async() => {
                spyOn(component.gameStartNotification, 'emit');
                // Given a part where the config has been proposed with creator as first player
                awaitComponentInitialisation();
                receiveJoinerUpdate({
                    ...JoinerMocks.WITH_PROPOSED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });

                // When accepting the config
                clickElement('#acceptConfig');

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
                const currentPart: Part = (await partDAO.read('joinerId')).get();
                const expectedPart: Part = { ...PartMocks.STARTING, beginning: currentPart.beginning };
                expect(currentPart).toEqual(expectedPart);
                component.unsubscribeFrom(UserMocks.CREATOR_AUTH_USER.userId);
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should stop sending token when no longer chosen opponent', fakeAsync(() => {
                // Given a component where user is chosen opponent
                awaitComponentInitialisation();
                receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // When an update notify user that he is no longer chosen opponent
                spyOn(component, 'stopSendingPresenceTokensAndObservingUsersIfNeeded').and.callThrough();
                receiveJoinerUpdate(JoinerMocks.WITH_FIRST_CANDIDATE);

                // Then stopSendingPresenceTokensAndObservingCreatorIfNeeded should have been called
                expect(component.stopSendingPresenceTokensAndObservingUsersIfNeeded).toHaveBeenCalledOnceWith();
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

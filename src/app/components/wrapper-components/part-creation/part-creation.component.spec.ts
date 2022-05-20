/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';

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
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { FirebaseTime, Time } from 'src/app/domain/Time';
import { MinimalUser } from 'src/app/domain/MinimalUser';

describe('PartCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<PartCreationComponent>;
    let component: PartCreationComponent;

    let joinerDAO: JoinerDAO;
    let partDAO: PartDAO;
    let userDAO: UserDAO;
    let chatDAO: ChatDAO;
    let joinerService: JoinerService;
    let gameService: GameService;
    let chatService: ChatService;
    let connectedUserService: ConnectedUserService;

    let destroyed: boolean;

    async function mockCandidateArrival(lastChanged?: Time): Promise<void> {
        if (lastChanged) {
            await userDAO.update(UserMocks.OPPONENT_MINIMAL_USER.id, { last_changed: lastChanged });
        }
        return joinerDAO.addCandidate('joinerId', UserMocks.OPPONENT_MINIMAL_USER);
    }
    async function receiveJoinerUpdate(update: Partial<Joiner>): Promise<void> {
        await joinerDAO.update('joinerId', update);
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
        void testUtils.clickElement(elementName); // Ticketted Refactor (2022.124)
    }
    function expectElementToExist(elementName: string): void { // Ticketted Refactor (2022.124)
        testUtils.detectChanges();
        testUtils.expectElementToExist(elementName);
    }
    function expectElementNotToExist(elementName: string): void { // Ticketted Refactor (2022.124)
        testUtils.detectChanges();
        testUtils.expectElementNotToExist(elementName);
    }
    function findElement(elementName: string): DebugElement { // Ticketted Refactor (2022.124)
        testUtils.detectChanges();
        return testUtils.findElement(elementName);
    }
    function expectElementToHaveClass(elementName: string, classes: string): void { // Ticketted Refactor (2022.124)
        testUtils.detectChanges();
        testUtils.expectElementToHaveClass(elementName, classes);
    }
    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PartCreationComponent);
        destroyed = false;
        chatDAO = TestBed.inject(ChatDAO);
        partDAO = TestBed.inject(PartDAO);
        joinerDAO = TestBed.inject(JoinerDAO);
        userDAO = TestBed.inject(UserDAO);
        joinerService = TestBed.inject(JoinerService);
        gameService = TestBed.inject(GameService);
        chatService = TestBed.inject(ChatService);
        connectedUserService = TestBed.inject(ConnectedUserService);
        component = testUtils.getComponent();
        component.partId = 'joinerId';
        await chatDAO.set('joinerId', { messages: [], status: 'dummy status' });
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        await partDAO.set('joinerId', PartMocks.INITIAL);
    }));
    describe('For creator', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            // meaning that before clicking it, user was subscribed to themself
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
            await joinerDAO.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Creator arrival on component', () => {
            it('should call joinGame and observe', fakeAsync(() => {
                spyOn(joinerService, 'joinGame').and.callThrough();
                spyOn(joinerService, 'subscribeToChanges').and.callThrough();

                // When the component is loaded
                awaitComponentInitialisation();

                // Then joinGame and observe are called
                expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
                expect(joinerService.subscribeToChanges).toHaveBeenCalledTimes(1);
                expect(component).withContext('PartCreationComponent should have been created').toBeTruthy();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not start observing joiner if part does not exist', fakeAsync(() => {
                // Given a part that does not exist
                component.partId = 'does not exist';
                spyOn(joinerDAO, 'read').and.resolveTo(MGPOptional.empty());
                spyOn(joinerService, 'subscribeToChanges').and.callThrough();

                // When the component is loaded
                awaitComponentInitialisation();
                // and the toast displayed
                tick(3000);

                // Then observe is not called
                expect(joinerService.subscribeToChanges).not.toHaveBeenCalled();
            }));
        });
        describe('Candidate arrival', () => {
            it('should make candidate choice possible for creator when candidate arrives', fakeAsync(async() => {
                // Given a component that is loaded and there is no candidate
                awaitComponentInitialisation();
                expectElementNotToExist('#chooseOpponent');

                // When the candidate arrives
                await mockCandidateArrival();

                // Then it is possible to choose a candidate
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                expectElementToExist('#chooseOpponent');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not see candidate change if it is modified', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#candidate_firstCandidate');

                // When the candidate user's document changes
                // eslint-disable-next-line camelcase
                const last_changed: FirebaseTime = { seconds: 500, nanoseconds: 0 };
                await userDAO.update(UserMocks.OPPONENT_AUTH_USER.id, { last_changed });
                tick(PartCreationComponent.TOKEN_INTERVAL);

                // Then it is in the list of candidates
                expectElementToExist('#candidate_firstCandidate');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Candidate/chosenOpponent clean departure', () => {
            it('should go back to start when ChosenOpponent leaves', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                awaitComponentInitialisation();
                await mockCandidateArrival();
                chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the chosenOpponent leaves
                await receiveJoinerUpdate({
                    partStatus: PartStatus.PART_CREATED.value,
                    chosenOpponent: null,
                });
                await joinerDAO.removeCandidate('joinerId', UserMocks.OPPONENT_MINIMAL_USER);
                tick(3000);

                // Then it is not selected anymore, joiner went back to start and a toast to warn creator has appeared
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                const errorMessage: string = UserMocks.OPPONENT.username + ' left the game, please pick another opponent.';
                expect(component.messageDisplayer.infoMessage).toHaveBeenCalledOnceWith(errorMessage);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should deselect non chosen candidate when they leaves', fakeAsync(async() => {
                // Given a page that has loaded, and a candidate joined
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#presenceOf_' + UserMocks.OPPONENT.username);
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the candidate leaves
                await joinerDAO.removeCandidate('joinerId', UserMocks.OPPONENT_MINIMAL_USER);

                // Then it is not selected anymore, joiner is back to start, and no toast appeared
                expectElementNotToExist('#presenceOf_' + UserMocks.OPPONENT.username);
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                expect(component.messageDisplayer.infoMessage).not.toHaveBeenCalled();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Candidate/chosenOpponent stop sending token', () => {
            it('should go back to start when ChosenOpponent token is too old', fakeAsync(async() => {
                // Given a page that has loaded, a candidate that has joined and that has been chosen as opponent
                awaitComponentInitialisation();
                await mockCandidateArrival({ seconds: 123, nanoseconds: 456000000 });
                chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the candidate token becomes too old
                // Creator update his last presence
                await userDAO.updatePresenceToken(UserMocks.CREATOR_AUTH_USER.id);
                // but chosenOpponent does not
                tick(PartCreationComponent.TOKEN_TIMEOUT);
                // two 'token time' pass, which reactivates the timeout

                // Then there is no longer any candidate nor chosen opponent in the room
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                const errorMessage: string = UserMocks.OPPONENT.username + ' left the game, please pick another opponent.';
                expect(component.messageDisplayer.infoMessage).toHaveBeenCalledOnceWith(errorMessage);
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should remove candidates from the list when they stop sending token', fakeAsync(async() => {
                // Given a component that is loaded and there is a non-chosen candidate
                awaitComponentInitialisation();
                await mockCandidateArrival({ seconds: 123, nanoseconds: 456000000 });
                expectElementToExist('#candidate_firstCandidate');
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the candidate stop sending token
                await userDAO.updatePresenceToken(UserMocks.CREATOR_AUTH_USER.id); // Creator update his last presence
                // but candidate don't
                tick(PartCreationComponent.TOKEN_TIMEOUT); // two token time pass and reactive the timeout

                // Then the candidate should have disappeared and the joiner have been updated and no toast appeared
                expectElementNotToExist('#candidate_firstCandidate');
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                expect(component.messageDisplayer.infoMessage).not.toHaveBeenCalled();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Candidate/ChosenOpponent removal', () => {
            it('should deselect candidate, remove it, and call logError when a candidate is removed from db', fakeAsync(async() => {
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                // Given a part with a candidate that has been chosen
                awaitComponentInitialisation();
                await mockCandidateArrival();
                chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);

                // When the candidate is deleted and one TOKEN_INTERVAL passes
                void userDAO.delete(UserMocks.OPPONENT_AUTH_USER.id);
                tick(PartCreationComponent.TOKEN_INTERVAL);

                // Then logError has been called as this is an unusual situation
                const error: string = 'found no user while observing ' + UserMocks.OPPONENT_MINIMAL_USER.id + ' !';
                expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('PartCreationComponent', error);
                // and the candidate has been deselected
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                // and the candidate has been removed from the lobby
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                tick(3000);
            }));
        });
        describe('Config proposal', () => {
            it('should send what creator sees, not what is stored in the joiner', fakeAsync(async() => {
                // Given a component where creator has changed the maximalMoveDuration and totalPartDuration
                awaitComponentInitialisation();
                clickElement('#partTypeCustom');
                Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).setValue(100);
                Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).setValue(1000);

                // When a candidate arrives and is proposed a config
                await mockCandidateArrival();
                chooseOpponent();
                spyOn(joinerDAO, 'update').and.callThrough();
                proposeConfig();

                // Then the data sent should be what creator saw
                expect(joinerDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.CUSTOM.value,
                    maximalMoveDuration: 100,
                    totalPartDuration: 1000,
                    chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should support blitz part', fakeAsync(async() => {
                // Given a component with a candidate where blitz is selected
                awaitComponentInitialisation();
                await mockCandidateArrival();
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
                    chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should change joiner doc', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                awaitComponentInitialisation();
                await mockCandidateArrival();
                chooseOpponent();

                // When proposing config
                proposeConfig();

                // Then currentJoiner should be updated with the proposed config
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_PROPOSED_CONFIG);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Form interaction', () => {
            it('should modify joiner, make proposal possible, and select opponent when choosing opponent', fakeAsync(async() => {
                // Given a component with candidate present but not selected
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#presenceOf_firstCandidate');

                const contextBefore: string = 'Proposing config should be impossible before there is a ChosenOpponent';
                expect(findElement('#proposeConfig').nativeElement.disabled).withContext(contextBefore).toBeTruthy();

                // When choosing the opponent
                chooseOpponent();

                // Then joiner doc should be updated
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // and proposal should now be possible
                const proposeConfigDisabled: boolean = findElement('#proposeConfig').nativeElement.disabled;
                const contextAfter: string = 'Proposing config should become possible after ChosenOpponent is set';
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
            it('should go back to created status when clicking on review config button', fakeAsync(async() => {
                // Given a part creation where the config has been proposed
                awaitComponentInitialisation();
                await receiveJoinerUpdate({
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
            it('should remember settings after a joiner update', fakeAsync(async() => {
                // Given a part creation with some changes to the config
                awaitComponentInitialisation();
                clickElement('#firstPlayerCreator');
                clickElement('#partTypeBlitz');

                // When a new candidate appears
                await mockCandidateArrival();

                // Then the config does not change
                expectElementToHaveClass('#firstPlayerCreator', 'is-selected');
                expectElementToHaveClass('#partTypeBlitz', 'is-selected');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Cancelling part creation and component destruction', () => {
            it('should delete the game, joiner and chat', fakeAsync(() => {
                // Given a part creation
                awaitComponentInitialisation();

                spyOn(gameService, 'deletePart');
                spyOn(joinerService, 'deleteJoiner');
                spyOn(chatService, 'deleteChat');

                // When clicking on cancel
                clickElement('#cancel');
                tick();

                // Then game, joiner, and chat are deleted
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should ask AuthService to remove observedPart', fakeAsync(async() => {
                // Given any part with a non started game
                awaitComponentInitialisation();

                // When user cancel game creation
                const authService: ConnectedUserService = TestBed.inject(ConnectedUserService);
                spyOn(authService, 'removeObservedPart').and.callThrough();
                clickElement('#cancel');
                tick(3000);

                // then observedPart should be emptied
                expect(authService.removeObservedPart).toHaveBeenCalledOnceWith();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                await partDAO.set('joinerId', PartMocks.INITIAL);
                await joinerDAO.set('joinerId', JoinerMocks.INITIAL);
                await chatDAO.set('joinerId', { messages: [], status: 'dummy status' });
            }));
            it('should unsubscribe from joiner service upon destruction', fakeAsync(async() => {
                // Given a component that is loaded by anyone (here, the creator)
                awaitComponentInitialisation();
                spyOn(joinerService, 'unsubscribe');
                spyOn(component, 'cancelGameCreation'); // spied in order to avoid calling it

                // When the component is destroyed
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                destroyed = true;
                await component.ngOnDestroy();
                tick(3000);
                await testUtils.whenStable();

                // Then the component unsubscribes from the joiner service
                expect(joinerService.unsubscribe).toHaveBeenCalledWith();
            }));
        });
    });
    describe('Candidate', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component where user is a candidate
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await joinerDAO.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Arrival', () => {
            it('should add user to joiner', fakeAsync(() => {
                spyOn(joinerDAO, 'addCandidate').and.callThrough();

                // When candidate arrives
                awaitComponentInitialisation();

                // Then the candidate is added to the joiner and the joiner is updated
                expect(joinerDAO.addCandidate).toHaveBeenCalledOnceWith('joinerId', UserMocks.OPPONENT_MINIMAL_USER);
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
                // tick(PartCreationComponent.TOKEN_INTERVAL);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should add observedPart to user doc', fakeAsync(() => {
                // Given a partCreation
                spyOn(connectedUserService, 'updateObservedPart').and.callFake(async() => {});

                // When candidate arrives
                awaitComponentInitialisation();

                // Then observedPart in user doc should be set
                expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith('joinerId');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should start sending presence token', fakeAsync(() => {
                // Given a partCreation where user is not opponent
                // When user is selected as chosen opponent
                spyOn(component, 'startSendingPresenceTokens').and.callThrough();
                awaitComponentInitialisation();

                // Then "start sending token" should have been called
                expect(component.startSendingPresenceTokens).toHaveBeenCalledOnceWith();

                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                // tick(PartCreationComponent.TOKEN_INTERVAL);
            }));
            it(`should delete part when finding an outdated creator token`, fakeAsync(async() => {
                spyOn(gameService, 'deletePart').and.callThrough();
                spyOn(joinerService, 'deleteJoiner').and.callThrough();
                spyOn(chatService, 'deleteChat').and.callThrough();

                // Given a component where creator has an out of date token
                const creatorLastChange: Time = { seconds: - PartCreationComponent.TOKEN_TIMEOUT, nanoseconds: 0 };
                await userDAO.update(UserMocks.CREATOR_AUTH_USER.id, { last_changed: creatorLastChange });
                await partDAO.set('joinerId', PartMocks.INITIAL);

                // When arriving on that component
                awaitComponentInitialisation();
                // and waiting one TOKEN_INTERVAL
                tick(PartCreationComponent.TOKEN_INTERVAL);
                tick(3000);

                // Then the part and all its related data should be removed
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Not chosen yet', () => {
            it('should reroute to server when game is cancelled', fakeAsync(async() => {
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate');

                // Given component that has loaded
                awaitComponentInitialisation();

                // When the joiner is deleted (because the game has been cancelled)
                await joinerDAO.delete('joinerId');
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then the user is rerouted to the server
                expectValidRouting(router, ['/lobby'], LobbyComponent);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not start sending presence token once selected as chosen opponent', fakeAsync(async() => {
                // Given a partCreation where user is candidate
                awaitComponentInitialisation();

                // When user is selected as chosen opponent
                spyOn(component, 'startSendingPresenceTokens').and.callThrough();
                await receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // Then "start sending token" should have been called
                expect(component.startSendingPresenceTokens).not.toHaveBeenCalled();
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Chosen opponent', () => {
            it('each 5 second a presence token should be sent', fakeAsync(async() => {
                // Given a partCreation were you are already chosen as candidate
                awaitComponentInitialisation();
                await receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // When 2 * 5 sec pass
                spyOn(connectedUserService, 'sendPresenceToken').and.callFake(async() => {});
                tick(PartCreationComponent.TOKEN_TIMEOUT);

                // Then a presence token should be emitted
                expect(connectedUserService.sendPresenceToken).toHaveBeenCalledTimes(2);
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should make config acceptation possible for joiner when config is proposed', fakeAsync(async() => {
                // Given a part in creation where the candidate is chosen
                awaitComponentInitialisation();
                await receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);
                testUtils.expectElementNotToExist('#acceptConfig');

                // When the config is proposed
                await receiveJoinerUpdate({
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    maximalMoveDuration: 10,
                    totalPartDuration: 60,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });

                // Then the candidate can accept the config
                expectElementToExist('#acceptConfig');
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('accepting config shoud change joiner and part', fakeAsync(async() => {
                spyOn(component.gameStartNotification, 'emit');
                // Given a part where the config has been proposed with creator as first player
                awaitComponentInitialisation();
                await receiveJoinerUpdate({
                    ...JoinerMocks.WITH_PROPOSED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });

                // When accepting the config
                clickElement('#acceptConfig');
                tick();

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
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not stop sending token when no longer chosen opponent', fakeAsync(async() => {
                // Given a component where user is chosen opponent amongst two candidate
                awaitComponentInitialisation();
                await receiveJoinerUpdate(JoinerMocks.INITIAL);
                await joinerDAO.addCandidate('joinerId', UserMocks.OTHER_OPPONENT_MINIMAL_USER);
                await joinerDAO.addCandidate('joinerId', UserMocks.OPPONENT_MINIMAL_USER);
                await receiveJoinerUpdate(JoinerMocks.WITH_CHOSEN_OPPONENT);

                // When an update notifies user that the chosen opponent changed
                spyOn(component, 'stopSendingPresenceTokensAndObservingUsersIfNeeded').and.callThrough();
                await receiveJoinerUpdate(JoinerMocks.WITH_ANOTHER_CHOSEN_OPPONENT);

                // Then stopSendingPresenceTokensAndObservingCreatorIfNeeded should not have been called
                expect(component.stopSendingPresenceTokensAndObservingUsersIfNeeded).not.toHaveBeenCalled();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Leaving', () => {
            it('should remove yourself when leaving the room and empty user.observedPart', fakeAsync(async() => {
                // Given a partCreation where user is candidate
                awaitComponentInitialisation();
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);

                // When leaving the page (tested here by calling ngOnDestroy)
                const authService: ConnectedUserService = TestBed.inject(ConnectedUserService);
                spyOn(authService, 'removeObservedPart').and.callThrough();
                spyOn(joinerService, 'unsubscribe').and.callFake(() => {});
                spyOn(joinerService, 'cancelJoining').and.callFake(async() => {});
                await component.ngOnDestroy();
                destroyed = true;

                // Then joinerService.cancelJoining should have been called
                expect(joinerService.cancelJoining).toHaveBeenCalledOnceWith();
                expect(authService.removeObservedPart).toHaveBeenCalledOnceWith();
            }));
        });
    });
    afterEach(fakeAsync(async() => {
        if (destroyed === false) {
            testUtils.destroy();
            tick(3000);
            await testUtils.whenStable();
        }
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

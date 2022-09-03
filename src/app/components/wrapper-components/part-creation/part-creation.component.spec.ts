/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';

import { PartCreationComponent } from './part-creation.component';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';

import { ConfigRoomService } from 'src/app/services/ConfigRoomService';
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';

import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { UserDAO } from 'src/app/dao/UserDAO';

import { ActivatedRouteStub } from 'src/app/utils/tests/TestUtils.spec';
import { expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec'; // TODOTODO check that the old is dead
import { FirstPlayer, PartStatus, PartType, ConfigRoom } from 'src/app/domain/ConfigRoom';
import { Part } from 'src/app/domain/Part';
import { FocussedPart } from 'src/app/domain/User';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { FirestoreTime } from 'src/app/domain/Time';

describe('PartCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<PartCreationComponent>;
    let component: PartCreationComponent;

    let configRoomDAO: ConfigRoomDAO;
    let partDAO: PartDAO;
    let userDAO: UserDAO;
    let chatDAO: ChatDAO;
    let configRoomService: ConfigRoomService;
    let gameService: GameService;
    let chatService: ChatService;
    let connectedUserService: ConnectedUserService;

    let destroyed: boolean;

    async function mockCandidateArrival(lastUpdateTime?: Timestamp): Promise<void> {
        if (lastUpdateTime) {
            await userDAO.update(UserMocks.OPPONENT_MINIMAL_USER.id, { lastUpdateTime });
        }
        return configRoomDAO.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
    }
    async function receiveConfigRoomUpdate(update: Partial<ConfigRoom>): Promise<void> {
        await configRoomDAO.update('configRoomId', update);
        tick();
    }
    async function proposeConfig(): Promise<void> {
        await clickElement('#proposeConfig');
    }
    async function chooseOpponent(): Promise<void> {
        await clickElement('#presenceOf_' + UserMocks.OPPONENT.username);
    }
    function awaitComponentInitialisation(): void {
        // Once tick is executed, ngOnInit of the PartCreationComponent is normally over
        testUtils.detectChanges();
        tick();
    }
    async function clickElement(elementName: string): Promise<void> {
        testUtils.detectChanges();
        await testUtils.clickElement(elementName, false); // Ticketted Refactor (2022.124)
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
        testUtils = await SimpleComponentTestUtils.create(PartCreationComponent, new ActivatedRouteStub('JOSER'));
        destroyed = false;
        chatDAO = TestBed.inject(ChatDAO);
        partDAO = TestBed.inject(PartDAO);
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
        userDAO = TestBed.inject(UserDAO);
        configRoomService = TestBed.inject(ConfigRoomService);
        gameService = TestBed.inject(GameService);
        chatService = TestBed.inject(ChatService);
        connectedUserService = TestBed.inject(ConnectedUserService);
        component = testUtils.getComponent();
        component.partId = 'configRoomId';
        await chatDAO.set('configRoomId', { messages: [], status: 'dummy status' });
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        await partDAO.set('configRoomId', PartMocks.INITIAL);
    }));
    describe('For creator', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            // meaning that before clicking it, user was subscribed to themself
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
        }));
        describe('Creator arrival on component', () => {
            it('should call joinGame and observe', fakeAsync(() => {
                spyOn(configRoomService, 'joinGame').and.callThrough();
                spyOn(configRoomService, 'subscribeToChanges').and.callThrough();

                // When the component is loaded
                awaitComponentInitialisation();

                // Then joinGame and observe are called
                expect(configRoomService.joinGame).toHaveBeenCalledTimes(1);
                expect(configRoomService.subscribeToChanges).toHaveBeenCalledTimes(1);
                expect(component).withContext('PartCreationComponent should have been created').toBeTruthy();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should add observedPart to user doc', fakeAsync(() => {
                // Given a partCreation
                spyOn(connectedUserService, 'updateObservedPart').and.callFake(async() => {});

                // When the user, the creator, arrives
                awaitComponentInitialisation();

                // Then observedPart in user doc should be set
                const expectedObservedPart: FocussedPart = {
                    id: 'configRoomId',
                    opponent: null,
                    typeGame: 'JOSER',
                    role: 'Creator',
                };
                expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith(expectedObservedPart);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not start observing configRoom if part does not exist', fakeAsync(() => {
                // Given a part that does not exist
                component.partId = 'does not exist';
                spyOn(configRoomDAO, 'read').and.resolveTo(MGPOptional.empty());
                spyOn(configRoomService, 'subscribeToChanges').and.callThrough();

                // When the component is loaded
                awaitComponentInitialisation();
                // and the toast displayed
                tick(3000);

                // Then observe is not called
                expect(configRoomService.subscribeToChanges).not.toHaveBeenCalled();
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
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
                expectElementToExist('#chooseOpponent');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not see candidate change if it is modified', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#candidate_firstCandidate');

                // When the candidate user's document changes
                const lastUpdateTime: FirestoreTime = new Timestamp(500, 0);
                await userDAO.update(UserMocks.OPPONENT_AUTH_USER.id, { lastUpdateTime });
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
                await chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the chosenOpponent leaves
                spyOn(connectedUserService, 'updateObservedPart').and.callThrough();
                await receiveConfigRoomUpdate({
                    partStatus: PartStatus.PART_CREATED.value,
                    chosenOpponent: null,
                });
                await configRoomDAO.removeCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
                tick(3000);

                // Then it is not selected anymore,
                // configRoom went back to start and a toast to warn creator has appeared
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
                const errorMessage: string = UserMocks.OPPONENT.username + ' left the game, please pick another opponent.';
                expect(component.messageDisplayer.infoMessage).toHaveBeenCalledOnceWith(errorMessage);
                // And component should update the observedPart
                expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith({ opponent: null });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should deselect non chosen candidate when they leaves', fakeAsync(async() => {
                // Given a page that has loaded, and a candidate joined
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#presenceOf_' + UserMocks.OPPONENT.username);
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the candidate leaves
                await configRoomDAO.removeCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);

                // Then it is not selected anymore, configRoom is back to start, and no toast appeared
                expectElementNotToExist('#presenceOf_' + UserMocks.OPPONENT.username);
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
                expect(component.messageDisplayer.infoMessage).not.toHaveBeenCalled();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Candidate/chosenOpponent stop sending token', () => {
            it('should go back to start when ChosenOpponent token is too old', fakeAsync(async() => {
                // Given a page that has loaded, a candidate that has joined and that has been chosen as opponent
                awaitComponentInitialisation();
                await mockCandidateArrival(new Timestamp(123, 456000000));
                await chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the candidate token becomes too old
                spyOn(connectedUserService, 'updateObservedPart').and.callThrough();
                // Creator update his last presence token
                await userDAO.updatePresenceToken(UserMocks.CREATOR_AUTH_USER.id);
                // but chosenOpponent don't update his last presence token
                tick(PartCreationComponent.TOKEN_TIMEOUT); // two token time pass and reactive the timeout

                // Then there is no longer any candidate nor chosen opponent in the room
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                const errorMessage: string = UserMocks.OPPONENT.username + ' left the game, please pick another opponent.';
                expect(component.messageDisplayer.infoMessage).toHaveBeenCalledOnceWith(errorMessage);
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
                // And component should update the observedPart
                expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith({ opponent: null });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should remove candidates from the list when they stop sending token', fakeAsync(async() => {
                // Given a component that is loaded and there is a non-chosen candidate
                awaitComponentInitialisation();
                await mockCandidateArrival(new Timestamp(123, 456000000));
                expectElementToExist('#candidate_firstCandidate');
                spyOn(component.messageDisplayer, 'infoMessage').and.callThrough();

                // When the candidate stop sending token
                await userDAO.updatePresenceToken(UserMocks.CREATOR_AUTH_USER.id); // Creator update his last presence
                // but candidate don't
                tick(PartCreationComponent.TOKEN_TIMEOUT); // two token time pass and reactive the timeout

                // Then the candidate should have disappeared and the configRoom have been updated and no toast appeared
                expectElementNotToExist('#candidate_firstCandidate');
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
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
                await chooseOpponent();
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);

                // When the candidate is deleted and one TOKEN_INTERVAL passes
                await userDAO.delete(UserMocks.OPPONENT_AUTH_USER.id);
                tick(PartCreationComponent.TOKEN_INTERVAL);

                // Then logError has been called as this is an unusual situation
                const error: string = 'found no user while observing ' + UserMocks.OPPONENT_MINIMAL_USER.id + ' !';
                expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('PartCreationComponent', error);
                // and the candidate has been deselected
                expectElementNotToExist('#selected_' + UserMocks.OPPONENT.username);
                // and the candidate has been removed from the lobby
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                tick(3000);
            }));
        });
        describe('Chosing Opponent', () => {
            it('should modify joiner, make proposal possible, and select opponent when choosing opponent', fakeAsync(async() => {
                // Given a component with candidate present but not selected
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#presenceOf_firstCandidate');

                const contextBefore: string = 'Proposing config should be impossible before there is a ChosenOpponent';
                expect(findElement('#proposeConfig').nativeElement.disabled).withContext(contextBefore).toBeTruthy();

                // When choosing the opponent
                await chooseOpponent();

                // Then joiner doc should be updated
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.WITH_CHOSEN_OPPONENT);

                // and proposal should now be possible
                const proposeConfigDisabled: boolean = findElement('#proposeConfig').nativeElement.disabled;
                const contextAfter: string = 'Proposing config should become possible after ChosenOpponent is set';
                expect(proposeConfigDisabled).withContext(contextAfter).toBeFalse();

                // and opponent should be selected
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should modify observedPart to add chosen opponent', fakeAsync(async() => {
                // Given a component with candidate present but not selected
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#presenceOf_firstCandidate');

                const contextBefore: string = 'Proposing config should be impossible before there is a ChosenOpponent';
                expect(findElement('#proposeConfig').nativeElement.disabled).withContext(contextBefore).toBeTruthy();

                // When choosing the opponent
                spyOn(connectedUserService, 'updateObservedPart').and.callThrough();
                await chooseOpponent();

                // Then updateObservedPart should have been called
                expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith({
                    opponent: UserMocks.OPPONENT_MINIMAL_USER,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Config proposal', () => {
            it('should send what creator sees, not what is stored in the configRoom', fakeAsync(async() => {
                // Given a component where creator has changed the maximalMoveDuration and totalPartDuration
                awaitComponentInitialisation();
                await clickElement('#partTypeCustom');
                Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).setValue(100);
                Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).setValue(1000);

                // When a candidate arrives and is proposed a config
                await mockCandidateArrival();
                await chooseOpponent();
                spyOn(configRoomDAO, 'update').and.callThrough();
                await proposeConfig();

                // Then the data sent should be what creator saw
                expect(configRoomDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
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
                // Given a component with a chosen opponent where blitz is selected
                awaitComponentInitialisation();
                await mockCandidateArrival();
                await chooseOpponent();
                await clickElement('#partTypeBlitz');

                spyOn(configRoomDAO, 'update').and.callThrough();

                // When proposing the config
                await proposeConfig();

                // The blitz should be part of it
                expect(configRoomDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    partType: PartType.BLITZ.value,
                    maximalMoveDuration: 30,
                    totalPartDuration: 900,
                    chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                    firstPlayer: FirstPlayer.RANDOM.value,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should change configRoom doc', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                awaitComponentInitialisation();
                await mockCandidateArrival();
                await chooseOpponent();

                // When proposing config
                await proposeConfig();

                // Then currentConfigRoom should be updated with the proposed config
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.WITH_PROPOSED_CONFIG);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Form interaction', () => {
            it('should modify configRoom, make proposal possible, and select opponent when choosing opponent', fakeAsync(async() => {
                // Given a component with candidate present but not selected
                awaitComponentInitialisation();
                await mockCandidateArrival();
                expectElementToExist('#presenceOf_firstCandidate');

                const contextBefore: string = 'Proposing config should be impossible before there is a ChosenOpponent';
                expect(findElement('#proposeConfig').nativeElement.disabled).withContext(contextBefore).toBeTruthy();

                // When choosing the opponent
                await chooseOpponent();

                // Then configRoom doc should be updated
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.WITH_CHOSEN_OPPONENT);

                // and proposal should now be possible
                const proposeConfigDisabled: boolean = findElement('#proposeConfig').nativeElement.disabled;
                const contextAfter: string = 'Proposing config should become possible after ChosenOpponent is set';
                expect(proposeConfigDisabled).withContext(contextAfter).toBeFalse();

                // and opponent should be selected
                expectElementToExist('#selected_' + UserMocks.OPPONENT.username);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should update the form data when changing first player', fakeAsync(async() => {
                // Given a part being created
                awaitComponentInitialisation();

                // When changing the first player
                await clickElement('#firstPlayerOpponent');

                // Then form is updated
                const firstPlayer: string = Utils.getNonNullable(component.configFormGroup.get('firstPlayer')).value;
                expect(firstPlayer).toEqual(FirstPlayer.CHOSEN_PLAYER.value);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should show detailed timing options when choosing a custom part type', fakeAsync(async() => {
                // Given a part being created
                awaitComponentInitialisation();

                // When setting the part type to custom
                await clickElement('#partTypeCustom');

                // Then the detailed timing options are shown
                expectElementToExist('#customTime');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should update the timings when selecting blitz part', fakeAsync(async() => {
                // Given a part creation
                awaitComponentInitialisation();

                // When setting the part type to 'blitz'
                await clickElement('#partTypeBlitz');
                testUtils.detectChanges();

                // Then the timings in the form are updated
                const maximalMoveDuration: number = Utils.getNonNullable(component.configFormGroup.get('maximalMoveDuration')).value;
                expect(maximalMoveDuration).toBe(PartType.BLITZ_MOVE_DURATION);
                const totalPartDuration: number = Utils.getNonNullable(component.configFormGroup.get('totalPartDuration')).value;
                expect(totalPartDuration).toBe(PartType.BLITZ_PART_DURATION);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should update the timings when reselecting normal part', fakeAsync(async() => {
                // Given a part creation with blitz selected
                awaitComponentInitialisation();
                await clickElement('#partTypeBlitz');

                // When setting the part type back to standard
                await clickElement('#partTypeStandard');

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
                await receiveConfigRoomUpdate({
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                    maximalMoveDuration: 10,
                    totalPartDuration: 60,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });

                spyOn(configRoomDAO, 'update');

                // When the config is reviewed
                await clickElement('#reviewConfig');

                // Then the part is set back to created
                expect(configRoomDAO.update).toHaveBeenCalledWith('configRoomId', {
                    partStatus: PartStatus.PART_CREATED.value,
                });
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should remember settings after a configRoom update', fakeAsync(async() => {
                // Given a part creation with some changes to the config
                awaitComponentInitialisation();
                await clickElement('#firstPlayerCreator');
                await clickElement('#partTypeBlitz');

                // When a new candidate appears
                await mockCandidateArrival();

                // Then the config does not change
                expectElementToHaveClass('#firstPlayerCreator', 'is-selected');
                expectElementToHaveClass('#partTypeBlitz', 'is-selected');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Cancelling part creation and component destruction', () => {
            it('should delete the game, configRoom and chat', fakeAsync(async() => {
                // Given a part creation
                awaitComponentInitialisation();

                spyOn(gameService, 'deletePart');
                spyOn(configRoomService, 'deleteConfigRoom');
                spyOn(chatService, 'deleteChat');

                // When clicking on cancel
                await clickElement('#cancel');
                tick();

                // Then game, configRoom, and chat are deleted
                expect(gameService.deletePart).toHaveBeenCalledOnceWith('configRoomId');
                expect(configRoomService.deleteConfigRoom).toHaveBeenCalledOnceWith([]);
                expect(chatService.deleteChat).toHaveBeenCalledOnceWith('configRoomId');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not cancel game if it has been cancelled already', fakeAsync(async() => {
                // Given a part creation where the part has been cancelled
                awaitComponentInitialisation();
                await clickElement('#cancel');
                tick();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();

                // When the component is destroyed
                spyOn(component, 'cancelGameCreation');
                testUtils.destroy();
                tick(3000);
                await testUtils.whenStable();
                destroyed = true;

                // Then it should not delete anything
                expect(component.cancelGameCreation).not.toHaveBeenCalled();
            }));
            it('should ask AuthService to remove observedPart', fakeAsync(async() => {
                // Given any part with a non started game
                awaitComponentInitialisation();

                // When user cancel game creation
                const authService: ConnectedUserService = TestBed.inject(ConnectedUserService);
                spyOn(authService, 'removeObservedPart').and.callThrough();
                await clickElement('#cancel');
                tick(3000);

                // then observedPart should be emptied
                expect(authService.removeObservedPart).toHaveBeenCalledOnceWith();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                await partDAO.set('configRoomId', PartMocks.INITIAL);
                await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
                await chatDAO.set('configRoomId', { messages: [], status: 'dummy status' });
            }));
            it('should unsubscribe from configRoom service upon destruction', fakeAsync(async() => {
                // Given a component that is loaded by anyone (here, the creator)
                awaitComponentInitialisation();
                spyOn(configRoomService, 'unsubscribe');
                spyOn(component, 'cancelGameCreation'); // spied in order to avoid calling it

                // When the component is destroyed
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
                destroyed = true;
                await component.ngOnDestroy();
                tick(3000);
                await testUtils.whenStable();

                // Then the component unsubscribes from the configRoom service
                expect(configRoomService.unsubscribe).toHaveBeenCalledWith();
            }));
        });
    });
    describe('Candidate', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component where user is a candidate
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
        }));
        describe('Arrival', () => {
            it('should add user to configRoom candidates with DAO', fakeAsync(() => {
                spyOn(configRoomDAO, 'addCandidate').and.callThrough();

                // When candidate arrives
                awaitComponentInitialisation();

                // Then the candidate is added to the configRoom and the configRoom is updated
                expect(configRoomDAO.addCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should add observedPart to user doc', fakeAsync(() => {
                // Given a partCreation
                spyOn(connectedUserService, 'updateObservedPart').and.callFake(async() => {});

                // When the user, a candidate, arrives
                awaitComponentInitialisation();

                // Then observedPart in user doc should be set
                const observedPart: FocussedPart = {
                    id: 'configRoomId',
                    opponent: UserMocks.CREATOR_MINIMAL_USER,
                    typeGame: 'JOSER',
                    role: 'Candidate',
                };
                expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith(observedPart);
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
                spyOn(configRoomService, 'deleteConfigRoom').and.callThrough();
                spyOn(chatService, 'deleteChat').and.callThrough();

                // Given a component where creator has an out of date token
                const lastUpdateTime: Timestamp = new Timestamp(- PartCreationComponent.TOKEN_TIMEOUT, 0);
                await userDAO.update(UserMocks.CREATOR_AUTH_USER.id, { lastUpdateTime });
                await partDAO.set('configRoomId', PartMocks.INITIAL);

                // When arriving on that component
                awaitComponentInitialisation();
                // and waiting one TOKEN_INTERVAL
                tick(PartCreationComponent.TOKEN_INTERVAL);
                tick(3000);

                // Then the part and all its related data should be removed
                expect(gameService.deletePart).toHaveBeenCalledWith('configRoomId');
                expect(configRoomService.deleteConfigRoom).toHaveBeenCalledWith([UserMocks.OPPONENT_MINIMAL_USER]);
                expect(chatService.deleteChat).toHaveBeenCalledWith('configRoomId');
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Not chosen yet', () => {
            it('should reroute to server when game is cancelled', fakeAsync(async() => {
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate');

                // Given component that has loaded
                awaitComponentInitialisation();

                // When the configRoom is deleted (because the game has been cancelled)
                await configRoomDAO.delete('configRoomId');
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
                await receiveConfigRoomUpdate(ConfigRoomMocks.WITH_CHOSEN_OPPONENT);

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
                await receiveConfigRoomUpdate(ConfigRoomMocks.WITH_CHOSEN_OPPONENT);

                // When 2 * 5 sec pass
                spyOn(connectedUserService, 'sendPresenceToken').and.callFake(async() => {});
                tick(PartCreationComponent.TOKEN_TIMEOUT);

                // Then a presence token should be emitted
                expect(connectedUserService.sendPresenceToken).toHaveBeenCalledTimes(2);
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should make config acceptation possible for configRoom when config is proposed', fakeAsync(async() => {
                // Given a part in creation where the candidate is chosen
                awaitComponentInitialisation();
                await receiveConfigRoomUpdate(ConfigRoomMocks.WITH_CHOSEN_OPPONENT);
                testUtils.expectElementNotToExist('#acceptConfig');

                // When the config is proposed
                await receiveConfigRoomUpdate({
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
            it('accepting config shoud change configRoom and part', fakeAsync(async() => {
                spyOn(component.gameStartNotification, 'emit');
                // Given a part where the config has been proposed with creator as first player
                awaitComponentInitialisation();
                await receiveConfigRoomUpdate({
                    ...ConfigRoomMocks.WITH_PROPOSED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });

                // When accepting the config
                await clickElement('#acceptConfig');
                tick();

                // Then the game start notification is emitted
                expect(component.gameStartNotification.emit).toHaveBeenCalledWith({
                    ...ConfigRoomMocks.WITH_ACCEPTED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                // the configRoom is updated
                expect(component.currentConfigRoom).toEqual({
                    ...ConfigRoomMocks.WITH_ACCEPTED_CONFIG,
                    firstPlayer: FirstPlayer.CREATOR.value,
                });
                // and the part is set to starting
                const currentPart: Part = (await partDAO.read('configRoomId')).get();
                const expectedPart: Part = { ...PartMocks.STARTED, beginning: currentPart.beginning };
                expect(currentPart).toEqual(expectedPart);
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should not stop sending token when no longer chosen opponent', fakeAsync(async() => {
                // Given a component where user is chosen opponent amongst two candidate
                awaitComponentInitialisation();
                await receiveConfigRoomUpdate(ConfigRoomMocks.INITIAL);
                await configRoomDAO.addCandidate('configRoomId', UserMocks.OTHER_OPPONENT_MINIMAL_USER);
                await configRoomDAO.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
                await receiveConfigRoomUpdate(ConfigRoomMocks.WITH_CHOSEN_OPPONENT);

                // When an update notifies user that the chosen opponent changed
                spyOn(component, 'stopSendingPresenceTokensAndObservingUsersIfNeeded').and.callThrough();
                await receiveConfigRoomUpdate(ConfigRoomMocks.WITH_ANOTHER_CHOSEN_OPPONENT);

                // Then stopSendingPresenceTokensAndObservingCreatorIfNeeded should not have been called
                expect(component.stopSendingPresenceTokensAndObservingUsersIfNeeded).not.toHaveBeenCalled();
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
            it('should update observedPart and mark user as chosen opponent', fakeAsync(async() => {
                // Given a partCreation where user is candidate
                awaitComponentInitialisation();

                // When user is selected as chosen opponent
                spyOn(connectedUserService, 'updateObservedPart').and.callThrough();
                await receiveConfigRoomUpdate(ConfigRoomMocks.WITH_CHOSEN_OPPONENT);

                // Then an update should change user doc to say it's chosenOpponent now
                expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith({
                    id: 'configRoomId',
                    typeGame: 'JOSER',
                    opponent: UserMocks.CREATOR_MINIMAL_USER,
                    role: 'ChosenOpponent',
                    // TODOTODO after that, code a test that change "ConfigRoom"roles to "StartedPart"roles
                });
                // To avoid finishing test with periodic timer in queue
                component.stopSendingPresenceTokensAndObservingUsersIfNeeded();
            }));
        });
        describe('Someone else is chosen', () => {
            it('should update');
        });
        describe('Leaving', () => {
            it('should remove yourself when leaving the room and empty user.observedPart', fakeAsync(async() => {
                // Given a partCreation where user is candidate
                awaitComponentInitialisation();
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
                expect(component.candidates).toEqual([UserMocks.OPPONENT_MINIMAL_USER]);

                // When leaving the page (tested here by calling ngOnDestroy)
                const authService: ConnectedUserService = TestBed.inject(ConnectedUserService);
                spyOn(authService, 'removeObservedPart').and.callThrough();
                spyOn(configRoomService, 'unsubscribe').and.callFake(() => {});
                spyOn(configRoomService, 'cancelJoining').and.callFake(async() => {});
                await component.ngOnDestroy();
                destroyed = true;

                // Then configRoomService.cancelJoining should have been called
                expect(configRoomService.cancelJoining).toHaveBeenCalledOnceWith();
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
    it('should map correctly with PartType.of', () => {
        expect(PartType.of('STANDARD').value).toBe('STANDARD');
        expect(PartType.of('BLITZ').value).toBe('BLITZ');
        expect(PartType.of('CUSTOM').value).toBe('CUSTOM');
        expect(() => PartType.of('caca')).toThrowError('Invalid part type: caca.');
    });
});

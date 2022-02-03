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
import { FirstPlayer, PartStatus, PartType } from 'src/app/domain/Joiner';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { ChatService } from 'src/app/services/ChatService';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { UserService } from 'src/app/services/UserService';

describe('PartCreationComponent:', () => {

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
        await joinerDAOMock.update('joinerId', { candidates: [OPPONENT.username as string] });
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
    const CREATOR_AUTH_USER: AuthUser = new AuthUser('creator-doc-id', MGPOptional.of('cre@tor'), MGPOptional.of('creator'), true);
    const OPPONENT_AUTH_USER: AuthUser = new AuthUser('opponent-doc-id', MGPOptional.of('opp@nante'), MGPOptional.of('firstCandidate'), true);
    const OPPONENT: User = {
        username: OPPONENT_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
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
    describe('For creator', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            component.authUser = CREATOR_AUTH_USER;
            // meaning that before clicking it, user was subscribed to himself
            userService.startObservingAuthUser(component.authUser.userId);
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
                await userDAOMock.update(OPPONENT_AUTH_USER.userId,
                                         { last_changed: { seconds: 42, nanoseconds: 31415 } });
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then it is in the list of candidates
                testUtils.expectElementToExist('#candidate_firstCandidate');
            }));
        });
        describe('Candidate/chosen player departure (exit, disconnection and removal)', () => {
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
            }));
            it('should deselect candidate, remove it, and call handleError when a candidate is removed from db', fakeAsync(async() => {
                spyOn(Utils, 'handleError').and.callFake(() => {});

                // Given a part with a candidate that has been chosen
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();
                await chooseOpponent();
                testUtils.expectElementToExist('#selected_' + OPPONENT.username);

                // When the candidate is deleted
                await userDAOMock.delete(OPPONENT_AUTH_USER.userId);
                testUtils.detectChanges();
                tick(3000); // needs to be >2999

                // Then handleError has been called as this is an unusual situation
                expect(Utils.handleError).toHaveBeenCalledOnceWith('OnlineGameWrapper: firstCandidate was deleted (opponent-doc-id)');
                // and the candidate has been deselected
                testUtils.expectElementNotToExist('#selected_' + OPPONENT.username);
                // and the candidate has been removed from the lobby
                expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL);
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
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);
                // and proposal should now be possible
                expect(testUtils.findElement('#proposeConfig').nativeElement.disabled)
                    .withContext('Proposing config should become possible after chosenPlayer is set')
                    .toBeFalsy();
                // and opponent should be selected
                testUtils.expectElementToExist('#selected_' + OPPONENT.username);
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
            component.authUser = OPPONENT_AUTH_USER;
            userService.startObservingAuthUser(component.authUser.userId);
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);
        }));
        describe('Arrival', () => {
            it('should add user to joiner doc', fakeAsync(async() => {
                spyOn(joinerDAOMock, 'update').and.callThrough();

                // When candidate arrives
                testUtils.detectChanges();
                tick();

                // Then the candidate is added to the joiner and the joiner is updated
                expect(joinerDAOMock.update).toHaveBeenCalledOnceWith('joinerId', {
                    candidates: [OPPONENT_AUTH_USER.username.get()],
                });
                expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
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
            }));
            it('should delete part when finding a disconnected creator', fakeAsync(async() => {
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
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
            }));
        });
        describe('Hoping to get chosen', () => {
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
                expectValidRouting(router, ['/lobby'], LobbyComponent);
            }));
            it('should delete part when observer seeing that creator goes offline', fakeAsync(async() => {
                spyOn(gameService, 'deletePart');
                spyOn(joinerService, 'deleteJoiner');
                spyOn(chatService, 'deleteChat');

                // Given a component with creator and candidate present
                testUtils.detectChanges();
                await testUtils.whenStable();
                await mockCandidateArrival();

                // When the creator goes offline
                await userDAOMock.update(CREATOR_AUTH_USER.userId, { state: 'offline' });
                testUtils.detectChanges();
                await testUtils.whenStable();

                // Then the part is deleted
                expect(gameService.deletePart).toHaveBeenCalledWith('joinerId');
                expect(joinerService.deleteJoiner).toHaveBeenCalledWith();
                expect(chatService.deleteChat).toHaveBeenCalledWith('joinerId');
            }));
            it('should start sending presence token once selected as chosen opponent', fakeAsync(async() => {
                // Given a partCreation where user is candidate
                spyOn(component, 'startSendingPresenceTokensIfNotDone').and.callThrough();
                testUtils.detectChanges();
                await testUtils.whenStable();

                // When user is selected as chosen opponent
                await joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
                testUtils.detectChanges();

                // Then "start sending token" should have been called
                expect(component.startSendingPresenceTokensIfNotDone).toHaveBeenCalledOnceWith();
                component.stopSendingPresenceTokensIfNeeded(); // To avoid finishing test with periodic timer in queue
            }));
        });
        describe('As the Chosen opponent', () => {
            it('each 5 second a presence token should be sent', fakeAsync(async() => {
                // Given a partCreation were you are already chosen as candidate
                testUtils.detectChanges();
                tick();
                await joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);

                // When 5 sec pass
                spyOn(userDAOMock, 'updatePresenceToken').and.callThrough();
                tick(PartCreationComponent.TOKEN_INTERVAL * 2);

                // Then a presence token should be emitted
                expect(userDAOMock.updatePresenceToken).toHaveBeenCalledTimes(2);
                component.stopSendingPresenceTokensIfNeeded(); // To avoid finishing test with periodic timer in queue
            }));
            it('should make config acceptation possible for joiner when config is proposed', fakeAsync(async() => {
                // Given a part in creation where the candidate is chosen
                testUtils.detectChanges();
                await testUtils.whenStable();
                await joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
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

/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';

import { GameCreationComponent } from './part-creation.component';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';

import { AbstractConfigRoomService, ConfigRoomService, ConfigRoomServiceFailure } from 'src/app/services/ConfigRoomService';
import { GameService } from 'src/app/services/GameService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { AuthUser, ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';

import { UserDAO } from 'src/app/dao/UserDAO';

import { ActivatedRouteStub, expectValidRouting, prepareUnsubscribeCheck, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { MGPOptional, Utils } from '@everyboard/lib';

import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { FirstPlayer, Status, GameType, ConfigRoom, GameDuration } from 'src/app/domain/ConfigRoom';
import { Game } from 'src/app/domain/Part';
import { CurrentGame } from 'src/app/domain/User';
import { CurrentGameMocks } from 'src/app/domain/mocks/CurrentGameMocks.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { FirestoreTime } from 'src/app/domain/Time';
import { UserService } from 'src/app/services/UserService';
import { CurrentGameService } from 'src/app/services/CurrentGameService';
import { LocalGameConfigurationComponent } from '../local-game-configuration/local-game-configuration.component';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ConfigRoomServiceMock } from 'src/app/services/tests/ConfigRoomServiceMock.spec';


describe('GameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<GameCreationComponent>;
    let component: GameCreationComponent;

    let userDAO: UserDAO;
    let userService: UserService;
    let configRoomService: ConfigRoomServiceMock;
    let gameService: GameService;
    let connectedUserService: ConnectedUserService;
    let currentGameService: CurrentGameService;

    let destroyed: boolean;

    const candidate: MinimalUser = UserMocks.CANDIDATE_MINIMAL_USER;

    async function receiveConfigRoomUpdate(configRoom: ConfigRoom): Promise<void> {
        configRoomService.mockConfigRoomUpdate(configRoom);
    }

    function awaitComponentInitialization(): void {
        testUtils.detectChanges();
        receiveConfigRoomUpdate(ConfigRoomMocks.getInitial(MGPOptional.empty()));
        tick(0);
    }

    async function proposeConfig(): Promise<void> {
        await clickElement('#proposeConfig');
    }
    async function chooseOpponent(): Promise<void> {
        await clickElement('#presenceOf_' + candidate.name);
        configRoomService.mockConfigRoomUpdate({
            ...ConfigRoomMocks.getInitial(MGPOptional.empty()),
            chosenOpponent: candidate,
        });
    }
    async function clickElement(elementName: string): Promise<void> {
        // [W] [medium] PartCreationComponent & TestUtils refactor
        testUtils.detectChanges();
        await testUtils.clickElement(elementName);
    }
    function expectElementToExist(elementName: string): void {
        // [W] [medium] PartCreationComponent & TestUtils refactor
        testUtils.detectChanges();
        testUtils.expectElementToExist(elementName);
    }
    function expectElementNotToExist(elementName: string): void {
        // [W] [medium] PartCreationComponent & TestUtils refactor
        testUtils.detectChanges();
        testUtils.expectElementNotToExist(elementName);
    }
    function findElement(elementName: string): DebugElement {
        // [W] [medium] PartCreationComponent & TestUtils refactor
        testUtils.detectChanges();
        return testUtils.findElement(elementName);
    }
    function expectElementToHaveClass(elementName: string, classes: string): void {
        // [W] [medium] PartCreationComponent & TestUtils refactor
        testUtils.detectChanges();
        testUtils.expectElementToHaveClass(elementName, classes);
    }
    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(GameCreationComponent, new ActivatedRouteStub('P4'));
        destroyed = false;
        userDAO = TestBed.inject(UserDAO);
        userService = TestBed.inject(UserService);
        configRoomService = TestBed.inject(ConfigRoomService) as AbstractConfigRoomService as ConfigRoomServiceMock;
        gameService = TestBed.inject(GameService);
        connectedUserService = TestBed.inject(ConnectedUserService);
        currentGameService = TestBed.inject(CurrentGameService);
        component = testUtils.getComponent();
        component.gameId = 'configRoomId';
        component.rulesConfigDescription = MGPOptional.empty();
        // await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        // await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('For creator', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            // meaning that before clicking it, user was subscribed to themself
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
        }));
        describe('Creator arrival on component', () => {
            it('should join the game', fakeAsync(() => {
                spyOn(configRoomService, 'join').and.callThrough();

                // When the component is loaded
                awaitComponentInitialization();

                // Then join and observe are called
                expect(configRoomService.join).toHaveBeenCalledTimes(1);
            }));

            // TODO: it should display an error in case of error? -> yes, on game-does-not-exist
    //         it('should not start observing configRoom if part does not exist', fakeAsync(async() => {
    //             // Given a part that does not exist
    //             component.partId = 'does not exist';
    //             spyOn(configRoomDAO, 'read').and.resolveTo(MGPOptional.empty());
    //             spyOn(configRoomService, 'subscribeToChanges').and.callThrough();

    //             // When the component is loaded
    //             // Then subscribeToChange is not called and a message is displayed
    //             await testUtils.expectToDisplayCriticalMessage(
    //                 ConfigRoomServiceFailure.GAME_DOES_NOT_EXIST(),
    //                 async() => {
    //                     awaitComponentInitialization();
    //                 });
    //             expect(configRoomService.subscribeToChanges).not.toHaveBeenCalled();
    //         }));

            it('should have button to go to lobby and cancel game', fakeAsync(async() => {
                // Given a game creation component
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo(true);
                awaitComponentInitialization();

                // When clicking on the "go to lobby" button
                const infoMessage: string = 'The game has been canceled!';
                await testUtils.expectToDisplayInfoMessage(infoMessage, async() => {
                    await clickElement('#go-to-lobby');
                });

                // Then it should navigate to the lobby
                expectValidRouting(router, ['/lobby'], LobbyComponent);
            }));

            it('should have button to play against AI and cancel game', fakeAsync(async() => {
                // Given a game creation component
                const router: Router = TestBed.inject(Router);
                spyOn(router, 'navigate').and.resolveTo(true);
                awaitComponentInitialization();

                // When clicking on the "play against AI" button
                const infoMessage: string = 'The game has been canceled!';
                await testUtils.expectToDisplayInfoMessage(infoMessage, async() => {
                    await clickElement('#play-against-ai');
                });
                // Then it should navigate to local game
                expectValidRouting(router, ['/local', 'P4', 'config'], LocalGameConfigurationComponent);
            }));
        });

        describe('Candidate arrival', () => {
            it('should make candidate choice possible for creator when candidate arrives', fakeAsync(async() => {
                // Given a component that is loaded and there is no candidate
                awaitComponentInitialization();
                expectElementNotToExist('#chooseOpponent');

                // When the candidate arrives
                configRoomService.mockCandidateJoined(candidate);

                // Then it is possible to choose a candidate
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.getInitial(MGPOptional.empty()));
                expectElementToExist('#chooseOpponent');
            }));
        });

        describe('Candidate/chosenOpponent clean departure', () => {
            it('should go back to start when ChosenOpponent leaves', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                expectElementToExist('#presenceOf_' + candidate.name);
                await chooseOpponent();
                expectElementToExist('#selected_' + candidate.name);

                // When the chosenOpponent leaves
                // and a toast to warn creator appears
                const infoMessage: string = candidate.name + ' left the game, please pick another opponent.';
                await testUtils.expectToDisplayInfoMessage(infoMessage, async() => {
                    await receiveConfigRoomUpdate({
                        ...ConfigRoomMocks.getInitial(MGPOptional.empty()),
                        status: Status.CREATED,
                        chosenOpponent: null,
                    });
                });
                configRoomService.mockCandidateLeft(candidate);
                testUtils.detectChanges();

                // Then it is not selected anymore
                expectElementNotToExist('#selected_' + candidate.name);
                // And configRoom when back to its initial state
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.getInitial(MGPOptional.empty()));
            }));

            it('should not display non chosen candidate anymore when they leaves', fakeAsync(async() => {
                // Given a page that has loaded, and a candidate joined
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                expectElementToExist('#presenceOf_' + candidate.name);

                // When the candidate leaves
                configRoomService.mockCandidateLeft(candidate);

                // Then it is still not selected, configRoom is back to start
                expectElementNotToExist('#presenceOf_' + candidate.name);
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.getInitial(MGPOptional.empty()));
            }));
        });

        describe('Chosing Opponent', () => {
            it('should modify config room, make proposal possible, and select opponent when choosing opponent', fakeAsync(async() => {
                // Given a component with candidate present but not selected
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                expectElementToExist('#presenceOf_' + candidate.name);

                const contextBefore: string = 'Proposing config should be impossible before there is a ChosenOpponent';
                expect(findElement('#proposeConfig').nativeElement.disabled).withContext(contextBefore).toBeTruthy();

                spyOn(configRoomService, 'selectOpponent');
                // When choosing the opponent
                await chooseOpponent();
                testUtils.detectChanges();

                // Then opponent selection should be send to config room service
                expect(configRoomService.selectOpponent).toHaveBeenCalledOnceWith(candidate);

                // and proposal should now be possible
                const proposeConfigDisabled: boolean = findElement('#proposeConfig').nativeElement.disabled;
                const contextAfter: string = 'Proposing config should become possible after ChosenOpponent is set';
                expect(proposeConfigDisabled).withContext(contextAfter).toBeFalse();

                // and opponent should be selected
                expectElementToExist('#selected_' + candidate.name);
            }));
        });

        describe('Config proposal', () => {
            it('should send what creator sees, not what is stored in the configRoom', fakeAsync(async() => {
                // Given a component where creator has changed the moveDuration and gameDuration and selected a candidate
                awaitComponentInitialization();
                await clickElement('#gameTypeCustom');
                Utils.getNonNullable(component.configFormGroup.get('moveDuration')).setValue(100);
                Utils.getNonNullable(component.configFormGroup.get('gameDuration')).setValue(1000);
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();

                // When proposing the config
                spyOn(configRoomService, 'proposeConfig').and.callThrough();
                await proposeConfig();

                // Then the data sent should be what creator saw
                expect(configRoomService.proposeConfig).toHaveBeenCalledOnceWith({
                    gameType: GameType.CUSTOM,
                    moveDuration: 100,
                    gameDuration: 1000,
                    firstPlayer: FirstPlayer.RANDOM,
                    rulesConfig: {},
                });
            }));

            it('should support blitz game', fakeAsync(async() => {
                // Given a component with a chosen opponent where blitz is selected
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();
                await clickElement('#gameTypeBlitz');

                // When proposing the config
                spyOn(configRoomService, 'proposeConfig').and.callThrough();
                await proposeConfig();

                // The blitz should be part of it
                expect(configRoomService.proposeConfig).toHaveBeenCalledOnceWith({
                    gameType: GameType.BLITZ,
                    moveDuration: GameDuration.BLITZ_MOVE_DURATION,
                    gameDuration: GameDuration.BLITZ_GAME_DURATION,
                    firstPlayer: FirstPlayer.RANDOM,
                    rulesConfig: {},
                });
            }));

            it('should change configRoom doc stored in component', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();

                // When proposing config and getting the update from the server
                await proposeConfig();
                configRoomService.mockConfigRoomUpdate({
                    ...ConfigRoomMocks.getInitialRandom(MGPOptional.empty()),
                    chosenOpponent: candidate,
                    status: Status.CONFIG_PROPOSED,
                });

                // Then currentConfigRoom should be updated with the proposed config
                const proposedConfig: ConfigRoom = {
                    ...ConfigRoomMocks.getInitialRandom(MGPOptional.empty()),
                    chosenOpponent: candidate,
                    status: Status.CONFIG_PROPOSED,
                };
                expect(component.currentConfigRoom).toEqual(proposedConfig);
            }));

            it('should not emit rules config when modifying field', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();
                spyOn(configRoomService, 'proposeConfig');

                // When changing a rules config but not saving config
                component.onRulesConfigUpdate(MGPOptional.of({ chaussettes_de_crepes: 5 }));

                // Then the config should not have been sent yet
                expect(configRoomService.proposeConfig).not.toHaveBeenCalled();
            }));

            it('should emit rules config when proposing config', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();

                // When changing a rules config then proposing config
                component.onRulesConfigUpdate(MGPOptional.of({ chaussettes_de_crepes: 5 }));
                spyOn(configRoomService, 'proposeConfig');
                await proposeConfig();

                // Then the proposed config should be sent
                expect(configRoomService.proposeConfig).toHaveBeenCalledOnceWith({
                    gameType: GameType.STANDARD,
                    moveDuration: GameDuration.STANDARD_MOVE_DURATION,
                    gameDuration: GameDuration.STANDARD_GAME_DURATION,
                    firstPlayer: FirstPlayer.RANDOM,
                    rulesConfig: {
                        chaussettes_de_crepes: 5,
                    },
                });
            }));

            it('should disable config proposition button when rules config is invalid', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();

                // When changing a rules config to something illegal
                // (then as a rule, we'll get informed by an empty optional)
                component.onRulesConfigUpdate(MGPOptional.empty());

                // Then the propose config should be disabled
                testUtils.expectElementToBeDisabled('#proposeConfig');
            }));

        });

        describe('Form interaction', () => {
            it('should update the form data when changing first player', fakeAsync(async() => {
                // Given a game being created
                awaitComponentInitialization();

                // When changing the first player
                await clickElement('#firstPlayerOpponent');

                // Then form is updated
                const firstPlayer: string = component.configFormGroup.get('firstPlayer')?.value;
                expect(firstPlayer).toEqual(FirstPlayer.CHOSEN_OPPONENT);
            }));

            it('should show detailed timing options when choosing a custom game type', fakeAsync(async() => {
                // Given a game being created
                awaitComponentInitialization();

                // When setting the game type to custom
                await clickElement('#gameTypeCustom');

                // Then the detailed timing options are shown
                expectElementToExist('#customTime');
            }));

            it('should update the timings when selecting blitz game', fakeAsync(async() => {
                // Given a game creation
                awaitComponentInitialization();

                // When setting the game type to 'blitz'
                await clickElement('#gameTypeBlitz');
                testUtils.detectChanges();

                // Then the timings in the form are updated
                const moveDuration: number = component.configFormGroup.get('moveDuration')?.value;
                expect(moveDuration).toBe(GameDuration.BLITZ_MOVE_DURATION);
                const gameDuration: number = component.configFormGroup.get('gameDuration')?.value;
                expect(gameDuration).toBe(GameDuration.BLITZ_GAME_DURATION);
            }));

            it('should update the timings when reselecting standard game', fakeAsync(async() => {
                // Given a game creation with blitz selected
                awaitComponentInitialization();
                await clickElement('#gameTypeBlitz');

                // When setting the game type back to standard
                await clickElement('#gameTypeStandard');
                testUtils.detectChanges();

                // Then the timings are updated
                const moveDuration: number = component.configFormGroup.get('moveDuration')?.value;
                expect(moveDuration).toBe(GameDuration.STANDARD_MOVE_DURATION);
                const gameDuration: number = component.configFormGroup.get('gameDuration')?.value;
                expect(gameDuration).toBe(GameDuration.STANDARD_GAME_DURATION);
            }));

            it('should go send for review when clicking on review config button', fakeAsync(async() => {
                // Given a game creation where the config has been proposed
                awaitComponentInitialization();
                configRoomService.mockConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.empty()))

                // When the config is reviewed
                spyOn(configRoomService, 'reviewConfig');
                await clickElement('#reviewConfig');

                // Then the information is sent to the service
                expect(configRoomService.reviewConfig).toHaveBeenCalledOnceWith();
            }));

            it('should remember settings after a configRoom update', fakeAsync(async() => {
                // Given a game creation with some changes to the config
                awaitComponentInitialization();
                await clickElement('#firstPlayerCreator');
                await clickElement('#gameTypeBlitz');

                // When a new candidate appears
                configRoomService.mockCandidateJoined(candidate);

                // Then the config does not change
                expectElementToHaveClass('#firstPlayerCreator', 'is-selected');
                expectElementToHaveClass('#gameTypeBlitz', 'is-selected');
            }));
        });
        describe('component destruction', () => {
            it('should unsubscribe from configRoom upon destruction', fakeAsync(async() => {
                // Given a component that is loaded by anyone (here, the creator) for a started game
                const expectConfigRoomUnsubscribeToHaveBeenCalled: () => void =
                    prepareUnsubscribeCheck(configRoomService, 'join');
                awaitComponentInitialization();
                spyOn(component, 'cancelGameCreation').and.resolveTo(); // spied in order to avoid calling it

                // When the component is destroyed
                destroyed = true;
                await component.ngOnDestroy();

                // Then the component unsubscribes from the configRoom subscription
                expectConfigRoomUnsubscribeToHaveBeenCalled();
            }));
        });
    });

    describe('Candidate', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component where user is a candidate
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
        }));
        it('should add user to configRoom candidates with service upon arrival', fakeAsync(() => {
            spyOn(configRoomService, 'join').and.callThrough();

            // When candidate arrives
            awaitComponentInitialization();

            // Then the candidate is added to the configRoom
            expect(configRoomService.join).toHaveBeenCalledTimes(1);
            // and the configRoom is updated once the service receives the update from the server
            const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
            configRoomService.mockConfigRoomUpdate(configRoom);
            // testUtils.detectChanges();
            expect(component.currentConfigRoom).toEqual(configRoom);
        }));
        // TODO it('should reroute to server when game is cancelled', fakeAsync(async() => {
        // TODO     const router: Router = TestBed.inject(Router);
        // TODO     spyOn(router, 'navigate').and.resolveTo(true);

        // TODO     // Given component that has loaded
        // TODO     awaitComponentInitialization();

        // TODO     // When the configRoom is deleted (because the game has been cancelled)
        // TODO     await testUtils.expectToDisplayInfoMessage('The game has been canceled!', async() => {

        // TODO         await configRoomDAO.delete('configRoomId');
        // TODO     });
        // TODO     testUtils.detectChanges();

        // TODO     // Then the user is rerouted to the server
        // TODO     expectValidRouting(router, ['/lobby'], LobbyComponent);
        // TODO }));
        describe('Chosen opponent', () => {
            it('should make config acceptation possible for configRoom when config is proposed', fakeAsync(async() => {
                // Given a game in creation where the candidate is chosen
                awaitComponentInitialization();
                await receiveConfigRoomUpdate(ConfigRoomMocks.withChosenOpponent(MGPOptional.empty()));
                testUtils.expectElementNotToExist('#acceptConfig');

                // When the config is proposed
                await receiveConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.empty()));

                // Then the candidate can accept the config
                expectElementToExist('#acceptConfig');
                // To avoid finishing test with periodic timer in queue
            }));

            it('should notify the service when accepting config', fakeAsync(async() => {
                // Given a game where the config has been proposed
                spyOn(configRoomService, 'acceptConfig');
                awaitComponentInitialization();
                await receiveConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.empty()));

                // When accepting the config
                await clickElement('#acceptConfig');
                tick(0);

                // Then it should call the service's acceptConfig
                expect(configRoomService.acceptConfig).toHaveBeenCalledOnceWith();
            }));
        });

        it('should emit game start notification when a game starts', fakeAsync(async() => {
            spyOn(component.gameStartNotification, 'emit').and.callThrough();
            // Given a game where the config has been proposed
            awaitComponentInitialization();
            await receiveConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.empty()));

            // When the config is finished and the game will start
            const acceptedConfigRoom: ConfigRoom = ConfigRoomMocks.withAcceptedConfig(MGPOptional.empty());
            await receiveConfigRoomUpdate(acceptedConfigRoom);

            // Then the game start notification is emitted
            expect(component.gameStartNotification.emit).toHaveBeenCalledWith(acceptedConfigRoom);
        }));
    });
    afterEach(fakeAsync(async() => {
        if (destroyed === false) {
            testUtils.destroy();
        }
    }));
});

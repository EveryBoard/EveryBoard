/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { P4Config, P4Rules } from 'src/app/games/p4/P4Rules';

import { MGPOptional, Utils } from '@everyboard/lib';

import { FirstPlayer, Status, GameType, ConfigRoom, GameDuration } from '../../../domain/ConfigRoom';
import { ConfigRoomMocks } from '../../../domain/ConfigRoomMocks.spec';
import { MinimalUser } from '../../../domain/MinimalUser';
import { UserMocks } from '../../../domain/UserMocks.spec';
import { AbstractConfigRoomService, ConfigRoomService } from '../../../services/ConfigRoomService';
import { ConfigRoomServiceMock } from '../../../services/tests/ConfigRoomServiceMock.spec';
import { ConnectedUserServiceMock } from '../../../services/tests/ConnectedUserService.spec';
import { ActivatedRouteStub, expectValidRouting, prepareUnsubscribeCheck, SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';
import { NotFoundComponent } from '../../normal-component/not-found/not-found.component';
import { WelcomeComponent } from '../../normal-component/welcome/welcome.component';
import { LocalGameConfigurationComponent } from '../local-game-configuration/local-game-configuration.component';

import { GameCreationComponent, GameCreationComponentMessages } from './game-creation.component';

describe('GameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<GameCreationComponent>;
    let component: GameCreationComponent;
    let router: Router;

    let configRoomService: ConfigRoomServiceMock;

    let destroyed: boolean;

    const candidate: MinimalUser = UserMocks.CANDIDATE_MINIMAL_USER;

    const defaultConfig: P4Config = P4Rules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

    async function receiveConfigRoomUpdate(configRoom: ConfigRoom): Promise<void> {
        configRoomService.mockConfigRoomUpdate(configRoom);
    }

    async function receiveError(error: string): Promise<void> {
        configRoomService.mockError(error);
    }

    async function receiveCancellation(): Promise<void> {
        configRoomService.mockDeletion();
    }

    async function awaitComponentInitialization(): Promise<void> {
        testUtils.detectChanges();
        await receiveConfigRoomUpdate(ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)));
        tick(0);
    }

    async function proposeConfig(): Promise<void> {
        await clickElement('#proposeConfig');
    }
    async function chooseOpponent(): Promise<void> {
        await clickElement('#presenceOf_' + candidate.name);
        configRoomService.mockConfigRoomUpdate({
            ...ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)),
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
        configRoomService = TestBed.inject(ConfigRoomService) as AbstractConfigRoomService as ConfigRoomServiceMock;
        component = testUtils.getComponent();
        component.gameId = 'configRoomId';
        component.rulesConfigDescription = MGPOptional.of(P4Rules.RULES_CONFIG_DESCRIPTION);
        router = TestBed.inject(Router);
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize properly', fakeAsync(async() => {
        // Given a component
        expect(component).toBeTruthy();
        // When it is loaded
        await awaitComponentInitialization();
        // Then it should not trigger any error
    }));

    it('should display an error if it receives already-subscribed from the server', fakeAsync(async() => {
        // Given a component that is loaded
        await awaitComponentInitialization();
        spyOn(router, 'navigate').and.resolveTo();

        // When an already-subscribed error is received
        // Then it should display the error and navigate to /lobby
        await testUtils.expectToDisplayCriticalMessage(
            'You already have another tab open.',
            async() => {
                await receiveError('already-subscribed');
                expectValidRouting(router, ['/'], WelcomeComponent);
            });
    }));

    it('should go to /notFound if it receives unknown-game from the server', fakeAsync(async() => {
        // Given a component that is loaded
        await awaitComponentInitialization();
        spyOn(router, 'navigate').and.resolveTo();

        // When an unknown-game error is received
        await receiveError('unknown-game');

        // Then it should navigate to /notFound
        const expectedRoute: string[] = ['/notFound', GameCreationComponentMessages.GAME_DOES_NOT_EXIST_OR_UNKNOWN()];
        expectValidRouting(router, expectedRoute, NotFoundComponent, { skipLocationChange: true });
    }));

    it('should display an error if it receives game-does-not-exist from the server', fakeAsync(async() => {
        // Given a component that is loaded
        await awaitComponentInitialization();
        spyOn(router, 'navigate').and.resolveTo();

        // When a game-does-not-exist error is received
        await receiveError('game-does-not-exist');

        // Then it should navigate to /
        const expectedRoute: string[] = ['/notFound', GameCreationComponentMessages.GAME_DOES_NOT_EXIST_OR_UNKNOWN()];
        expectValidRouting(router, expectedRoute, NotFoundComponent, { skipLocationChange: true });
    }));

    it('should display an error if it receives one from the backend', fakeAsync(async() => {
        // Given a component that is loaded
        await awaitComponentInitialization();
        spyOn(router, 'navigate').and.resolveTo();

        // When receiving an error from the backend
        // Then it should display the error and navigate to /
        await testUtils.expectToDisplayCriticalMessage(
            'Unexpected error from backend: unknown-message',
            async() => {
                await receiveError('unknown-message');
                expectValidRouting(router, ['/'], WelcomeComponent);
            });

    }));

    describe('For creator', () => {
        beforeEach(fakeAsync(async() => {
            // Given a component that is loaded by the creator
            // meaning that before clicking it, user was subscribed to themself
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
        }));
        describe('Creator arrival on component', () => {
            it('should join the game', fakeAsync(async() => {
                spyOn(configRoomService, 'join').and.callThrough();

                // When the component is loaded
                await awaitComponentInitialization();

                // Then join and observe are called
                expect(configRoomService.join).toHaveBeenCalledTimes(1);
            }));

            it('should have button to go to lobby and cancel game', fakeAsync(async() => {
                // Given a game creation component
                spyOn(router, 'navigate').and.resolveTo(true);
                await awaitComponentInitialization();

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
                spyOn(router, 'navigate').and.resolveTo(true);
                await awaitComponentInitialization();

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
                await awaitComponentInitialization();
                expectElementNotToExist('#chooseOpponent');

                // When the candidate arrives
                configRoomService.mockCandidateJoined(candidate);

                // Then it is possible to choose a candidate
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)));
                expectElementToExist('#chooseOpponent');
            }));
        });

        describe('Candidate/chosenOpponent clean departure', () => {
            it('should go back to start when ChosenOpponent leaves', fakeAsync(async() => {
                // Given a page that has loaded, a candidate joined and has been chosen as opponent
                await awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                expectElementToExist('#presenceOf_' + candidate.name);
                await chooseOpponent();
                expectElementToExist('#selected_' + candidate.name);

                // When the chosenOpponent leaves
                // and a toast to warn creator appears
                const infoMessage: string = candidate.name + ' left the game, please pick another opponent.';
                await testUtils.expectToDisplayInfoMessage(infoMessage, async() => {
                    await receiveConfigRoomUpdate({
                        ...ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)),
                        status: Status.CREATED,
                        chosenOpponent: null,
                    });
                });
                configRoomService.mockCandidateLeft(candidate);
                testUtils.detectChanges();

                // Then it is not selected anymore
                expectElementNotToExist('#selected_' + candidate.name);
                // And configRoom when back to its initial state
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)));
            }));

            it('should not display non chosen candidate anymore when they leaves', fakeAsync(async() => {
                // Given a page that has loaded, and a candidate joined
                await awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                expectElementToExist('#presenceOf_' + candidate.name);

                // When the candidate leaves
                configRoomService.mockCandidateLeft(candidate);

                // Then it is still not selected, configRoom is back to start
                expectElementNotToExist('#presenceOf_' + candidate.name);
                expect(component.currentConfigRoom).toEqual(ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)));
            }));
        });

        describe('Chosing Opponent', () => {
            it('should modify config room, make proposal possible, and select opponent when choosing opponent', fakeAsync(async() => {
                // Given a component with candidate present but not selected
                await awaitComponentInitialization();
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
                // Given a component where creator has changed the moveDuration
                // and gameDuration and selected a candidate
                await awaitComponentInitialization();
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
                    rulesConfig: defaultConfig,
                });
            }));

            it('should support blitz game', fakeAsync(async() => {
                // Given a component with a chosen opponent where blitz is selected
                await awaitComponentInitialization();
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
                    rulesConfig: defaultConfig,
                });
            }));

            it('should change configRoom doc stored in component', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                await awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();

                // When proposing config and getting the update from the server
                await proposeConfig();
                configRoomService.mockConfigRoomUpdate({
                    ...ConfigRoomMocks.getInitialRandom(MGPOptional.of(defaultConfig)),
                    chosenOpponent: candidate,
                    status: Status.CONFIG_PROPOSED,
                });

                // Then currentConfigRoom should be updated with the proposed config
                const proposedConfig: ConfigRoom = {
                    ...ConfigRoomMocks.getInitialRandom(MGPOptional.of(defaultConfig)),
                    chosenOpponent: candidate,
                    status: Status.CONFIG_PROPOSED,
                };
                expect(component.currentConfigRoom).toEqual(proposedConfig);
            }));

            it('should not emit rules config when modifying field', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                await awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();
                spyOn(configRoomService, 'proposeConfig');

                // When changing a rules config but not saving config
                component.onRulesConfigUpdate(MGPOptional.of({ width: 4, height: 2 }));

                // Then the config should not have been sent yet
                expect(configRoomService.proposeConfig).not.toHaveBeenCalled();
            }));

            it('should emit rules config when proposing config', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                await awaitComponentInitialization();
                configRoomService.mockCandidateJoined(candidate);
                await chooseOpponent();

                // When changing a rules config then proposing config
                const specialConfig: P4Config = { width: 4, height: 2 };
                component.onRulesConfigUpdate(MGPOptional.of(specialConfig));
                spyOn(configRoomService, 'proposeConfig');
                await proposeConfig();

                // Then the proposed config should be sent
                expect(configRoomService.proposeConfig).toHaveBeenCalledOnceWith({
                    gameType: GameType.STANDARD,
                    moveDuration: GameDuration.STANDARD_MOVE_DURATION,
                    gameDuration: GameDuration.STANDARD_GAME_DURATION,
                    firstPlayer: FirstPlayer.RANDOM,
                    rulesConfig: specialConfig,
                });
            }));

            it('should disable config proposition button when rules config is invalid', fakeAsync(async() => {
                // Given a component where creator selected a config and chose an opponent
                await awaitComponentInitialization();
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
                await awaitComponentInitialization();

                // When changing the first player
                await clickElement('#firstPlayerOpponent');

                // Then form is updated
                const firstPlayer: string = component.configFormGroup.get('firstPlayer')?.value;
                expect(firstPlayer).toEqual(FirstPlayer.CHOSEN_OPPONENT);
            }));

            it('should show detailed timing options when choosing a custom game type', fakeAsync(async() => {
                // Given a game being created
                await awaitComponentInitialization();

                // When setting the game type to custom
                await clickElement('#gameTypeCustom');

                // Then the detailed timing options are shown
                expectElementToExist('#customTime');
            }));

            it('should update the timings when selecting blitz game', fakeAsync(async() => {
                // Given a game creation
                await awaitComponentInitialization();

                // When setting the game type to 'blitz'
                await clickElement('#gameTypeBlitz');
                testUtils.detectChanges();

                // Then the timings in the form are updated
                const moveDuration: number = component.configFormGroup.get('moveDuration')?.value;
                expect(moveDuration).toBe(GameDuration.BLITZ_MOVE_DURATION);
                const gameDuration: number = component.configFormGroup.get('gameDuration')?.value;
                expect(gameDuration).toBe(GameDuration.BLITZ_GAME_DURATION);
            }));

            it('should update the timings when selecting standard game again', fakeAsync(async() => {
                // Given a game creation
                await awaitComponentInitialization();

                // When setting the game type to 'blitz' then back to 'standard'
                await clickElement('#gameTypeBlitz');
                testUtils.detectChanges();
                await clickElement('#gameTypeStandard');
                testUtils.detectChanges();

                // Then the timings in the form are updated
                const moveDuration: number = component.configFormGroup.get('moveDuration')?.value;
                expect(moveDuration).toBe(GameDuration.STANDARD_MOVE_DURATION);
                const gameDuration: number = component.configFormGroup.get('gameDuration')?.value;
                expect(gameDuration).toBe(GameDuration.STANDARD_GAME_DURATION);
            }));

            it('should send for review when clicking on review config button', fakeAsync(async() => {
                // Given a game creation where the config has been proposed
                await awaitComponentInitialization();
                configRoomService.mockConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.of(defaultConfig)));

                // When the config is reviewed
                spyOn(configRoomService, 'reviewConfig');
                await clickElement('#reviewConfig');

                // Then the information is sent to the service
                expect(configRoomService.reviewConfig).toHaveBeenCalledOnceWith();
            }));

            it('should remember settings after a configRoom update', fakeAsync(async() => {
                // Given a game creation with some changes to the config
                await awaitComponentInitialization();
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
                await awaitComponentInitialization();
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

        it('should add user to configRoom candidates with service upon arrival', fakeAsync(async() => {
            spyOn(configRoomService, 'join').and.callThrough();

            // When candidate arrives
            await awaitComponentInitialization();

            // Then the candidate is added to the configRoom
            expect(configRoomService.join).toHaveBeenCalledTimes(1);
            // and the configRoom is updated once the service receives the update from the server
            const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig));
            configRoomService.mockConfigRoomUpdate(configRoom);
            // testUtils.detectChanges();
            expect(component.currentConfigRoom).toEqual(configRoom);
        }));

        it('should be notified about game cancellation', fakeAsync(async() => {
            // Given a component that is loaded
            await awaitComponentInitialization();
            spyOn(router, 'navigate').and.resolveTo();

            // When the game is cancelled
            // Then we should be redirected to /
            await testUtils.expectToDisplayInfoMessage(
                'The game has been cancelled.',
                async() => {
                    await receiveCancellation();
                    expectValidRouting(router, ['/'], WelcomeComponent);
                });
        }));

        it('should update the view accordingly when receiving blitz update', fakeAsync(async() => {
            // Given a component that is loaded
            await awaitComponentInitialization();

            // When receiving a blitz update
            const update: ConfigRoom = {
                ...ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)),
                gameType: GameType.BLITZ,
                moveDuration: GameDuration.BLITZ_MOVE_DURATION,
                gameDuration: GameDuration.BLITZ_GAME_DURATION,
            };
            configRoomService.mockConfigRoomUpdate(update);
            testUtils.detectChanges();

            // Then the view is updated
            expect(component.viewInfo.moveDuration).toBe(GameDuration.BLITZ_MOVE_DURATION);
            expect(component.viewInfo.gameDuration).toBe(GameDuration.BLITZ_GAME_DURATION);
        }));

        it('should update the view accordingly when receiving custom update', fakeAsync(async() => {
            // Given a component that is loaded
            await awaitComponentInitialization();

            // When receiving a custom update
            const update: ConfigRoom = {
                ...ConfigRoomMocks.getInitial(MGPOptional.of(defaultConfig)),
                gameType: GameType.CUSTOM,
                moveDuration: 100,
                gameDuration: 1000,
            };
            configRoomService.mockConfigRoomUpdate(update);
            testUtils.detectChanges();

            // Then the view is updated
            expect(component.viewInfo.moveDuration).toBe(100);
            expect(component.viewInfo.gameDuration).toBe(1000);
        }));

        describe('Chosen opponent', () => {
            it('should make config acceptation possible for configRoom when config is proposed', fakeAsync(async() => {
                // Given a game in creation where the candidate is chosen
                await awaitComponentInitialization();
                await receiveConfigRoomUpdate(ConfigRoomMocks.withChosenOpponent(MGPOptional.of(defaultConfig)));
                testUtils.expectElementNotToExist('#acceptConfig');

                // When the config is proposed
                await receiveConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.of(defaultConfig)));

                // Then the candidate can accept the config
                expectElementToExist('#acceptConfig');
                // To avoid finishing test with periodic timer in queue
            }));

            it('should notify the service when accepting config', fakeAsync(async() => {
                // Given a game where the config has been proposed
                spyOn(configRoomService, 'acceptConfig');
                await awaitComponentInitialization();
                await receiveConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.of(defaultConfig)));

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
            await awaitComponentInitialization();
            await receiveConfigRoomUpdate(ConfigRoomMocks.withProposedConfig(MGPOptional.of(defaultConfig)));

            // When the config is finished and the game will start
            const acceptedConfigRoom: ConfigRoom = ConfigRoomMocks.withAcceptedConfig(MGPOptional.of(defaultConfig));
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

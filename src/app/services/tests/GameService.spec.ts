/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { GameService, StartingPartConfig } from '../GameService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { Part, PartDocument, MGPResult } from 'src/app/domain/Part';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { ConfigRoomDAOMock } from 'src/app/dao/tests/ConfigRoomDAOMock.spec';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { Player } from 'src/app/jscaip/Player';
import { Request } from 'src/app/domain/Request';
import { FirstPlayer, ConfigRoom, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Utils } from 'src/app/utils/utils';
import { ConfigRoomService } from '../ConfigRoomService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { ErrorLoggerService } from '../ErrorLoggerService';
import { ErrorLoggerServiceMock } from './ErrorLoggerServiceMock.spec';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Subscription } from 'rxjs';

describe('GameService', () => {

    let gameService: GameService;

    let partDAO: PartDAO;

    const MOVE_1: number = 161;
    const MOVE_2: number = 107;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: ConfigRoomDAO, useClass: ConfigRoomDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
            ],
        }).compileComponents();
        gameService = TestBed.inject(GameService);
        partDAO = TestBed.inject(PartDAO);
        ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
    }));
    it('should create', () => {
        expect(gameService).toBeTruthy();
    });
    it('Should delegate updateAndBumpIndex to the DAO update, and bump the index', async() => {
        // Given a part and an update to make to the part
        spyOn(partDAO, 'update').and.resolveTo();
        const update: Partial<Part> = {
            turn: 42,
        };

        // When calling updateAndBumpIndex
        await gameService.updateAndBumpIndex('partId', Player.ZERO, 73, update);

        // Then update should have been called with lastUpdate infos added to it
        const expectedUpdate: Partial<Part> = {
            lastUpdate: {
                index: 74,
                player: Player.ZERO.value,
            },
            turn: 42,
        };
        expect(partDAO.update).toHaveBeenCalledOnceWith('partId', expectedUpdate);
    });
    it('should delegate subscribeToChanges callback to partDAO', fakeAsync(async() => {
        // Given an existing part
        const part: Part = {
            lastUpdate: {
                index: 4,
                player: 0,
            },
            typeGame: 'Quarto',
            playerZero: UserMocks.CREATOR_MINIMAL_USER,
            playerOne: UserMocks.OPPONENT_MINIMAL_USER,
            turn: 2,
            listMoves: [MOVE_1, MOVE_2],
            result: MGPResult.UNACHIEVED.value,
        };
        await partDAO.set('partId', part);

        let calledCallback: boolean = false;
        const myCallback: (observedPart: MGPOptional<Part>) => void = (observedPart: MGPOptional<Part>) => {
            expect(observedPart.isPresent()).toBeTrue();
            expect(observedPart.get()).toEqual(part);
            calledCallback = true;
        };
        spyOn(partDAO, 'subscribeToChanges').and.callThrough();

        // When observing the part
        const subscription: Subscription = gameService.subscribeToChanges('partId', myCallback);

        // Then subscribeToChanges should be called on the DAO and the part should be observed
        expect(partDAO.subscribeToChanges).toHaveBeenCalledWith('partId', myCallback);
        expect(calledCallback).toBeTrue();

        subscription.unsubscribe();
    }));
    it('should delegate delete to PartDAO', fakeAsync(async() => {
        // Given the service at any moment
        spyOn(partDAO, 'delete').and.callFake(async(_id: string) => {return;});

        // When calling deletePart
        await gameService.deletePart('partId');

        // Then it should delegate to the DAO
        expect(partDAO.delete).toHaveBeenCalledOnceWith('partId');
    }));
    it('should forbid to accept a take back that the players proposed themselves', fakeAsync(async() => {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        const error: string = 'Illegal to accept your own request';
        for (const player of Player.PLAYERS) {
            const part: PartDocument = new PartDocument('configRoomId', {
                lastUpdate: {
                    index: 0,
                    player: player.value,
                },
                typeGame: 'Quarto',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                turn: 2,
                listMoves: [MOVE_1, MOVE_2],
                request: Request.takeBackAsked(player),
                result: MGPResult.UNACHIEVED.value,
            });
            await expectAsync(gameService.acceptTakeBack('configRoomId', part, player, [0, 1]))
                .toBeRejectedWithError('Assertion failure: ' + error);
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', error);
        }
    }));
    it('acceptConfig should delegate to ConfigRoomService and call startGameWithConfig', fakeAsync(async() => {
        const configRoomService: ConfigRoomService = TestBed.inject(ConfigRoomService);
        const configRoom: ConfigRoom = ConfigRoomMocks.WITH_PROPOSED_CONFIG;
        spyOn(configRoomService, 'acceptConfig').and.resolveTo();
        spyOn(partDAO, 'update').and.resolveTo();

        await gameService.acceptConfig('partId', configRoom);

        expect(configRoomService.acceptConfig).toHaveBeenCalledOnceWith('partId');
    }));
    it('createPartConfigRoomAndChat should create in this order: part, configRoom, and then chat', fakeAsync(async() => {
        const configRoomDAO: ConfigRoomDAO = TestBed.inject(ConfigRoomDAO);
        const chatDAO: ChatDAO = TestBed.inject(ChatDAO);
        // Install some mocks to check what we need
        // (we can't rely on toHaveBeenCalled on a mocked method, so we model this manually)
        let chatCreated: boolean = false;
        let configRoomCreated: boolean = false;
        spyOn(chatDAO, 'set').and.callFake(async(): Promise<void> => {
            chatCreated = true;
        });
        spyOn(configRoomDAO, 'set').and.callFake(async(): Promise<void> => {
            expect(chatCreated).withContext('configRoom should be created before the chat').toBeFalse();
            configRoomCreated = true;
        });
        spyOn(partDAO, 'create').and.callFake(async(): Promise<string> => {
            expect(chatCreated).withContext('part should be created before the chat').toBeFalse();
            expect(configRoomCreated).withContext('part should be created before the configRoom').toBeFalse();
            return 'partId';
        });

        // When calling createPartConfigRoomAndChat
        await gameService.createPartConfigRoomAndChat('Quarto');
        // Then, the order of the creations must be part, configRoom, chat (as checked by the mocks)
        // Moreover, everything needs to have been called eventually
        const part: Part = PartMocks.INITIAL;
        const configRoom: ConfigRoom = ConfigRoomMocks.INITIAL;
        expect(partDAO.create).toHaveBeenCalledOnceWith(part);
        expect(chatDAO.set).toHaveBeenCalledOnceWith('partId', {});
        expect(configRoomDAO.set).toHaveBeenCalledOnceWith('partId', configRoom);
    }));
    describe('getStartingConfig', () => {
        it('should put creator first when math.random() is below 0.5', fakeAsync(async() => {
            // given a configRoom config asking random start
            const configRoom: ConfigRoom = {
                chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                creator: UserMocks.CREATOR_MINIMAL_USER,
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };

            // when calling getStartingConfig
            spyOn(Math, 'random').and.returnValue(0.4);
            const startConfig: StartingPartConfig = gameService.getStartingConfig(configRoom);

            // then we should have a creator starting the game
            expect(startConfig.playerZero).toEqual(configRoom.creator);
            expect(startConfig.playerOne).toEqual(Utils.getNonNullable(configRoom.chosenOpponent));
        }));
        it('should put ChosenOpponent first when math.random() is over 0.5', fakeAsync(async() => {
            // given a configRoom config asking random start
            const configRoom: ConfigRoom = {
                chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                creator: UserMocks.CREATOR_MINIMAL_USER,
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };

            // when calling getStartingConfig
            spyOn(Math, 'random').and.returnValue(0.6);
            const startConfig: StartingPartConfig = gameService.getStartingConfig(configRoom);

            // then we should have a creator starting the game
            expect(startConfig.playerZero).toEqual(Utils.getNonNullable(configRoom.chosenOpponent));
            expect(startConfig.playerOne).toEqual(configRoom.creator);
        }));
    });
    describe('rematch', () => {
        let configRoomService: ConfigRoomService;
        let partDAO: PartDAO;
        beforeEach(() => {
            configRoomService = TestBed.inject(ConfigRoomService);
            partDAO = TestBed.inject(PartDAO);
        });
        it('should send request when proposing a rematch', fakeAsync(async() => {
            spyOn(gameService, 'sendRequest').and.resolveTo();

            await gameService.proposeRematch('partId', 0, Player.ZERO);

            expect(gameService.sendRequest).toHaveBeenCalledTimes(1);
        }));
        it('should start with the other player when first player mentionned in previous game', fakeAsync(async() => {
            // given a previous match with creator starting
            const lastPart: PartDocument = new PartDocument('partId', {
                lastUpdate: {
                    index: 4,
                    player: 0,
                },
                listMoves: [MOVE_1, MOVE_2],
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.VICTORY.value,
                turn: 2,
                typeGame: 'laMarelle',
                beginning: new Timestamp(1700102, 680000000),
                lastUpdateTime: new Timestamp(2, 3000000),
                loser: UserMocks.CREATOR_MINIMAL_USER,
                winner: UserMocks.OPPONENT_MINIMAL_USER,
                request: Request.rematchProposed(Player.ZERO),
            });
            const lastGameConfigRoom: ConfigRoom = {
                chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                creator: UserMocks.CREATOR_MINIMAL_USER,
                firstPlayer: 'CREATOR',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };
            spyOn(gameService, 'sendRequest').and.resolveTo();
            spyOn(configRoomService, 'readConfigRoomById').and.resolveTo(lastGameConfigRoom);
            let called: boolean = false;
            spyOn(partDAO, 'set').and.callFake(async(_id: string, element: Part) => {
                expect(element.playerZero).toEqual(Utils.getNonNullable(lastPart.data.playerOne));
                expect(element.playerOne).toEqual(Utils.getNonNullable(lastPart.data.playerZero));
                called = true;
            });

            // when accepting rematch
            await gameService.acceptRematch(lastPart, 5, Player.ONE);

            // then we should have a part created with playerOne and playerZero switched
            expect(called).toBeTrue();
        }));
        it('should start with the other player when first player was random', fakeAsync(async() => {
            // given a previous match with creator starting
            const lastPart: PartDocument = new PartDocument('partId', {
                lastUpdate: {
                    index: 4,
                    player: 0,
                },
                listMoves: [MOVE_1, MOVE_2],
                playerZero: UserMocks.OPPONENT_MINIMAL_USER,
                playerOne: UserMocks.CREATOR_MINIMAL_USER,
                result: MGPResult.VICTORY.value,
                turn: 2,
                typeGame: 'laMarelle',
                beginning: new Timestamp(1700102, 680000000),
                lastUpdateTime: new Timestamp(2, 3000000),
                loser: UserMocks.CREATOR_MINIMAL_USER,
                winner: UserMocks.OPPONENT_MINIMAL_USER,
                request: Request.rematchProposed(Player.ZERO),
            });
            const lastGameConfigRoom: ConfigRoom = {
                chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                creator: UserMocks.CREATOR_MINIMAL_USER,
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };
            spyOn(gameService, 'sendRequest').and.resolveTo();
            spyOn(configRoomService, 'readConfigRoomById').and.resolveTo(lastGameConfigRoom);
            let called: boolean = false;
            spyOn(partDAO, 'set').and.callFake(async(_id: string, element: Part) => {
                expect(element.playerZero).toEqual(Utils.getNonNullable(lastPart.data.playerOne));
                expect(element.playerOne).toEqual(Utils.getNonNullable(lastPart.data.playerZero));
                called = true;
            });

            // when accepting rematch
            await gameService.acceptRematch(lastPart, 5, Player.ONE);

            // then we should have a part created with playerOne and playerZero switched
            expect(called).toBeTrue();
        }));
        it('should create elements in this order: part, configRoom, and then chat', fakeAsync(async() => {
            const configRoomDAO: ConfigRoomDAO = TestBed.inject(ConfigRoomDAO);
            const chatDAO: ChatDAO = TestBed.inject(ChatDAO);
            // Given a part that will be replayed
            const lastPart: PartDocument = new PartDocument('partId', {
                lastUpdate: {
                    index: 4,
                    player: 0,
                },
                listMoves: [MOVE_1, MOVE_2],
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.VICTORY.value,
                turn: 2,
                typeGame: 'laMarelle',
                beginning: new Timestamp(1700102, 680000000),
                lastUpdateTime: new Timestamp(2, 3000000),
                loser: UserMocks.CREATOR_MINIMAL_USER,
                winner: UserMocks.OPPONENT_MINIMAL_USER,
                request: Request.rematchProposed(Player.ZERO),
            });
            const lastGameConfigRoom: ConfigRoom = {
                chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                creator: UserMocks.CREATOR_MINIMAL_USER,
                firstPlayer: FirstPlayer.CREATOR.value,
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };
            spyOn(gameService, 'sendRequest').and.resolveTo();
            spyOn(configRoomService, 'readConfigRoomById').and.resolveTo(lastGameConfigRoom);

            // Install some mocks to check what we need
            // (we can't rely on toHaveBeenCalled on a mocked method, so we model this manually)
            let chatCreated: boolean = false;
            let configRoomCreated: boolean = false;
            spyOn(chatDAO, 'set').and.callFake(async(): Promise<void> => {
                chatCreated = true;
            });
            spyOn(configRoomDAO, 'set').and.callFake(async(): Promise<void> => {
                expect(chatCreated).withContext('configRoom should be created before the chat').toBeFalse();
                configRoomCreated = true;
            });
            spyOn(partDAO, 'create').and.callFake(async(): Promise<string> => {
                expect(chatCreated).withContext('part should be created before the chat').toBeFalse();
                expect(configRoomCreated).withContext('part should be created before the configRoom').toBeFalse();
                return 'partId';
            });

            // When creator accepts the rematch
            await gameService.acceptRematch(lastPart, 5, Player.ONE);
            // Then, the order of the creations must be part, configRoom, chat (as checked by the mocks)
            // Moreover, everything needs to have been called eventually
            const part: Part = {
                lastUpdate: { index: 0, player: 1 },
                typeGame: 'laMarelle',
                playerZero: UserMocks.OPPONENT_MINIMAL_USER,
                playerOne: UserMocks.CREATOR_MINIMAL_USER,
                turn: 0,
                result: MGPResult.UNACHIEVED.value,
                listMoves: [],
                beginning: serverTimestamp(),
                remainingMsForZero: 25000,
                remainingMsForOne: 25000,
            };
            const configRoom: ConfigRoom = {
                chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
                creator: UserMocks.CREATOR_MINIMAL_USER,
                firstPlayer: FirstPlayer.CHOSEN_PLAYER.value,
                partType: PartType.BLITZ.value,
                partStatus: PartStatus.PART_STARTED.value,
                maximalMoveDuration: 10,
                totalPartDuration: 25,
            };
            expect(partDAO.create).toHaveBeenCalledOnceWith(part);
            expect(chatDAO.set).toHaveBeenCalledOnceWith('partId', {});
            expect(configRoomDAO.set).toHaveBeenCalledOnceWith('partId', configRoom);
        }));
    });
    describe('updateDBBoard', () => {
        const part: Part = {
            lastUpdate: {
                index: 4,
                player: 0,
            },
            typeGame: 'Quarto',
            playerZero: UserMocks.CREATOR_MINIMAL_USER,
            playerOne: UserMocks.OPPONENT_MINIMAL_USER,
            turn: 1,
            listMoves: [MOVE_1],
            request: null,
            result: MGPResult.UNACHIEVED.value,
        };
        beforeEach(() => {
            spyOn(partDAO, 'read').and.resolveTo(MGPOptional.of(part));
            spyOn(partDAO, 'update').and.resolveTo();
            spyOn(gameService, 'updateAndBumpIndex').and.callThrough();
        });
        it('should add scores to update when scores are present', fakeAsync(async() => {
            // when updating the board with scores
            const scores: [number, number] = [5, 0];
            await gameService.updateDBBoard('partId', Player.ONE, MOVE_2, [0, 0], scores);
            // then the update should contain the scores
            const expectedUpdate: Partial<Part> = {
                listMoves: [MOVE_1, MOVE_2],
                turn: 2,
                request: null,
                lastUpdateTime: serverTimestamp(),
                scorePlayerZero: 5,
                scorePlayerOne: 0,
            };
            expect(gameService.updateAndBumpIndex).toHaveBeenCalledOnceWith('partId', Player.ONE, 4, expectedUpdate);
        }));
        it('should include the draw notification if requested', fakeAsync(async() => {
            // when updating the board to notify of a draw
            await gameService.updateDBBoard('partId', Player.ONE, MOVE_2, [0, 0], undefined, true);
            // then the result is set to draw in the update
            const expectedUpdate: Partial<Part> = {
                lastUpdate: {
                    index: 5,
                    player: Player.ONE.value,
                },
                listMoves: [MOVE_1, MOVE_2],
                turn: 2,
                request: null,
                lastUpdateTime: serverTimestamp(),
                result: MGPResult.HARD_DRAW.value,
            };
            expect(partDAO.update).toHaveBeenCalledWith('partId', expectedUpdate);
        }));
    });
    describe('acceptDraw', () => {
        for (const player of Player.PLAYERS) {
            it('should send AGREED_DRAW_BY_ZERO/ONE when call as ZERO/ONE', async() => {
                // Given any state of service
                spyOn(partDAO, 'update').and.callFake(async(_id: string, _update: Partial<Part>) => {return;});

                // When calling acceptDraw as the player
                await gameService.acceptDraw('configRoomId', 5, player);

                // Then PartDAO should have been called with the appropriate MGPResult
                const result: number = [
                    MGPResult.AGREED_DRAW_BY_ZERO.value,
                    MGPResult.AGREED_DRAW_BY_ONE.value][player.value];
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 6,
                        player: player.value,
                    },
                    request: null,
                    result,
                });
            });
        }
    });
});

/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { GameService } from '../GameService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { Part, MGPResult } from 'src/app/domain/Part';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { ConfigRoomDAOMock } from 'src/app/dao/tests/ConfigRoomDAOMock.spec';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JSONValue, MGPOptional, MGPValidation, MGPValidationTestUtils } from '@everyboard/lib';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { Subscription } from 'rxjs';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { BackendService } from '../BackendService';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';

describe('GameService', () => {

    let gameService: GameService;
    let partDAO: PartDAO;
    let backendService: BackendService;

    async function expectToDelegateTo<T>(method: keyof BackendService,
                                         // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                         expectedArgs: any[], returnValue: any,
                                         call: () => Promise<T>)
    : Promise<T>
    {
        spyOn(backendService, method).and.callFake(async() => returnValue);
        const result: T = await call();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(backendService[method]).toHaveBeenCalledOnceWith(...expectedArgs as any);
        return result;
    }

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
        backendService = TestBed.inject(BackendService);
        ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
    }));


    it('should create', () => {
        expect(gameService).toBeTruthy();
    });

    it('should delegate subscribeToChanges callback to partDAO', fakeAsync(async() => {
        // Given an existing part
        const part: Part = {
            typeGame: 'Quarto',
            playerZero: UserMocks.CREATOR_MINIMAL_USER,
            playerOne: UserMocks.OPPONENT_MINIMAL_USER,
            turn: 2,
            result: MGPResult.UNACHIEVED.value,
        };
        await partDAO.set('partId', part);

        let calledCallback: boolean = false;
        const myCallback: (currentGame: MGPOptional<Part>) => void = (currentGame: MGPOptional<Part>) => {
            expect(currentGame.isPresent()).toBeTrue();
            expect(currentGame.get()).toEqual(part);
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

    describe('getGameValidity', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given an existing game
            const gameId: string = 'gameId';
            const gameName: string = 'P4';
            spyOn(backendService, 'getGameName').and.callFake(async() => MGPOptional.of(gameName));

            // When calling getGameValidity
            const result: MGPValidation = await gameService.getGameValidity(gameId, gameName);

            // Then it should have delegated to the backend
            expect(backendService.getGameName).toHaveBeenCalledOnceWith(gameId);
            MGPValidationTestUtils.expectToBeSuccess(result);
        }));

        it('should fail if the game does not exist', fakeAsync(async() => {
            // Given a game that does not exist
            const gameId: string = 'gameId';
            const gameName: string = 'P4';
            spyOn(backendService, 'getGameName').and.callFake(async() => MGPOptional.empty());

            // When calling getGameValidity
            const result: MGPValidation = await gameService.getGameValidity(gameId, gameName);

            // Then it should have delegated to the backend and failed
            expect(backendService.getGameName).toHaveBeenCalledOnceWith(gameId);
            MGPValidationTestUtils.expectToBeFailure(result, 'This game does not exist!');
        }));

        it('should fail if the game is not the one we want', fakeAsync(async() => {
            // Given a game that is not the one we expect
            const gameId: string = 'gameId';
            const gameName: string = 'P4';

            spyOn(backendService, 'getGameName').and.callFake(async() => MGPOptional.of('Quarto'));

            // When calling getGameValidity
            const result: MGPValidation = await gameService.getGameValidity(gameId, gameName);

            // Then it should have delegated to the backend and failed
            expect(backendService.getGameName).toHaveBeenCalledOnceWith(gameId);
            MGPValidationTestUtils.expectToBeFailure(result, 'This is the wrong game type!');
        }));
    });

    describe('createPartConfigRoomAndChat', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameName: string = 'P4';

            // When creating it
            // Then it should have delegated to the backend
            const result: string = await expectToDelegateTo('createGame', [gameName], 'gameId', async() => {
                return gameService.createPartConfigRoomAndChat(gameName);
            });
            expect(result).toBe('gameId');
        }));
    });

    describe('deletePart', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';

            // When deleting it
            // Then it should delegate to the backend
            await expectToDelegateTo('deleteGame', [gameId], undefined, () => {
                return gameService.deletePart(gameId);
            });
        }));
    });

    describe('acceptConfig', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When accepting its config
            // Then it should delegate to the backend
            await expectToDelegateTo('acceptConfig', [gameId], undefined, () => {
                return gameService.acceptConfig(gameId);
            });
        }));
    });

    describe('getExistingGame', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            const game: Part = {
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: -1,
                result: 0,
            };

            // When getting the game
            // Then it should delegate to the backend
            const result: Part = await expectToDelegateTo('getGame', [gameId], game, () => {
                return gameService.getExistingGame(gameId);
            });
            expect(result).toEqual(game);
        }));
    });

    describe('resign', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When resigning
            // Then it should delegate to the backend
            await expectToDelegateTo('resign', [gameId], undefined, () => {
                return gameService.resign(gameId);
            });
        }));
    });

    describe('notifyTimeout', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            const winner: MinimalUser = UserMocks.CREATOR_MINIMAL_USER;
            const loser: MinimalUser = UserMocks.OPPONENT_MINIMAL_USER;
            // When notifying a timeout
            // Then it should delegate to the backend
            await expectToDelegateTo('notifyTimeout', [gameId, winner, loser], undefined, () => {
                return gameService.notifyTimeout(gameId, winner, loser);
            });
        }));
    });

    describe('proposeDraw', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When proposing a draw
            // Then it should delegate to the backend
            await expectToDelegateTo('proposeDraw', [gameId], undefined, () => {
                return gameService.proposeDraw(gameId);
            });
        }));
    });

    describe('acceptDraw', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When accepting a draw
            // Then it should delegate to the backend
            await expectToDelegateTo('acceptDraw', [gameId], undefined, () => {
                return gameService.acceptDraw(gameId);
            });
        }));
    });

    describe('refuseDraw', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When refusing a draw
            // Then it should delegate to the backend
            await expectToDelegateTo('refuseDraw', [gameId], undefined, () => {
                return gameService.refuseDraw(gameId);
            });
        }));
    });

    describe('proposeRematch', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When proposing a rematch
            // Then it should delegate to the backend
            await expectToDelegateTo('proposeRematch', [gameId], undefined, () => {
                return gameService.proposeRematch(gameId);
            });
        }));
    });

    describe('rejectRematch', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When rejecting a rematch
            // Then it should delegate to the backend
            await expectToDelegateTo('rejectRematch', [gameId], undefined, () => {
                return gameService.rejectRematch(gameId);
            });
        }));
    });

    describe('acceptRematch', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When accepting a rematch
            // Then it should delegate to the backend
            await expectToDelegateTo('acceptRematch', [gameId], undefined, () => {
                return gameService.acceptRematch(gameId);
            });
        }));
    });

    describe('askTakeBack', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When asking a take back
            // Then it should delegate to the backend
            await expectToDelegateTo('askTakeBack', [gameId], undefined, () => {
                return gameService.askTakeBack(gameId);
            });
        }));
    });

    describe('acceptTakeBack', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When accepting a take back
            // Then it should delegate to the backend
            await expectToDelegateTo('acceptTakeBack', [gameId], undefined, () => {
                return gameService.acceptTakeBack(gameId);
            });
        }));
    });

    describe('refuseTakeBack', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When refusing a take back
            // Then it should delegate to the backend
            await expectToDelegateTo('refuseTakeBack', [gameId], undefined, () => {
                return gameService.refuseTakeBack(gameId);
            });
        }));
    });

    describe('addGlobalTime', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When adding global time
            // Then it should delegate to the backend
            await expectToDelegateTo('addGlobalTime', [gameId], undefined, () => {
                return gameService.addGlobalTime(gameId);
            });
        }));
    });

    describe('addTurnTime', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            // When adding turn time
            // Then it should delegate to the backend
            await expectToDelegateTo('addTurnTime', [gameId], undefined, () => {
                return gameService.addTurnTime(gameId);
            });
        }));
    });

    describe('addMove', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            const move: JSONValue = { x: 0 };
            const scores: MGPOptional<PlayerNumberMap> = MGPOptional.empty();
            // When adding move
            // Then it should delegate to the backend
            await expectToDelegateTo('move', [gameId, move, scores], undefined, () => {
                return gameService.addMove(gameId, move, scores);
            });
        }));
    });

    describe('addMoveAndEndGame', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a game
            const gameId: string = 'gameId';
            const move: JSONValue = { x: 0 };
            const scores: MGPOptional<PlayerNumberMap> = MGPOptional.empty();
            const winner: PlayerOrNone = Player.ZERO;
            // When adding move and ending game
            // Then it should delegate to the backend
            await expectToDelegateTo('moveAndEnd', [gameId, move, scores, winner], undefined, () => {
                return gameService.addMoveAndEndGame(gameId, move, scores, winner);
            });
        }));
    });

});

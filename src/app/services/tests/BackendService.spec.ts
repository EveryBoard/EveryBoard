/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync } from '@angular/core/testing';
import { BackendService } from '../BackendService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { AppModule } from 'src/app/app.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ConnectedUserService } from '../ConnectedUserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Part } from 'src/app/domain/Part';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { JSONValue } from 'src/app/utils/utils';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MGPValidation } from 'src/app/utils/MGPValidation';

fdescribe('BackendService', () => {
    let backendService: BackendService;

    function expectedParams(method: 'POST' | 'GET' | 'DELETE'): object {
        return {
            method,
            headers: {
                Authorization: 'Bearer idToken',
            },
        };
    }

    function endpoint(path: string): string {
        return 'http://localhost:8081' + path;
    }

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();
        backendService = TestBed.inject(BackendService);
        spyOn(TestBed.inject(ConnectedUserService), 'getIdToken').and.callFake(async() => {
            return 'idToken';
        });
    });

    describe('createGame', () => {
        it('should fetch expected resource and extract game id', fakeAsync(async() => {
            const response: Response = Response.json({ id: 'game-id' });
            spyOn(window, 'fetch').and.resolveTo(response);
            // When calling createGame
            const gameId: string = await backendService.createGame('P4');
            // Then it should fetch the expected resource and return the game id
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint('/game?gameName=P4'), expectedParams('POST'));
            expect(gameId).toEqual('game-id');
        }));
    });

    describe('getGameName', () => {
        it('should fetch expected resource and extract game name', fakeAsync(async() => {
            // Given an existing game
            const response: Response = Response.json({ gameName: 'P4' });
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When calling getGameName
            const gameName: MGPOptional<string> = await backendService.getGameName(gameId);
            // Then it should fetch the expected resource and return the game name
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint(`/game/${gameId}?onlyGameName`), expectedParams('GET'));
            expect(gameName).toEqual(MGPOptional.of('P4'));
        }));

        it('should return MGPOptional.empty if there is no corresponding game', fakeAsync(async() => {
            // Given a game id corresponding to no game
            const response: Response = Response.error();
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When calling getGameName
            const gameName: MGPOptional<string> = await backendService.getGameName(gameId);
            // Then it should fetch the expected resource and return no game name
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint(`/game/${gameId}?onlyGameName`), expectedParams('GET'));
            expect(gameName).toEqual(MGPOptional.empty());
        }));
    });

    describe('getGame', () => {
        it('should fetch expected resource and extract game name', fakeAsync(async() => {
            // Given a game
            const game: Part = PartMocks.INITIAL;
            const response: Response = Response.json(game);
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When calling getGame
            const actualGame: Part = await backendService.getGame(gameId);
            // Then it should fetch the full game
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint(`/game/${gameId}`), expectedParams('GET'));
            expect(actualGame).toEqual(game);
        }));
    });

    describe('deleteGame', () => {
        it('should delete the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When calling deleteGame
            await backendService.deleteGame(gameId);
            // Then it should delete the resource
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint(`/game/${gameId}`), expectedParams('DELETE'));
        }));
    });

    describe('acceptConfig', () => {
        it('should POST on the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When calling acceptConfig
            await backendService.acceptConfig(gameId);
            // Then it should post on the expected resource
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint(`/config-room/${gameId}?action=accept`), expectedParams('POST'));
        }));
    });

    describe('resign', () => {
        it('should POST on the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When calling resign
            await backendService.resign(gameId);
            // Then it should post on the expected resource
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint(`/game/${gameId}?action=resign`), expectedParams('POST'));
        }));
    });

    describe('notifyTimeout', () => {
        it('should POST on the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When calling notifyTimeout
            const winner: MinimalUser = UserMocks.CANDIDATE_MINIMAL_USER;
            const loser: MinimalUser = UserMocks.OPPONENT_MINIMAL_USER;
            await backendService.notifyTimeout(gameId, winner, loser);
            // Then it should post on the expected resource
            const winnerStr: string = encodeURIComponent(JSON.stringify(winner));
            const loserStr: string = encodeURIComponent(JSON.stringify(loser));
            const expectedEndpoint: string = endpoint(`/game/${gameId}?action=notifyTimeout&winner=${winnerStr}&loser=${loserStr}`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
        }));
    });

    function testSimpleAction(methodName: string, action: string): void {
        describe(methodName, () => {
            it('should POST on the expected resource', fakeAsync(async() => {
                // Given a game
                const response: Response = { status: 200 } as unknown as Response;
                spyOn(window, 'fetch').and.resolveTo(response);
                const gameId: string = 'game-id';
                // When doing the action
                await backendService[methodName](gameId);
                // Then it should post on the expected resource
                expect(window.fetch).toHaveBeenCalledOnceWith(endpoint(`/game/${gameId}?action=${action}`), expectedParams('POST'));
            }));
        });
    }

    testSimpleAction('proposeDraw', 'proposeDraw');
    testSimpleAction('acceptDraw', 'acceptDraw');
    testSimpleAction('refuseDraw', 'refuseDraw');
    testSimpleAction('proposeRematch', 'proposeRematch');
    testSimpleAction('acceptRematch', 'acceptRematch');
    testSimpleAction('rejectRematch', 'rejectRematch');
    testSimpleAction('askTakeBack', 'askTakeBack');
    testSimpleAction('acceptTakeBack', 'acceptTakeBack');
    testSimpleAction('refuseTakeBack', 'refuseTakeBack');
    testSimpleAction('addGlobalTime', 'addGlobalTime');
    testSimpleAction('addTurnTime', 'addTurnTime');

    describe('move', () => {

        it('should POST on the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When doing a move
            const move: JSONValue = { x: 1 };
            await backendService.move(gameId, move, MGPOptional.empty());
            // Then it should post on the expected resource
            const moveStr: string = encodeURIComponent(JSON.stringify(move));
            const expectedEndpoint: string = endpoint(`/game/${gameId}?action=move&move=${moveStr}`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
        }));

        it('should POST on the expected resource (with scores)', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When doing a move (with scores)
            const move: JSONValue = { x: 1 };
            const scores: PlayerNumberMap = PlayerNumberMap.of(0, 1);
            await backendService.move(gameId, move, MGPOptional.of(scores));
            // Then it should post on the expected resource
            const moveStr: string = encodeURIComponent(JSON.stringify(move));
            const expectedEndpoint: string = endpoint(`/game/${gameId}?action=move&move=${moveStr}&score0=${scores.get(Player.ZERO)}&score1=${scores.get(Player.ONE)}`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
        }));
    });

    describe('moveAndEnd', () => {

        it('should POST on the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When doing a move
            const move: JSONValue = { x: 1 };
            await backendService.moveAndEnd(gameId, move, MGPOptional.empty(), PlayerOrNone.NONE);
            // Then it should post on the expected resource
            const moveStr: string = encodeURIComponent(JSON.stringify(move));
            const expectedEndpoint: string = endpoint(`/game/${gameId}?action=moveAndEnd&move=${moveStr}`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
        }));

        it('should POST on the expected resource (with scores)', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When doing a move (with scores)
            const move: JSONValue = { x: 1 };
            const scores: PlayerNumberMap = PlayerNumberMap.of(0, 1);
            await backendService.moveAndEnd(gameId, move, MGPOptional.of(scores), PlayerOrNone.NONE);
            // Then it should post on the expected resource
            const moveStr: string = encodeURIComponent(JSON.stringify(move));
            const expectedEndpoint: string = endpoint(`/game/${gameId}?action=moveAndEnd&move=${moveStr}&score0=${scores.get(Player.ZERO)}&score1=${scores.get(Player.ONE)}`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
        }));

        it('should POST on the expected resource (with winner)', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When doing a move
            const move: JSONValue = { x: 1 };
            await backendService.moveAndEnd(gameId, move, MGPOptional.empty(), Player.ZERO);
            // Then it should post on the expected resource
            const moveStr: string = encodeURIComponent(JSON.stringify(move));
            const expectedEndpoint: string = endpoint(`/game/${gameId}?action=moveAndEnd&move=${moveStr}&winner=0`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
        }));
    });

    describe('getServerTime', () => {
        it('should fetch the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = Response.json({ time: 42 });
            spyOn(window, 'fetch').and.resolveTo(response);
            // When fetching the server time
            const time: number = await backendService.getServerTime();
            // Then it should fetch the expected resource and return the time
            expect(window.fetch).toHaveBeenCalledOnceWith(endpoint('/time'), expectedParams('GET'));
            expect(time).toEqual(42);
        }));
    });

    describe('joinGame', () => {
        it('should POST to the expected resource', fakeAsync(async() => {
            // Given a game
            const response: Response = { status: 200 } as unknown as Response;
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When joining it move
            const result: MGPValidation = await backendService.joinGame(gameId);
            // Then it should post on the expected resource
            const expectedEndpoint: string = endpoint(`/config-room/${gameId}/candidates`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
            expect(result).toEqual(MGPValidation.SUCCESS);
        }));
        it('should fail if the game does not exist', fakeAsync(async() => {
            // Given a game
            const response: Response = {
                ...Response.json({ reason: 'Game does not exist' }),
                status: 404,
            };
            spyOn(window, 'fetch').and.resolveTo(response);
            const gameId: string = 'game-id';
            // When joining it move
            const result: MGPValidation = await backendService.joinGame(gameId);
            // Then it should post on the expected resource
            const expectedEndpoint: string = endpoint(`/config-room/${gameId}/candidates`);
            expect(window.fetch).toHaveBeenCalledOnceWith(expectedEndpoint, expectedParams('POST'));
            expect(result).toEqual(MGPValidation.failure('foo'));
        }));
    });
});

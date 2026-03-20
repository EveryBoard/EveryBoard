/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { JSONValue, MGPFallible, MGPOptional } from '@everyboard/lib';

import { Game, GameEvent } from '../../domain/Game';
import { GameMocks } from '../../domain/PartMocks.spec';
import { UserMocks } from '../../domain/UserMocks.spec';
import { Player } from '../../jscaip/Player';
import { AbstractBackendService, BackendMessage, BackendService } from '../BackendService';
import { GameService } from '../GameService';

import { BackendServiceMock } from './BackendServiceMock.spec';

describe('GameService', () => {

    let backendService: BackendServiceMock;
    let gameService: GameService;

    async function ignore(): Promise<void> {}

    function receiveGameUpdate(game: Game): void {
        backendService.mockReceivedMessage('GameUpdate', { game });
        tick(1);
    }

    function receiveGameEvent(event: GameEvent, serverTime: number): void {
        backendService.mockReceivedMessage('GameEvent', { event, serverTime });
        tick(1);
    }

    function receiveError(reason: string): void {
        backendService.mockReceivedMessage('Error', { reason });
        tick(1);
    }

    beforeEach(fakeAsync(async() => {
        backendService = new BackendServiceMock();
        gameService = new GameService(backendService as AbstractBackendService as BackendService);
    }));


    it('should create', () => {
        expect(gameService).toBeTruthy();
    });

    describe('subscribeTo', () => {
        it('should notify about game updates', fakeAsync(async() => {
            // Given a service which has subscribed to a game
            let game: MGPOptional<Game> = MGPOptional.empty();
            const subscription: Subscription =
                await gameService.subscribeTo('gameId',
                                              async(update: Game): Promise<void> => {
                                                  game = MGPOptional.of(update);
                                              },
                                              ignore,
                                              ignore);
            // When there is a game update
            const updatedGame: Game = GameMocks.STARTED;
            receiveGameUpdate(updatedGame);
            // Then we are notified about it
            expect(game.isPresent()).toBeTrue();
            expect(game.get()).toEqual(updatedGame);
            subscription.unsubscribe();
        }));

        it('should notify about game events', fakeAsync(async() => {
            // Given a service which has subscribed to a game
            let event: MGPOptional<GameEvent> = MGPOptional.empty();
            let serverTime: MGPOptional<number> = MGPOptional.empty();
            const subscription: Subscription =
                await gameService.subscribeTo('gameId',
                                              ignore,
                                              async(e: GameEvent, time: number): Promise<void> => {
                                                  event = MGPOptional.of(e);
                                                  serverTime = MGPOptional.of(time);
                                              },
                                              ignore);
            // When there is a game event
            const receivedEvent: GameEvent = {
                timestamp: 42,
                user: UserMocks.CREATOR_MINIMAL_USER,
                eventType: 'Move',
                move: { x: 42 },
            };
            const receivedServerTime: number = 1234;
            receiveGameEvent(receivedEvent, receivedServerTime);
            // Then we are notified about it
            expect(event.isPresent()).toBeTrue();
            expect(event.get()).toEqual(receivedEvent);
            expect(serverTime.isPresent()).toBeTrue();
            expect(serverTime.get()).toBe(receivedServerTime);
            subscription.unsubscribe();
        }));

        it('should notify about errors', fakeAsync(async() => {
            // Given a service which has subscribed to a game
            let error: MGPOptional<string> = MGPOptional.empty();
            const subscription: Subscription =
                await gameService.subscribeTo('gameId',
                                              ignore,
                                              ignore,
                                              (reason: string): void => {
                                                  error = MGPOptional.of(reason);
                                              });
            // When there is a game update
            const receivedError: string = 'unknown-message';
            receiveError(receivedError);
            // Then we are notified about it
            expect(error.isPresent()).toBeTrue();
            expect(error.get()).toEqual(receivedError);
            subscription.unsubscribe();
        }));

        it('should properly unsubscribe', fakeAsync(async() => {
            // Given a service which has subscribed to a game, then unsubscribed
            let observedSomething: boolean = false;
            const subscription: Subscription =
                await gameService.subscribeTo('gameId',
                                              async(_game: Game): Promise<void> => {
                                                  observedSomething = true;
                                              },
                                              async(_event: GameEvent, _time: number): Promise<void> => {
                                                  observedSomething = true;
                                              },
                                              (): void => {
                                                  observedSomething = true;
                                              });
            subscription.unsubscribe();
            // When there is any update
            receiveGameUpdate(GameMocks.STARTED);
            receiveGameEvent({
                timestamp: 42,
                user: UserMocks.CREATOR_MINIMAL_USER,
                eventType: 'Move',
                move: { x: 42 },
            }, 1234);
            receiveError('unknown-message');
            // Then we are not notified about any update
            expect(observedSomething).toBeFalse();
        }));
    });

    describe('createGame', () => {
        it('should delegate to backend and retrieve the created game id', fakeAsync(async() => {
            // Given a game service
            const gameIdFromBackend: string = '1234';
            // When creating a game
            spyOn(backendService, 'sendAndWaitForReply').and.callFake(
                async(_message: JSONValue, _replyTag: string): Promise<MGPFallible<BackendMessage>> => {
                    // When the backend receives the game creation message, it creates the game and replies with the id
                    return MGPFallible.success(new BackendMessage('GameCreated', { gameId: gameIdFromBackend }));
                });
            const gameId: MGPFallible<string> = await gameService.createGame('P4');
            // Then it should return the created game
            expect(gameId.isSuccess()).toBeTrue();
            expect(gameId.get()).toBe(gameIdFromBackend);
        }));

        it('should delegate to backend and retrieve errors when there is one', fakeAsync(async() => {
            // Given a game service
            // When creating a game but receiving an error
            spyOn(backendService, 'sendAndWaitForReply').and.callFake(
                async(_message: JSONValue, _replyTag: string): Promise<MGPFallible<BackendMessage>> => {
                    // When the backend receives the game creation message, it creates the game and replies with the id
                    return MGPFallible.failure('some-reason');
                });
            const gameId: MGPFallible<string> = await gameService.createGame('P4');
            // Then it should return the error
            expect(gameId.isFailure()).toBeTrue();
            expect(gameId.getReason()).toBe('some-reason');
        }));
    });

    describe('actions', () => {
        function testAction(name: string, action: () => Promise<void>, expectedMessage: JSONValue): void {
            it('should send the expected message for ' + name, fakeAsync(async() => {
                // Given a game service
                spyOn(backendService, 'send').and.callThrough();
                // When performing the action
                await action();
                // Then it should have sent the expected message to the backend
                expect(backendService.send).toHaveBeenCalledOnceWith(expectedMessage);
            }));
        }
        testAction('resign', async() => gameService.resign(), ['Resign']);
        testAction('notifyTimeout', async() => gameService.notifyTimeout(Player.ZERO), ['NotifyTimeout', { timeoutedPlayer: 0 }]);
        testAction('proposeDraw', async() => gameService.proposeDraw(), ['Propose', { proposition: 'Draw' }]);
        testAction('acceptDraw', async() => gameService.acceptDraw(), ['Accept', { proposition: 'Draw' }]);
        testAction('rejectDraw', async() => gameService.rejectDraw(), ['Reject', { proposition: 'Draw' }]);
        testAction('proposeRematch', async() => gameService.proposeRematch(), ['Propose', { proposition: 'Rematch' }]);
        testAction('acceptRematch', async() => gameService.acceptRematch(), ['Accept', { proposition: 'Rematch' }]);
        testAction('rejectRematch', async() => gameService.rejectRematch(), ['Reject', { proposition: 'Rematch' }]);
        testAction('askTakeBack', async() => gameService.askTakeBack(), ['Propose', { proposition: 'TakeBack' }]);
        testAction('acceptTakeBack', async() => gameService.acceptTakeBack(), ['Accept', { proposition: 'TakeBack' }]);
        testAction('rejectTakeBack', async() => gameService.rejectTakeBack(), ['Reject', { proposition: 'TakeBack' }]);
        testAction('addGameTime', async() => gameService.addGameTime(), ['AddTime', { kind: 'Game' }]);
        testAction('addMoveTime', async() => gameService.addMoveTime(), ['AddTime', { kind: 'Move' }]);
        testAction('addMove', async() => gameService.addMove({ x: 42 }), ['Move', { move: { x: 42 } }]);
        testAction('endGame', async() => gameService.endGame(Player.ZERO), ['EndGame', { winner: 0 }]);
    });

});

/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { GameStatus } from '@everyboard/games';
import { Player, PlayerOrNone } from '@everyboard/games';
import { QuartoMove } from '@everyboard/games';
import { QuartoPiece } from '@everyboard/games';
import { JSONValue, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { Action, Game, GameResult, RequestType } from '../../../domain/Game';
import { GameMocks } from '../../../domain/GameMocks.spec';
import { MinimalUser } from '../../../domain/MinimalUser';
import { User } from '../../../domain/User';
import { UserMocks } from '../../../domain/UserMocks.spec';
import { QuartoComponent } from '../../../games/quarto/quarto.component';
import { AuthUser } from '../../../services/ConnectedUserService';
import { AbstractGameService, GameService } from '../../../services/GameService';
import { GameServiceMock } from '../../../services/tests/GameServiceMock.spec';
import { ComponentTestUtils, expectValidRouting } from '../../../utils/tests/TestUtils.spec';
import { NextGameLoadingComponent } from '../../normal-component/next-game-loading/next-game-loading.component';
import { GameWrapperMessages } from '../GameWrapper';

import { OnlineGameWrapperComponent, OnlineGameWrapperMessages } from './online-game-wrapper.component';
import { PreparationOptions, PreparationResult, prepareStartedGameFor } from './online-game-wrapper.helpers.component.spec';

describe('OnlineGameWrapperComponent of Quarto:', () => {

    // component construction (beforeEach)
    // stage 0
    // ngOnInit (triggered by detectChanges)
    // stage 1: PartCreationComponent appear
    // startGame, launched by user if game was not started yet, or automatically (via partCreationComponent)
    // stage 2: PartCreationComponent dissapear, game component appear
    // tick(0): the async part of startGame is now finished
    // stage 3: P4Component appear
    // differents scenarios

    let testUtils: ComponentTestUtils<QuartoComponent, MinimalUser>;
    let wrapper: OnlineGameWrapperComponent;
    let gameService: GameServiceMock;

    const OBSERVER: User = {
        username: 'jeanJaja',
        verified: true,
    };
    const USER_OBSERVER: AuthUser = new AuthUser('obs3rv3eDu8012',
                                                 MGPOptional.ofNullable(OBSERVER.username),
                                                 MGPOptional.of('observer@home'),
                                                 true);

    const FIRST_MOVE: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BABB);
    const SECOND_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);
    const THIRD_MOVE: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BABA);
    const FOURTH_MOVE: QuartoMove = new QuartoMove(3, 0, QuartoPiece.BBAA);

    const FIRST_MOVE_ENCODED: JSONValue = QuartoMove.encoder.encode(FIRST_MOVE);
    const SECOND_MOVE_ENCODED: JSONValue = QuartoMove.encoder.encode(SECOND_MOVE);
    const THIRD_MOVE_ENCODED: JSONValue = QuartoMove.encoder.encode(THIRD_MOVE);
    const FOURTH_MOVE_ENCODED: JSONValue = QuartoMove.encoder.encode(FOURTH_MOVE);

    async function doMoveByClicks(player: Player, move: QuartoMove, encoded: JSONValue): Promise<void> {
        await testUtils.expectClickSuccess(`#click-coord-${ move.coord.x }-${ move.coord.y }`);
        await testUtils.expectMoveSuccess('#click-piece-' + move.piece.value, move);
        await receiveMove(player, encoded);
    }

    function userFromPlayer(player: Player): MinimalUser {
        if (player === Player.ZERO) {
            return UserMocks.CREATOR_MINIMAL_USER;
        } else {
            return UserMocks.OPPONENT_MINIMAL_USER;
        }
    }

    async function receiveRequest(player: Player, request: RequestType): Promise<void> {
        await gameService.mockGameEvent({
            eventType: 'Request',
            timestamp: 1,
            user: userFromPlayer(player),
            requestType: request,
        }, 1);
        testUtils.detectChanges();
    }

    async function receiveReply(player: Player,
                                accept: boolean,
                                request: RequestType,
                                data?: JSONValue)
    : Promise<void> {
        await gameService.mockGameEvent({
            eventType: 'Reply',
            timestamp: 1,
            user: userFromPlayer(player),
            requestType: request,
            accept,
            data,
        }, 1);
        testUtils.detectChanges();
        tick();
    }

    async function receiveAction(player: Player, action: Action): Promise<void> {
        await gameService.mockGameEvent({
            eventType: 'Action',
            timestamp: 1,
            user: userFromPlayer(player),
            action,
        }, 1);
        testUtils.detectChanges();
        tick(0);
    }

    async function receiveError(reason: string): Promise<void> {
        gameService.mockError(reason);
        tick(0);
    }

    async function receiveGameUpdate(game: Game, detectChanges: boolean = true): Promise<void> {
        await gameService.mockGameUpdate(game);
        if (detectChanges) {
            testUtils.detectChanges();
        }
        tick(0);
    }

    async function receiveSync(): Promise<void> {
        return receiveAction(Player.ZERO, 'Sync');
    }

    async function receiveEndGame(result: GameResult = GameResult.VICTORY_OF_ZERO): Promise<void> {
        await receiveAction(Player.ZERO, 'EndGame');
        await receiveGameUpdate({
            ...GameMocks.STARTED,
            result,
        });

    }

    async function askTakeBack(player: Player): Promise<void> {
        await testUtils.clickElement('#proposeTakeBack');
        await receiveRequest(player, 'TakeBack');
        tick(0);
    }

    async function acceptTakeBack(player: Player): Promise<void> {
        await testUtils.clickElement('#accept');
        await receiveReply(player, true, 'TakeBack');
        tick(0);
    }

    async function refuseTakeBack(player: Player): Promise<void> {
        await testUtils.clickElement('#reject');
        await receiveReply(player, false, 'TakeBack');
        tick(0);
    }

    async function receiveMove(player: Player, move: JSONValue, detectChanges: boolean = true): Promise<void> {
        await gameService.mockGameEvent({
            eventType: 'Move',
            timestamp: 1,
            user: userFromPlayer(player),
            move,
        }, 1);
        if (detectChanges) {
            testUtils.detectChanges();
        }
        tick(0);
    }

    async function prepareTestUtilsFor(authUser: AuthUser,
                                       options?: PreparationOptions)
    : Promise<void>
    {
        const preparationResult: PreparationResult<QuartoComponent> =
            await prepareStartedGameFor<QuartoComponent>(authUser, 'Quarto', options);
        testUtils = preparationResult.testUtils;
        gameService = TestBed.inject(GameService) as AbstractGameService as GameServiceMock;
        wrapper = testUtils.getWrapper() as OnlineGameWrapperComponent;
    }

    function expectGameToBeOver(): void {
        expect(wrapper.gameTimerComponents()[0].isIdle())
            .withContext(`timer zero game should be idle (${ wrapper.gameTimerComponents()[0].remainingSeconds })`)
            .toBeTrue();
        expect(wrapper.moveTimerComponents()[0].isIdle())
            .withContext(`timer zero move should be idle ${ wrapper.moveTimerComponents()[0].remainingSeconds }`)
            .toBeTrue();
        expect(wrapper.gameTimerComponents()[1].isIdle())
            .withContext(`timer one game should be idle ${ wrapper.gameTimerComponents()[1].remainingSeconds }`)
            .toBeTrue();
        expect(wrapper.moveTimerComponents()[1].isIdle())
            .withContext(`timer one move should be idle ${ wrapper.moveTimerComponents()[1].remainingSeconds }`)
            .toBeTrue();
        expect(wrapper.endGame)
            .withContext('game should be ended')
            .toBeTrue();
    }

    it('should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
        expect(Utils.getNonNullable(wrapper.currentUser).name).toEqual('creator');
    }));

    it('should no longer have GameCreationComponent and should have QuartoComponent instead', fakeAsync(async() => {
        // Given an online game being created
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);
        testUtils.expectElementNotToExist('#gameCreation');
        testUtils.expectElementNotToExist('app-quarto');

        testUtils.expectElementNotToExist('#gameCreation');
        expect(testUtils.getGameComponent())
            .withContext('gameComponent field should be absent after config accepted and async ms finished')
            .toBeFalsy();

        // When the component initializes
        tick(2);
        testUtils.detectChanges();

        // Then the game component should become present in the component
        testUtils.expectElementToExist('app-quarto');
        expect(wrapper.gameComponent)
            .withContext('gameComponent field should also be present after config accepted and async millisecond finished')
            .toBeTruthy();
    }));

    it('should allow sending and receiving moves (creator)', fakeAsync(async() => {
        // Given a started game
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        await receiveSync();

        // When doing a move
        spyOn(gameService, 'addMove').and.callThrough();
        await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
        // Then it should be sent to the game service,
        expect(gameService.addMove).toHaveBeenCalledOnceWith(FIRST_MOVE_ENCODED);
        // and component gets updated when receiving it back
        expect(testUtils.getGameComponent().getTurn()).toEqual(1);

        // And when receiving a second move
        await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
        // Then the part should also be updated
        expect(testUtils.getGameComponent().getTurn()).toEqual(2);

        await receiveEndGame();
    }));

    it('should allow sending and receiving moves (opponent)', fakeAsync(async() => {
        // Given a started game
        await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
        await receiveSync();

        // When receiving a move
        await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
        // Then the part should be updated
        expect(testUtils.getGameComponent().getTurn()).toEqual(1);

        // And when doing a second move
        await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
        // Then the part should also be updated
        expect(testUtils.getGameComponent().getTurn()).toEqual(2);

        await receiveEndGame();
    }));

    it('should display an error if it receives one from the backend', fakeAsync(async() => {
        // Given a game
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

        // When receiving an error from the backend
        // Then it should display it
        await testUtils.expectToDisplayCriticalMessage(
            'Unexpected error from backend: unknown-message',
            async() => {
                await receiveError('unknown-message');
            });
    }));

    describe('Animation', () => {
        it(`should trigger animation when receiving opponent's move`, fakeAsync(async() => {
            // Given a board where it's the opponent's turn and we are synchronized
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // When receiving opponent's move
            spyOn(testUtils.getGameComponent(), 'updateBoard').and.callThrough();
            await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);

            // Then gameComponent.updateBoard should have been called with true, to show animation
            expect(testUtils.getGameComponent().updateBoard).toHaveBeenCalledOnceWith(true);

            await receiveEndGame();
        }));

        it(`should not trigger animation when receiving your own move`, fakeAsync(async() => {
            // Given a board where it's player's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When doing you move
            spyOn(testUtils.getGameComponent(), 'updateBoard').and.callThrough();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // Then gameComponent.updateBoard should have been called with false
            expect(testUtils.getGameComponent().updateBoard).toHaveBeenCalledOnceWith(false);

            await receiveEndGame();
        }));

        it(`should not trigger animation when receiving several moves without synchronization`, fakeAsync(async() => {
            // Given a board where you arrive late
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(testUtils.getGameComponent(), 'updateBoard').and.callThrough();
            // When you receive a bunch of moves but no "sync" yet
            await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
            await receiveMove(Player.ZERO, SECOND_MOVE_ENCODED);
            await receiveMove(Player.ZERO, THIRD_MOVE_ENCODED);
            await receiveMove(Player.ZERO, FOURTH_MOVE_ENCODED);
            tick(2);
            // Then there's no animation
            expect(testUtils.getGameComponent().updateBoard).not.toHaveBeenCalledWith(true);

            await receiveEndGame();
        }));
    });


    describe('Late Arrival', () => {
        it('should allow user to arrive late on the game (on their turn)', fakeAsync(async() => {
            // Given a part that has already started (moves have been done)
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
            await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);

            // When arriving and synchronizing
            await receiveSync();

            // Then the game is up to date
            expect(testUtils.getWrapper().gameComponent.getState().turn).toBe(2);

            await receiveEndGame();
        }));

        it('should allow user to arrive late on the game (on opponent turn)', fakeAsync(async() => {
            // Given a part that has already started (moves have been done)
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
            await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
            await receiveMove(Player.ZERO, THIRD_MOVE_ENCODED);

            // When arriving and synchronizing
            await receiveSync();

            // Then the game is up to date
            expect(testUtils.getWrapper().gameComponent.getState().turn).toBe(3);

            await receiveEndGame();
        }));

    });

    describe('Component initialization', () => {

        it('should show player names', fakeAsync(async() => {
            // Given a started game
            // When viewing the component
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

            // Then the usernames should be shown
            testUtils.expectElementToExist('#player-zero-indicator');
            const playerIndicator: HTMLElement = testUtils.findElement('#player-zero-name').nativeElement;
            expect(playerIndicator.innerText).toBe(UserMocks.CREATOR_AUTH_USER.username.get());
            testUtils.expectElementToExist('#player-one-indicator');
            const opponentIndicator: HTMLElement = testUtils.findElement('#player-one-name').nativeElement;
            expect(opponentIndicator.innerText).toBe(UserMocks.OPPONENT_AUTH_USER.username.get());

            await receiveEndGame();
        }));

    });

    it('should forbid making a move when it is not the turn of the player', fakeAsync(async() => {
        // Given a game
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        await receiveSync();

        // When it is not the player's turn (because he made the first move)
        await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

        // Then the player cannot play
        await testUtils.expectToDisplayGameMessage(GameWrapperMessages.NOT_YOUR_TURN(), async() => {
            await testUtils.clickElement('#click-coord-0-0');
        });

        await receiveEndGame();
    }));

    it('should allow player to pass when gameComponent allows it', fakeAsync(async() => {
        // Given a game where it is possible to pass
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        await receiveSync();
        testUtils.expectElementToBeDisabled('#pass');
        wrapper.gameComponent.canPass = true;
        spyOn(wrapper.gameComponent, 'pass').and.resolveTo(MGPValidation.SUCCESS);
        testUtils.detectChanges();

        // When clicking on the pass button
        testUtils.expectElementToBeEnabled('#pass');
        await testUtils.clickElement('#pass');

        // Then it should pass
        expect(wrapper.gameComponent.pass).toHaveBeenCalledOnceWith();
        await receiveEndGame();
    }));

    describe('Move victory', () => {
        it('should notify victory when active player wins', fakeAsync(async() => {
            // Given a board on which user can win
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.ZERO_WON);
            testUtils.expectElementNotToExist('#winnerIndicator');
            spyOn(gameService, 'endGame').and.callThrough();

            // When doing winning move
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // Then it should notify the backend about the victory
            expect(gameService.endGame).toHaveBeenCalledOnceWith(Player.ZERO);

            // And when the backend propagates the update, the game should be finished
            await receiveEndGame(GameResult.VICTORY_OF_ZERO);
            expect(wrapper.gameComponent.node.previousMove.get()).toEqual(FIRST_MOVE);
            testUtils.expectElementToExist('#youWonIndicator');
            expectGameToBeOver();
        }));

        it('should notify victory when active player loses', fakeAsync(async() => {
            // Given a board on which user can lose on their turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.ONE_WON);
            testUtils.expectElementNotToExist('#youLostIndicator');
            spyOn(gameService, 'endGame').and.callThrough();

            // When doing losing move
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // Then it should notify the backend about the loss
            expect(gameService.endGame).toHaveBeenCalledOnceWith(Player.ONE);

            // And when the backend propagates the update, the game should be finished
            await receiveEndGame(GameResult.VICTORY_OF_ONE);
            expect(wrapper.gameComponent.node.previousMove.get()).toEqual(FIRST_MOVE);
            testUtils.expectElementToExist('#youLostIndicator');
            expectGameToBeOver();
        }));

        it('should notify victory when active player times out', fakeAsync(async() => {
            // Given a board
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.ONE_WON);
            testUtils.expectElementNotToExist('#youLostIndicator');
            spyOn(gameService, 'endGame').and.callThrough();

            // When we time out
            await receiveEndGame(GameResult.TIMEOUT_OF_ZERO);

            // Then the game should be finished
            testUtils.expectElementToExist('#youLostIndicator');
            expectGameToBeOver();
        }));

        it('should notify draw when a draw move from player is done', fakeAsync(async() => {
            // Given a board on which user can draw
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.DRAW);
            testUtils.expectElementNotToExist('#winnerIndicator');
            spyOn(gameService, 'endGame').and.callThrough();

            // When doing drawing move
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // Then it should notify the backend about the draw
            expect(gameService.endGame).toHaveBeenCalledWith(PlayerOrNone.NONE);

            // And when the backend propagates the update, the game should be finished
            await receiveEndGame(GameResult.HARD_DRAW);
            expect(wrapper.gameComponent.node.previousMove.get()).toEqual(FIRST_MOVE);
            testUtils.expectElementToExist('#hardDrawIndicator');
            expectGameToBeOver();
        }));

    });

    describe('Take Back', () => {

        describe('sending/receiving', () => {

            it('should send take back request when player asks to', fakeAsync(async() => {
                // Given a board where it's the opponent's (first) turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

                // When asking to take back
                spyOn(gameService, 'askTakeBack').and.callThrough();
                await askTakeBack(Player.ZERO);

                // Then a request should be sent
                expect(gameService.askTakeBack).toHaveBeenCalledOnceWith();

                await receiveEndGame();
            }));

            it('should not allow to propose take back after it has been proposed', fakeAsync(async() => {
                // Given a board where a move has been made
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

                // When asking to take back
                await askTakeBack(Player.ZERO);

                // Then it should not be possible to ask a second time
                testUtils.expectElementToBeDisabled('#proposeTakeBack');

                await receiveEndGame();
            }));

            it('should not propose to Player.ONE to take back before any move', fakeAsync(async() => {
                // Given a board where nobody already played
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, PreparationOptions.withoutClocks);
                await receiveSync();
                // When displaying the page
                // Then the take back button should not be there
                testUtils.expectElementToBeDisabled('#proposeTakeBack');

                await receiveEndGame();
            }));

            it('should not propose to Player.ONE to take back before their first move', fakeAsync(async() => {
                // Given a board where nobody already played
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, PreparationOptions.withoutClocks);
                await receiveSync();
                // When receiving a new move
                await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
                // Then the take back button should not be there
                testUtils.expectElementToBeDisabled('#proposeTakeBack');

                await receiveEndGame();
            }));

            it('should only propose to accept take back when opponent asked', fakeAsync(async() => {
                // Given a board where opponent did not ask to take back and where both player could ask
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
                testUtils.expectElementNotToExist('#acceptTakeBack');

                // When we receive a take back request from opponent and accepting
                await receiveRequest(Player.ONE, 'TakeBack');
                await acceptTakeBack(Player.ZERO);
                testUtils.detectChanges();

                // Then we cannot allow accept take back anymore
                testUtils.expectElementNotToExist('#acceptTakeBack');

                await receiveEndGame();
            }));

            it('should remove take back rejection button after it has been rejected', fakeAsync(async() => {
                // Given a board with previous move
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await receiveMove(Player.ZERO, SECOND_MOVE_ENCODED);
                testUtils.expectElementNotToExist('#refuseTakeBack');
                await receiveRequest(Player.ONE, 'TakeBack');
                spyOn(gameService, 'rejectTakeBack').and.callThrough();

                // When refusing take back
                await refuseTakeBack(Player.ZERO);
                testUtils.detectChanges();

                // Then a TakeBack rejection reply should have been sent
                testUtils.expectElementNotToExist('#refuseTakeBack');
                expect(gameService.rejectTakeBack).toHaveBeenCalledOnceWith();

                await receiveEndGame();
            }));

            it('should not allow player to play while take back request is waiting for them', fakeAsync(async() => {
                // Given a component where a take back request is waiting for user
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
                await receiveRequest(Player.ONE, 'TakeBack');

                // When ignoring it and trying to play
                const reason: string = OnlineGameWrapperMessages.MUST_ANSWER_REQUEST();

                // Then it should fail
                testUtils.resetSpies();
                await testUtils.expectClickFailure('#click-coord-0-0', reason);

                await receiveEndGame();
            }));

            it('should allow to play after take back request', fakeAsync(async() => {
                // Given an initial board where a take back request has been done by user
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
                await askTakeBack(Player.ZERO);

                // When doing move while waiting for answer
                spyOn(gameService, 'addMove').and.callThrough();
                await doMoveByClicks(Player.ZERO, THIRD_MOVE, THIRD_MOVE_ENCODED);

                // Then the move should be sent
                expect(gameService.addMove).toHaveBeenCalledWith(THIRD_MOVE_ENCODED);

                await receiveEndGame();
            }));

            it('should forbid player to ask take back again after refusal', fakeAsync(async() => {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await askTakeBack(Player.ONE);
                await receiveReply(Player.ONE, false, 'TakeBack');

                testUtils.expectElementToBeDisabled('#proposeTakeBack');

                await receiveEndGame();
            }));

        });

        describe('opponent given take back during their turn', () => {

            it('should move board back two turns', fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, PreparationOptions.withoutClocks);
                await receiveSync();
                await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
                await doMoveByClicks(Player.ONE, SECOND_MOVE, SECOND_MOVE_ENCODED);
                await receiveRequest(Player.ZERO, 'TakeBack');
                expect(wrapper.gameComponent.getTurn()).toBe(2);

                // When accepting opponent's take back
                await acceptTakeBack(Player.ONE);

                // Then turn should be changed to 0
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.gameComponent.getTurn()).toBe(0);

                await receiveEndGame();
            }));

            it(`should preserve opponent's clocks to what it was before asking take back`, fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveSync();
                await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
                await doMoveByClicks(Player.ONE, SECOND_MOVE, SECOND_MOVE_ENCODED);
                await receiveRequest(Player.ZERO, 'TakeBack');
                const gameTimeBeforeTakeBack: number = wrapper.gameTimerComponents()[0].remainingSeconds;
                const turnTimeBeforeTakeBack: number = wrapper.moveTimerComponents()[0].remainingSeconds;

                // When accepting opponent's take back
                await acceptTakeBack(Player.ONE);

                // Then opponents timer should have continued to decrease
                tick(1000); // wait a bit to ensure time is decreasing
                const globalTimeAfterTakeBack: number = wrapper.gameTimerComponents()[0].remainingSeconds;
                const turnTimeAfterTakeBack: number = wrapper.moveTimerComponents()[0].remainingSeconds;
                expect(globalTimeAfterTakeBack).toBeLessThan(gameTimeBeforeTakeBack);
                expect(turnTimeAfterTakeBack).toBeLessThan(turnTimeBeforeTakeBack);

                await receiveEndGame();
            }));

        });

        describe('opponent given take back during user turn', () => {

            it('should move board back one turn', fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveSync();
                await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
                await receiveRequest(Player.ZERO, 'TakeBack');
                expect(wrapper.gameComponent.getTurn()).toBe(1);

                // When accepting opponent's take back
                await acceptTakeBack(Player.ONE);
                testUtils.detectChanges();

                // Then turn should be changed to 0
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.gameComponent.getTurn()).toBe(0);

                await receiveEndGame();
            }));

            it(`should resumeCountDown for opponent`, fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveSync();
                await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
                await receiveRequest(Player.ZERO, 'TakeBack');
                testUtils.detectChanges();

                // When accepting opponent's take back
                spyOn(wrapper.gameTimerComponents()[0], 'resume').and.callThrough();
                await acceptTakeBack(Player.ONE);

                // Then count down should be resumed for opponent and user should receive their decision time back
                expect(wrapper.gameTimerComponents()[0].resume).toHaveBeenCalledOnceWith();

                await receiveEndGame();
            }));

        });

        describe('User given take back during their turn', () => {

            it('should move board back two turns', fakeAsync(async() => {
                // Given an initial board where it's user (second) turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
                await askTakeBack(Player.ZERO);
                expect(wrapper.gameComponent.getTurn()).toBe(2);

                // When opponent accepts user's take back
                spyOn(wrapper.gameTimerComponents()[0], 'resume').and.callThrough();
                await receiveReply(Player.ONE, true, 'TakeBack');
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);
                tick(0);
                testUtils.detectChanges();

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.gameTimerComponents()[0].resume).toHaveBeenCalledOnceWith();
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                await receiveEndGame();
            }));

            it(`should do alternative move afterwards without taking back move time off (during user's turn)`, fakeAsync(async() => {
                // Given an initial board where user was authorized to take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
                await askTakeBack(Player.ZERO);
                testUtils.detectChanges();
                await receiveReply(Player.ONE, true, 'TakeBack');
                tick(0);

                // When playing an alternative move
                spyOn(gameService, 'addMove').and.callThrough();
                const alternativeMove: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const alternativeMoveEncoded: JSONValue = QuartoMove.encoder.encode(alternativeMove);
                await doMoveByClicks(Player.ZERO, alternativeMove, alternativeMoveEncoded);

                // Then the new move should be sent
                expect(gameService.addMove).toHaveBeenCalledOnceWith(alternativeMoveEncoded);
                await receiveEndGame();
            }));

        });

        describe('User given take back during opponent turn', () => {

            it('should move board back one turn and update current turn', fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await askTakeBack(Player.ZERO);
                expect(wrapper.gameComponent.getTurn()).toBe(1);

                // When opponent accept user's take back
                await receiveReply(Player.ONE, true, 'TakeBack');
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                await receiveEndGame();
            }));

            it(`should resume clock for user`, fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                spyOn(wrapper.gameTimerComponents()[1], 'resume').and.callThrough();
                await askTakeBack(Player.ZERO);

                // When opponent accept user's take back
                await receiveReply(Player.ONE, true, 'TakeBack');

                // Then count down should be resumed and update not changing time
                expect(wrapper.gameTimerComponents()[1].resume).toHaveBeenCalledOnceWith();
                await receiveEndGame();
            }));

            it('should do alternative move afterwards without taking back move time off (during opponent turn)', fakeAsync(async() => {
                // Given an initial board where opponent just took back a move
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
                await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
                await askTakeBack(Player.ZERO);
                await receiveReply(Player.ONE, true, 'TakeBack');

                // When playing an alernative move
                spyOn(gameService, 'addMove').and.callThrough();
                const alternativeMove: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const alternativeMoveEncoded: JSONValue = QuartoMove.encoder.encode(alternativeMove);
                await doMoveByClicks(Player.ZERO, alternativeMove, alternativeMoveEncoded);

                // Then partDAO should be updated, and move should be sent
                expect(gameService.addMove).toHaveBeenCalledOnceWith(alternativeMoveEncoded);
                await receiveEndGame();
            }));

        });

        it('should call cancelMoveAttempt', fakeAsync(async() => {
            // Given an initial board where it's opponent's [second] turn, and user just asked for take back
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
            await askTakeBack(Player.ZERO);

            // When opponent accept user's take back
            spyOn(testUtils.getGameComponent(), 'cancelMoveAttempt').and.callThrough();
            await receiveReply(Player.ONE, true, 'TakeBack');

            // Then cancelMoveAttempt should have been called
            expect(testUtils.getGameComponent().cancelMoveAttempt).toHaveBeenCalledOnceWith();
            await receiveEndGame();
        }));

    });

    describe('Agreed Draw', () => {

        it('should send draw request when player asks to', fakeAsync(async() => {
            // Given any board
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            spyOn(gameService, 'proposeDraw').and.callThrough();

            // When clicking the propose draw button
            await testUtils.clickElement('#proposeDraw');

            // Then a draw request should have been sent
            expect(gameService.proposeDraw).toHaveBeenCalledOnceWith();
            await receiveEndGame();
        }));

        it('should forbid to propose to draw while draw request is waiting', fakeAsync(async() => {
            // Given a page where we sent a draw request
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await testUtils.clickElement('#proposeDraw');

            // When the request is received
            await receiveRequest(Player.ZERO, 'Draw');

            // Then it should not allow us to propose a second draw
            testUtils.expectElementToBeDisabled('#proposeDraw');

            await receiveEndGame();
        }));

        it('should forbid to click while draw request is waiting', fakeAsync(async() => {
            // Given a page where we received a draw request
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await receiveRequest(Player.ONE, 'Draw');
            testUtils.detectChanges();

            // When ignoring it and trying to play
            const reason: string = OnlineGameWrapperMessages.MUST_ANSWER_REQUEST();

            // Then it should fail
            await testUtils.expectClickFailure('#click-coord-0-0', reason);
            await receiveEndGame();
        }));

        it('should forbid to propose to draw after refusal', fakeAsync(async() => {
            // Given a page where we sent a draw request
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await testUtils.clickElement('#proposeDraw');
            tick(0);

            // When it is rejected
            await receiveReply(Player.ONE, false, 'Draw');

            // Then we cannot request to draw anymore
            testUtils.expectElementToBeDisabled('#proposeDraw');

            await receiveEndGame();
        }));

        it('should finish the game after accepting a proposed draw', fakeAsync(async() => {
            // Given a part on which a draw has been proposed
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await receiveRequest(Player.ONE, 'Draw');
            spyOn(gameService, 'acceptDraw').and.callThrough();
            testUtils.detectChanges();

            // When accepting the draw
            await testUtils.clickElement('#accept');
            await receiveReply(Player.ZERO, true, 'Draw');
            await receiveEndGame(GameResult.AGREED_DRAW_BY_ZERO);

            // Then the draw is being accepted
            expect(gameService.acceptDraw).toHaveBeenCalledOnceWith();
            tick(0);
            testUtils.detectChanges();
            testUtils.expectElementToExist('#youAgreedToDrawIndicator');
            expectGameToBeOver();
        }));

        it('should finish the game when opponent accepts our proposed draw', fakeAsync(async() => {
            // Given a gameComponent where draw has been proposed
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await testUtils.clickElement('#proposeDraw');
            tick(0);

            // When draw is accepted
            await receiveEndGame(GameResult.AGREED_DRAW_BY_ONE);

            // Then game should be over
            expectGameToBeOver();
            testUtils.expectElementToExist('#yourOpponentAgreedToDrawIndicator');
        }));

        it('should send refusal when player asks to', fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await receiveRequest(Player.ONE, 'Draw');

            spyOn(gameService, 'rejectDraw').and.callThrough();

            await testUtils.clickElement('#reject');
            expect(gameService.rejectDraw).toHaveBeenCalledOnceWith();

            await receiveEndGame();
        }));

        it('should only propose to accept/refuse draw when asked', fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            testUtils.expectElementNotToExist('#accept');
            testUtils.expectElementNotToExist('#reject');
            await receiveRequest(Player.ONE, 'Draw');

            testUtils.expectElementToExist('#accept');
            testUtils.expectElementToExist('#reject');

            await receiveEndGame();
        }));

    });

    describe('End Game Time Management', () => {
        it(`should stop player's game clock when turn reaches end`, fakeAsync(async() => {
            // Given an online game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When the player runs out of move time
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.gameTimerComponents()[0], 'stop').and.callThrough();
            tick(wrapper.configRoom.moveDuration * 1000);

            // Then it should be detected
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);

            // And the game timers should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.gameTimerComponents()[0].stop).toHaveBeenCalledOnceWith();
        }));

        it(`should stop player's move clock when game clock reaches end`, fakeAsync(async() => {
            // Given an online game with short game time limit
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.shortGlobalClock);
            await receiveSync();

            // When the player runs out of game time
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.moveTimerComponents()[0], 'stop').and.callThrough();
            tick(wrapper.configRoom.gameDuration * 1000);

            // Then it shoud be detected
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);

            // And the move timer should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.moveTimerComponents()[0].stop).toHaveBeenCalledOnceWith();
        }));

        it(`should stop opponent's game clock when turn reaches end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // When they run out of move time
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.gameTimerComponents()[1], 'stop').and.callThrough();
            tick(wrapper.configRoom.moveDuration * 1000);

            // Then it should be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);

            // And the game timer should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.gameTimerComponents()[1].stop).toHaveBeenCalledOnceWith();
        }));

        it(`should stop opponent's move clock when game clock reaches end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.shortGlobalClock);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // When they run out of game time
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.moveTimerComponents()[1], 'stop').and.callThrough();
            tick(wrapper.configRoom.gameDuration * 1000);

            // Then it should be detected
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);

            // And the move timer should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.moveTimerComponents()[1].stop).toHaveBeenCalledOnceWith();
        }));

    });

    describe('Add time feature', () => {
        describe('from creator', () => {
            async function prepareStartedGameForCreator(): Promise<void> {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await receiveSync();
            }

            it('should allow to add turn time to opponent', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(gameService, 'addMoveTime').and.callThrough();

                // When creator adds turn time to the opponent
                await wrapper.addMoveTime();

                // Then an add turn time action is generated
                expect(gameService.addMoveTime).toHaveBeenCalledOnceWith();

                await receiveEndGame();
            }));

            it('should resume both clocks at once when adding turn time', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(wrapper.gameTimerComponents()[0], 'resume').and.callThrough();
                spyOn(wrapper.moveTimerComponents()[0], 'resume').and.callThrough();

                // When receiving a request to add local time to player zero
                await receiveAction(Player.ZERO, 'AddMoveTime');

                // Then both clocks of player zero should have been resumed
                expect(wrapper.gameTimerComponents()[0].resume).toHaveBeenCalledOnceWith();
                expect(wrapper.moveTimerComponents()[0].resume).toHaveBeenCalledOnceWith();

                await receiveEndGame();
            }));

            it('should add turn time when receiving AddMoveTime action from Player.ONE', fakeAsync(async() => {
                // Given an onlineGameComponent where it's our turn and we have some time remaining
                await prepareStartedGameForCreator();
                const timeBeforeAdding: number = wrapper.moveTimerComponents()[0].remainingSeconds;

                // When receiving AddMoveTime action from player one
                await receiveAction(Player.ONE, 'AddMoveTime');

                // Then the turn time of player zero should be increased by exactly 30 seconds
                expect(wrapper.moveTimerComponents()[0].remainingSeconds).toEqual(timeBeforeAdding + 30);

                await receiveEndGame();
            }));

            it('should add turn time when receiving AddMoveTime action from Player.ZERO', fakeAsync(async() => {
                // Given an onlineGameComponent where it's our turn
                await prepareStartedGameForCreator();
                const timeBeforeAdding: number = wrapper.moveTimerComponents()[1].remainingSeconds;

                // When we send AddMoveTime action as Player.ZERO
                await receiveAction(Player.ZERO, 'AddMoveTime');

                // Then the turn time of player one should be increased by exactly 30 seconds
                expect(wrapper.moveTimerComponents()[1].remainingSeconds).toBe(timeBeforeAdding + 30);

                await receiveEndGame();
            }));

            it('should allow to add global time to opponent (as Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent where it's our turn
                await prepareStartedGameForCreator();
                spyOn(gameService, 'addGameTime').and.callThrough();

                // When the player adds global time to the opponent
                await wrapper.addGameTime();

                // Then a request to add global time to player one should be sent
                expect(gameService.addGameTime).toHaveBeenCalledOnceWith();
                const secondsUntilTimeout: number = wrapper.configRoom.moveDuration;
                // initial 2 minutes
                expect(wrapper.moveTimerComponents()[1].remainingSeconds).toBe(secondsUntilTimeout);

                await receiveEndGame();
            }));

            it('should add time to global clock when receiving AddGameTime action from Player.ONE', fakeAsync(async() => {
                // Given an onlineGameComponent where it's our turn and we still have time left
                await prepareStartedGameForCreator();
                const timeBeforeAdding: number = wrapper.gameTimerComponents()[0].remainingSeconds;

                // When the opponent adds global time to us
                await receiveAction(Player.ONE, 'AddGameTime');

                // Then timer global of player one should be increased by 5 minutes
                expect(wrapper.gameTimerComponents()[0].remainingSeconds).toBe(timeBeforeAdding + (5 * 60));

                await receiveEndGame();
            }));

            it('should add time to global clock when receiving the AddGameTime action from Player.ZERO', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                const timeBeforeAdding: number = wrapper.gameTimerComponents()[1].remainingSeconds;

                // When we add global time to the opponent
                await receiveAction(Player.ZERO, 'AddGameTime');

                // Then timer global of the opponent should be increased by 5 minutes
                expect(wrapper.gameTimerComponents()[1].remainingSeconds).toBe(timeBeforeAdding + (5 * 60));

                await receiveEndGame();
            }));

            it('should postpone the timeout of timer and not only change displayed time', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();

                // When receiving an AddMoveTime action
                await receiveAction(Player.ONE, 'AddMoveTime');
                testUtils.detectChanges();

                // Then game should end by timeout only after new time has run out
                tick(wrapper.configRoom.moveDuration * 1000);
                expect(testUtils.getWrapper().endGame).withContext('game should not be finished yet').toBeFalse();

                await receiveEndGame();
                expectGameToBeOver();
            }));

        });

        describe('opponent', () => {
            it('should allow to add global time to opponent (as Player.ONE)', fakeAsync(async() => {
                // Given an onlineGameComponent on opponent's turn
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveSync();

                spyOn(gameService, 'addGameTime').and.callThrough();

                // When countDownComponent emit addGlobalTime
                await wrapper.addGameTime();

                // Then a request to add global time to player zero should be sent
                expect(gameService.addGameTime).toHaveBeenCalledOnceWith();

                await receiveEndGame();
            }));

        });
    });

    describe('Resign', () => {

        it('should end game after clicking on resign button', fakeAsync(async() => {
            // Given an online game component
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
            spyOn(gameService, 'resign');

            // When clicking on the resign button
            await testUtils.clickElement('#resign');
            tick(0);

            // Then it should send it to the backend
            expect(gameService.resign).toHaveBeenCalledOnceWith();

            await receiveEndGame(GameResult.RESIGN_OF_ZERO);
            expectGameToBeOver();
        }));

        it('should not allow player to move after resigning', fakeAsync(async() => {
            // Given a component where user has resigned
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await testUtils.clickElement('#resign');
            tick(0);
            await receiveEndGame(GameResult.RESIGN_OF_ZERO);
            spyOn(gameService, 'resign');

            // When attempting a move
            // Then it should fail
            await testUtils.expectClickFailure('#click-piece-1', GameWrapperMessages.GAME_HAS_ENDED());

            expect(gameService.resign).not.toHaveBeenCalled();
            expectGameToBeOver();
        }));

        it('should display when the opponent resigned', fakeAsync(async() => {
            // Given a board where the opponent has resigned
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
            await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
            await receiveEndGame(GameResult.RESIGN_OF_ONE);

            // When checking "victory text"
            const resignText: string = testUtils.findElement('#resignIndicator').nativeElement.innerText;

            // Then we should see "opponent has resign"
            expect(resignText).toBe(`firstCandidate has resigned.`);
            expectGameToBeOver();
        }));

    });

    describe('rematch', () => {

        it('should show propose button only when game is ended', fakeAsync(async() => {
            // Given a game that is not finished
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();

            // When it is finished
            await testUtils.expectInterfaceClickSuccess('#resign', undefined, 0);

            // Then it should allow to propose rematch
            testUtils.expectElementToBeEnabled('#proposeRematch');
        }));

        it('should send proposal request when proposing', fakeAsync(async() => {
            // Given an ended game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();
            tick(0);
            testUtils.detectChanges();

            // When the propose rematch button is clicked
            spyOn(gameService, 'proposeRematch').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#proposeRematch');

            // Then the gameService must be called
            expect(gameService.proposeRematch).toHaveBeenCalledOnceWith();
        }));

        it('should disable button after proposing', fakeAsync(async() => {
            // Given an ended game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();
            tick(0);
            testUtils.detectChanges();

            // When the propose rematch button is clicked (and the event is indeed received)
            spyOn(gameService, 'proposeRematch').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#proposeRematch');
            await receiveRequest(Player.ZERO, 'Rematch');

            // Then the button should be disabled
            testUtils.expectElementToBeDisabled('#proposeRematch');
        }));

        it('should send reply when rejecting', fakeAsync(async() => {
            // Given an ended game with a received proposal request
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();
            await receiveRequest(Player.ONE, 'Rematch');
            tick(0);
            testUtils.detectChanges();
            spyOn(gameService, 'rejectRematch').and.callThrough();

            // When the reject rematch button is clicked
            await testUtils.expectInterfaceClickSuccess('#reject');

            // Then the gameService's rejectRematch must be called
            expect(gameService.rejectRematch).toHaveBeenCalledOnceWith();
        }));

        it('should show when opponent rejected our rematch proposal', fakeAsync(async() => {
            // Given an ended game where we propose a rematch
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();
            tick(0);
            testUtils.detectChanges();
            await testUtils.expectInterfaceClickSuccess('#proposeRematch');
            tick(0);

            // When the rematch is rejected by the opponent
            await receiveReply(Player.ONE, false, 'Rematch');

            // Then we should be notified
            testUtils.expectElementToExist('#requestRejected');
        }));

        it('should show accept/reject button when proposition has been sent', fakeAsync(async() => {
            // Given an ended game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();
            tick(0);
            testUtils.detectChanges();

            // When request is received
            testUtils.expectElementNotToExist('#accept');
            await receiveRequest(Player.ONE, 'Rematch');

            // Then accept/refuse buttons must be shown
            testUtils.detectChanges();
            testUtils.expectElementToExist('#accept');
        }));

        it('should send accepting request when user accept rematch', fakeAsync(async() => {
            // give a part with rematch request send by opponent
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();
            await receiveRequest(Player.ONE, 'Rematch');

            // When accepting it
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            spyOn(gameService, 'acceptRematch').and.callThrough();
            tick(0);
            testUtils.detectChanges();
            await testUtils.expectInterfaceClickSuccess('#accept');

            // Then it should have called acceptRematch
            expect(gameService.acceptRematch).toHaveBeenCalledOnceWith();
        }));

        it('should redirect to new part when rematch is accepted', fakeAsync(async() => {
            // Given a part lost with rematch request send by user
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame();

            await testUtils.expectInterfaceClickSuccess('#resign');
            tick(0);
            testUtils.detectChanges();
            await testUtils.expectInterfaceClickSuccess('#proposeRematch');

            // When opponent accepts it
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            await receiveReply(Player.ONE, true, 'Rematch', 'nextPartId');
            await receiveAction(Player.ONE, 'EndGame');

            // Then it should redirect to new part
            await expectValidRouting(router, ['/nextGameLoading'], NextGameLoadingComponent, { otherRoutes: true });
            await expectValidRouting(router, ['/play', 'Quarto', 'nextPartId'], OnlineGameWrapperComponent, { otherRoutes: true });
        }));

        it('should not redirect to new part when loading a game that already had an accepted rematch', fakeAsync(async() => {
            // Given a game being replayed before Sync
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

            // When the replay contains an accepted rematch
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            await receiveRequest(Player.ZERO, 'Rematch');
            await receiveReply(Player.ONE, true, 'Rematch', 'nextPartId');

            // Then the historical rematch should not redirect the observer to the next part
            expect(router.navigate).not.toHaveBeenCalled();
        }));

    });

    describe('Non Player Experience', () => {

        it('should not be able to do anything', fakeAsync(async() => {
            // Given a part that we are observing
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
            await receiveSync();
            // which has already some moves
            await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);
            await receiveMove(Player.ONE, SECOND_MOVE_ENCODED);
            // and a request
            await receiveRequest(Player.ZERO, 'TakeBack');
            // When displaying the component
            // Then we don't see any interaction button
            const forbiddenButtons: string[] = [
                '#proposeTakeBack',
                '#proposeDraw',
                '#resign',
                '#accept',
                '#reject',
            ];
            for (const forbiddenButton of forbiddenButtons) {
                testUtils.expectElementNotToExist(forbiddenButton);
            }

            // Need to finish the game to stop the timers
            await receiveEndGame();
        }));

        it('should display the end game status when the game is ended', fakeAsync(async() => {
            // Given a part that the two players agreed to draw
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveRequest(Player.ZERO, 'Draw');
            await receiveEndGame(GameResult.AGREED_DRAW_BY_ONE);
            testUtils.detectChanges();
            tick(0);

            // When displaying the board
            // Then the text should indicate players have agreed to draw
            testUtils.expectElementToExist('#playersAgreedToDraw');
            expectGameToBeOver();
        }));

        it('should not notify timeout victory', fakeAsync(async() => {
            // Given a part where we are observer
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
            await receiveSync();
            spyOn(gameService, 'notifyTimeout').and.callThrough();
            // When a player times out
            await wrapper.reachedOutOfTime(Player.ZERO);
            // Then we should not notify the timeout
            expect(gameService.notifyTimeout).not.toHaveBeenCalled();
            // But someone else will
            await receiveEndGame(GameResult.TIMEOUT_OF_ZERO);
        }));

        it('should display when someone resigned', fakeAsync(async() => {
            // Given a board where the opponent has resigned
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
            await receiveSync();
            await receiveEndGame(GameResult.RESIGN_OF_ZERO);

            // When checking "victory text"
            const resignText: string = testUtils.findElement('#resignIndicator').nativeElement.innerText;

            // Then we should see "player has resign"
            expect(resignText).toBe(`creator has resigned.`);
            expectGameToBeOver();
        }));

        describe('Animation', () => {
            it(`should trigger animation when receiving player move (observer)`, fakeAsync(async() => {
                // Given any turn
                await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
                await receiveSync();

                // When receiving players's move
                spyOn(testUtils.getGameComponent(), 'updateBoard').and.callThrough();
                await receiveMove(Player.ZERO, FIRST_MOVE_ENCODED);

                // Then gameComponent.updateBoard should have been called with true, to show animation
                expect(testUtils.getGameComponent().updateBoard).toHaveBeenCalledOnceWith(true);
                tick(wrapper.configRoom.moveDuration * 1000);

                // Need to finish the game
                await receiveEndGame(GameResult.VICTORY_OF_ZERO);
            }));

        });
    });

    describe('Visuals', () => {
        it('should highlight each player name in their respective color', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When the game is displayed

            // Then it should highlight the player's names
            testUtils.expectElementToHaveClass('#player-zero-indicator', 'player0-bg-darker');
            testUtils.expectElementToHaveClass('#player-one-indicator', 'player1-bg-darker');
            await receiveEndGame();
        }));

        it('should highlight the board with the color of the player when it is their turn', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When the component initialize and it is the current player's turn

            // Then it should highlight the board with its color
            testUtils.expectElementToHaveClass('#board-highlight', 'player0-bg');
            await receiveEndGame();
        }));

        it('should highlight the board in grey when game is over', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When the game is over
            await receiveEndGame();

            // Then it should highlight the board with its color
            testUtils.expectElementToHaveClass('#board-highlight', 'endgame-bg');
        }));

        it('should not highlight the board when it is the turn of the opponent', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When it is not the current player's turn
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
            testUtils.detectChanges();

            // Then it should not highlight the board
            testUtils.expectElementNotToHaveClass('#board-highlight', 'player1-bg');
            await receiveEndGame();
        }));

    });

    describe('onCancelMove', () => {
        it('should delegate to gameComponent.showLastMove', fakeAsync(async() => {
            // Given a component
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await receiveSync();

            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
            const component: QuartoComponent = testUtils.getGameComponent();
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            await testUtils.getWrapper().onCancelMove();

            // Then showLastMove should have been called
            expect(component.showLastMove).toHaveBeenCalledOnceWith(FIRST_MOVE);
            await receiveEndGame();
        }));

        it('should not call gameComponent.showLastMove if there is no move', fakeAsync(async() => {
            // Given a component without previous move
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            const component: QuartoComponent = testUtils.getGameComponent();
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            await testUtils.getWrapper().onCancelMove();

            // Then showLastMove should not have been called
            expect(component.showLastMove).not.toHaveBeenCalled();
            await receiveEndGame();
        }));

    });

    describe('interactivity', () => {
        it('should be interactive at first turn for current player', fakeAsync(async() => {
            // Given a component at the beginning of the game, where we are Player.ZERO
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When displaying it
            // Then it should be interactive
            expect(testUtils.getGameComponent().isInteractive()).toBeTrue();

            await receiveEndGame();
        }));

        it('should not be interactive when at the turn of the opponent', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();

            // When it is not the current player's turn
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
            testUtils.detectChanges();

            // Then it should not be interactive
            expect(testUtils.getGameComponent().isInteractive()).toBeFalse();

            await receiveEndGame();
        }));

        it('should not be interactive when the game is finished', fakeAsync(async() => {
            // Given a board at the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
            await receiveSync();

            // When the game ends
            await receiveEndGame();

            // Then it should not be interactive
            expect(testUtils.getGameComponent().isInteractive()).toBeFalse();

            await receiveEndGame();
        }));

    });
});

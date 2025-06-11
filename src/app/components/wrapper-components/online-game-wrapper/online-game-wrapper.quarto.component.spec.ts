/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import * as Firestore from '@firebase/firestore';
import { JSONValue, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { OnlineGameWrapperComponent, OnlineGameWrapperMessages } from './online-game-wrapper.component';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { Action, Game, GameEventReply, GameResult, RequestType } from 'src/app/domain/Part';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { CurrentGame, User } from 'src/app/domain/User';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { GameWrapperMessages } from '../GameWrapper';
import { AbstractGameService, GameService } from 'src/app/services/GameService';
import { NextGameLoadingComponent } from '../../normal-component/next-game-loading/next-game-loading.component';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { CurrentGameMocks } from 'src/app/domain/mocks/CurrentGameMocks.spec';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';
import { UserService } from 'src/app/services/UserService';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { PreparationOptions, PreparationResult, prepareStartedGameFor } from './online-game-wrapper.helpers.component.spec';
import { GameServiceMock } from 'src/app/services/tests/GameServiceMock.spec';
import { CurrentGameServiceMock } from 'src/app/services/tests/CurrentGameServiceMock.spec';
import { GameMocks } from 'src/app/domain/PartMocks.spec';


fdescribe('OnlineGameWrapperComponent of Quarto:', () => {

    //
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

    let role: PlayerOrNone;

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
            time: 1,
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
            time: 1,
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
            time: 1,
            user: userFromPlayer(player),
            action,
        }, 1);
        testUtils.detectChanges();
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
        return await testUtils.clickElement('#reject');
        await receiveReply(player, false, 'TakeBack');
        tick(0);
    }

    async function receiveMove(player: Player, move: JSONValue, detectChanges: boolean = true): Promise<void> {
        await gameService.mockGameEvent({
            eventType: 'Move',
            time: 1,
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
        role = preparationResult.role;
        gameService = TestBed.inject(GameService) as AbstractGameService as GameServiceMock;
        wrapper = testUtils.getWrapper() as OnlineGameWrapperComponent;
    }

    function expectGameToBeOver(): void {
        expect(wrapper.chronoZeroGlobal.isIdle())
            .withContext(`chrono zero global should be idle (${ wrapper.chronoZeroGlobal.remainingSeconds })`)
            .toBeTrue();
        expect(wrapper.chronoZeroTurn.isIdle())
            .withContext(`chrono zero turn should be idle ${ wrapper.chronoZeroTurn.remainingSeconds }`)
            .toBeTrue();
        expect(wrapper.chronoOneGlobal.isIdle())
            .withContext(`chrono one global should be idle ${ wrapper.chronoOneGlobal.remainingSeconds }`)
            .toBeTrue();
        expect(wrapper.chronoOneTurn.isIdle())
            .withContext(`chrono one turn should be idle ${ wrapper.chronoOneTurn.remainingSeconds }`)
            .toBeTrue();
        expect(wrapper.endGame)
            .withContext('game should be ended')
            .toBeTrue();
    }

    // async function prepareMoves(moves: JSONValue[]): Promise<void> {
    //     for (const move of moves) {
    //         await receiveMove(move, false);
    //     }
    //     wrapper = testUtils.getWrapper() as OnlineGameWrapperComponent;
    //     testUtils.detectChanges();
    //     tick(0);
    // }
    // async function prepareStartedGameWithMoves(encodedMoves: JSONValue[], waitForPartToStart: boolean = true)
    // : Promise<void>
    // {
    //     // 1. Creating the mocks and testUtils but NOT component
    //     await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);
    //     // 2. Setting the db with the encodedMoves including
    //     await prepareMoves(encodedMoves);
    //     // 3. Setting the component and making it start like it would
    //     if (waitForPartToStart) {
    //         tick(2);
    //     }
    // }


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
        // Given a started part
        await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);

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
            testUtils.expectElementToExist('#playerZeroIndicator');
            const playerIndicator: HTMLElement = testUtils.findElement('#playerZeroIndicator').nativeElement;
            expect(playerIndicator.innerText).toBe(UserMocks.CREATOR_AUTH_USER.username.get());
            testUtils.expectElementToExist('#playerOneIndicator');
            const opponentIndicator: HTMLElement = testUtils.findElement('#playerOneIndicator').nativeElement;
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
                spyOn(gameService, 'refuseTakeBack').and.callThrough();

                // When refusing take back
                await refuseTakeBack(Player.ZERO);
                testUtils.detectChanges();

                // Then a TakeBack rejection reply should have been sent
                testUtils.expectElementNotToExist('#refuseTakeBack');
                expect(gameService.refuseTakeBack).toHaveBeenCalledOnceWith();

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
                const globalTimeBeforeTakeBack: number = wrapper.chronoZeroGlobal.remainingSeconds;
                const turnTimeBeforeTakeBack: number = wrapper.chronoZeroTurn.remainingSeconds;

                // When accepting opponent's take back
                await acceptTakeBack(Player.ONE);

                // Then opponents chrono should have continued to decrease
                tick(1000); // wait a bit to ensure time is decreasing
                const globalTimeAfterTakeBack: number = wrapper.chronoZeroGlobal.remainingSeconds;
                const turnTimeAfterTakeBack: number = wrapper.chronoZeroTurn.remainingSeconds;
                expect(globalTimeAfterTakeBack).toBeLessThan(globalTimeBeforeTakeBack);
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
                spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
                await acceptTakeBack(Player.ONE);

                // Then count down should be resumed for opponent and user should receive their decision time back
                expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledOnceWith();

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
                spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
                await receiveReply(Player.ONE, true, 'TakeBack');
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);
                tick(0);
                testUtils.detectChanges();

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledOnceWith();
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
                spyOn(wrapper.chronoOneGlobal, 'resume').and.callThrough();
                await askTakeBack(Player.ZERO);

                // When opponent accept user's take back
                await receiveReply(Player.ONE, true, 'TakeBack');

                // Then count down should be resumed and update not changing time
                expect(wrapper.chronoOneGlobal.resume).toHaveBeenCalledOnceWith();
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

            spyOn(gameService, 'refuseDraw').and.callThrough();

            await testUtils.clickElement('#reject');
            expect(gameService.refuseDraw).toHaveBeenCalledOnceWith();

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
            spyOn(wrapper.chronoZeroGlobal, 'stop').and.callThrough();
            tick(wrapper.configRoom.moveDuration * 1000);

            // Then it should be detected
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);

            // And the game chronos should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.chronoZeroGlobal.stop).toHaveBeenCalledOnceWith();
        }));

        it(`should stop player's move clock when game clock reaches end`, fakeAsync(async() => {
            // Given an online game with short game time limit
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.shortGlobalClock);
            await receiveSync();

            // When the player runs out of game time
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroTurn, 'stop').and.callThrough();
            tick(wrapper.configRoom.gameDuration * 1000);

            // Then it shoud be detected
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);

            // And the move chrono should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.chronoZeroTurn.stop).toHaveBeenCalledOnceWith();
        }));

        it(`should stop opponent's game clock when turn reaches end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // When they run out of move time
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            tick(wrapper.configRoom.moveDuration * 1000);

            // Then it should be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);

            // And the game chrono should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
        }));

        it(`should stop opponent's move clock when game clock reaches end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.shortGlobalClock);
            await receiveSync();
            await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

            // When they run out of game time
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneTurn, 'stop').and.callThrough();
            tick(wrapper.configRoom.gameDuration * 1000);

            // Then it should be detected
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);

            // And the move chrono should be stopped upon game end
            await receiveEndGame();
            expect(wrapper.chronoOneTurn.stop).toHaveBeenCalledOnceWith();
        }));

    });

    // describe('Add time feature', () => {
    //     describe('from creator', () => {
    //         async function prepareStartedGameForCreator(): Promise<void> {
    //             await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //         }
    //         function waitTimeout(): void {
    //             const msUntilTimeout: number = (wrapper.configRoom.moveDuration + 30) * 1000;
    //             tick(msUntilTimeout);
    //         }
    //         it('should allow to add turn time to opponent', fakeAsync(async() => {
    //             // Given an onlineGameComponent
    //             await prepareStartedGameForCreator();
    //             spyOn(gameService, 'addTurnTime').and.callThrough();

    //             // When creator adds turn time to the opponent
    //             await wrapper.addTurnTime();

    //             // Then an add turn time action is generated
    //             expect(gameService.addTurnTime).toHaveBeenCalledOnceWith('configRoomId');
    //             waitTimeout();
    //         }));
    //         it('should resume both clocks at once when adding turn time', fakeAsync(async() => {
    //             // Given an onlineGameComponent
    //             await prepareStartedGameForCreator();
    //             spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
    //             spyOn(wrapper.chronoZeroTurn, 'resume').and.callThrough();

    //             // When receiving a request to add local time to player zero
    //             await receiveAction(Player.ZERO, 'AddTurnTime');

    //             // Then both clocks of player zero should have been resumed
    //             expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledTimes(1);
    //             expect(wrapper.chronoZeroTurn.resume).toHaveBeenCalledTimes(1);
    //             waitTimeout();
    //         }));
    //         it('should add turn time when receiving AddTurnTime action from Player.ONE', fakeAsync(async() => {
    //             // Given an onlineGameComponent
    //             await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //             spyOn(partDAO, 'update').and.callThrough();

    //             // When receiving AddTurnTime action from player one
    //             await receiveAction(Player.ONE, 'AddTurnTime');

    //             // Then the turn time of player zero should be increased
    //             const secondsUntilTimeout: number = (wrapper.configRoom.moveDuration + 30);
    //             // it should be around 2 minutes + 30 seconds
    //             // (minus the drift it took to process the event, usually 1 or 2ms)
    //             expect(wrapper.chronoZeroTurn.remainingSeconds).toBeGreaterThan(secondsUntilTimeout - 0.010);
    //             expect(wrapper.chronoZeroTurn.remainingSeconds).toBeLessThanOrEqual(secondsUntilTimeout);
    //             tick(secondsUntilTimeout * 1000);
    //         }));
    //         it('should add turn time when receiving AddTurnTime action from Player.ZERO', fakeAsync(async() => {
    //             // Given an onlineGameComponent on user turn
    //             await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //             spyOn(partDAO, 'update').and.callThrough();

    //             // When receiving AddTurnTime action from player zero
    //             await receiveAction(Player.ZERO, 'AddTurnTime');

    //             // Then the turn time of player one should be increased
    //             const secondsUntilTimeout: number = (wrapper.configRoom.moveDuration + 30);
    //             expect(wrapper.chronoOneTurn.remainingSeconds).toBe(secondsUntilTimeout); // initial 2 minutes + 30 sec
    //             tick(secondsUntilTimeout);
    //         }));
    //         it('should allow to add global time to opponent (as Player.ZERO)', fakeAsync(async() => {
    //             // Given an onlineGameComponent on user's turn
    //             await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //             spyOn(gameService, 'addGlobalTime').and.callThrough();

    //             // When the player adds global time to the opponent
    //             await wrapper.addGlobalTime();

    //             // Then a request to add global time to player one should be sent
    //             expect(gameService.addGlobalTime).toHaveBeenCalledOnceWith();
    //             const secondsUntilTimeout: number = wrapper.configRoom.moveDuration;
    //             expect(wrapper.chronoOneTurn.remainingSeconds).toBe(secondsUntilTimeout); // initial 2 minutes
    //             tick(secondsUntilTimeout * 1000);
    //         }));
    //         it('should add time to global clock when receiving AddGlobalTime action from Player.ONE', fakeAsync(async() => {
    //             // Given an onlineGameComponent on user's turn
    //             await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //             spyOn(partDAO, 'update').and.callThrough();

    //             // When receiving addGlobalTime request
    //             await receiveAction(Player.ONE, 'AddGlobalTime');

    //             // Then chrono global of player one should be increased by 5 new minutes
    //             const secondsUntilTimeout: number = (30 * 60) + (5 * 60);
    //             expect(wrapper.chronoZeroGlobal.remainingSeconds).toBeGreaterThan(secondsUntilTimeout - 0.010);
    //             expect(wrapper.chronoZeroGlobal.remainingSeconds).toBeLessThanOrEqual(secondsUntilTimeout);
    //             tick(wrapper.configRoom.moveDuration * 1000);
    //         }));
    //         it('should add time to global clock when receiving the AddGlobalTime action from Player.ZERO', fakeAsync(async() => {
    //             // Given an onlineGameComponent
    //             await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

    //             // When receiving addGlobalTime request
    //             await receiveAction(Player.ZERO, 'AddGlobalTime');

    //             // Then chrono global of player one should be increased by 5 new minutes
    //             expect(wrapper.chronoOneGlobal.remainingSeconds).toBe((30 * 60) + (5 * 60));
    //             tick(wrapper.configRoom.moveDuration * 1000);
    //         }));
    //         it('should postpone the timeout of chrono and not only change displayed time', fakeAsync(async() => {
    //             // Given an onlineGameComponent
    //             await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

    //             // When receiving an AddTurnTime action
    //             await receiveAction(Player.ONE, 'AddTurnTime');
    //             testUtils.detectChanges();

    //             // Then game should end by timeout only after new time has run out
    //             tick(wrapper.configRoom.moveDuration * 1000);
    //             expect(testUtils.getWrapper().endGame).withContext('game should not be finished yet').toBeFalse();
    //             tick(30 * 1000);
    //             expectGameToBeOver();
    //         }));
    //     });
    //     describe('opponent', () => {
    //         it('should allow to add global time to opponent (as Player.ONE)', fakeAsync(async() => {
    //             // Given an onlineGameComponent on opponent's turn
    //             await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
    //             spyOn(gameService, 'addGlobalTime').and.callThrough();

    //             // When countDownComponent emit addGlobalTime
    //             await wrapper.addGlobalTime();

    //             // Then a request to add global time to player zero should be sent
    //             expect(gameService.addGlobalTime).toHaveBeenCalledOnceWith('configRoomId');

    //             const msUntilTimeout: number = wrapper.configRoom.moveDuration * 1000;
    //             tick(msUntilTimeout);
    //         }));
    //     });
    // });

    // describe('User "handshake"', () => {
    //     // Disabled because we don't have a way to check the connectivity status currently
    //     xit(`should make opponent's name lightgrey when he is token-outdated`, fakeAsync(async() => {
    //         // Given a connected opponent
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

    //         // When the opponent token become too old
    //         // Creator update their last presence token
    //         const userService: UserService = TestBed.inject(UserService);
    //         await userService.updatePresenceToken(UserMocks.CREATOR_AUTH_USER.id);
    //         // but chosenOpponent don't update their last presence token
    //         tick(PartCreationComponent.TOKEN_TIMEOUT); // two token time pass and reactive the timeout
    //         testUtils.detectChanges();

    //         // Then opponent's name should be lightgrey
    //         testUtils.expectElementToHaveClass('#playerOneIndicator', 'has-text-grey-light');
    //         tick(wrapper.configRoom.moveDuration * 1000 + 1);
    //     }));
    // });

    // describe('Resign', () => {
    //     it('should end game after clicking on resign button', fakeAsync(async() => {
    //         // Given an online game component
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //         await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

    //         // When clicking on resign button
    //         spyOn(partDAO, 'update').and.callThrough();
    //         await testUtils.clickElement('#resign');
    //         tick(0);

    //         // Then the game should be ended
    //         expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
    //             winner: UserMocks.OPPONENT_MINIMAL_USER,
    //             loser: UserMocks.CREATOR_MINIMAL_USER,
    //             result: MGPResult.RESIGN.value,
    //         });
    //         expectGameToBeOver();
    //     }));

    //     it('should not allow player to move after resigning', fakeAsync(async() => {
    //         // Given a component where user has resigned
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //         await testUtils.clickElement('#resign');
    //         tick(0);

    //         // When attempting a move
    //         // Then it should fail
    //         spyOn(partDAO, 'update').and.callThrough();
    //         await testUtils.expectClickFailure('#click-piece-1', GameWrapperMessages.GAME_HAS_ENDED());

    //         expect(partDAO.update).not.toHaveBeenCalled();
    //         expectGameToBeOver();
    //     }));

    //     it('should display when the opponent resigned', fakeAsync(async() => {
    //         // Given a board where the opponent has resigned
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //         await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
    //         await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
    //         await receivePartDAOUpdate({
    //             winner: UserMocks.CREATOR_MINIMAL_USER,
    //             loser: UserMocks.OPPONENT_MINIMAL_USER,
    //             result: MGPResult.RESIGN.value,
    //         });
    //         await receiveAction(Player.ONE, 'EndGame');

    //         // When checking "victory text"
    //         const resignText: string = testUtils.findElement('#resignIndicator').nativeElement.innerText;

    //         // Then we should see "opponent has resign"
    //         expect(resignText).toBe(`firstCandidate has resigned.`);
    //         expectGameToBeOver();
    //     }));

    // });

    // describe('rematch', () => {

    //     it('should show propose button only when game is ended', fakeAsync(async() => {
    //         // Given a game that is not finished
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         testUtils.expectElementToBeDisabled('#proposeRematch');

    //         // When it is finished
    //         await testUtils.expectInterfaceClickSuccess('#resign', undefined, 0);

    //         // Then it should allow to propose rematch
    //         testUtils.expectElementToBeEnabled('#proposeRematch');
    //     }));

    //     it('should send proposal request when proposing', fakeAsync(async() => {
    //         // Given an ended game
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         await testUtils.expectInterfaceClickSuccess('#resign');
    //         tick(0);
    //         testUtils.detectChanges();

    //         // When the propose rematch button is clicked
    //         gameService = TestBed.inject(GameService);
    //         spyOn(gameService, 'proposeRematch').and.callThrough();
    //         await testUtils.expectInterfaceClickSuccess('#proposeRematch');

    //         // Then the gameService must be called
    //         expect(gameService.proposeRematch).toHaveBeenCalledOnceWith('configRoomId');
    //     }));

    //     it('should disable button after proposing', fakeAsync(async() => {
    //         // Given an ended game
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         await testUtils.expectInterfaceClickSuccess('#resign');
    //         tick(0);
    //         testUtils.detectChanges();

    //         // When the propose rematch button is clicked
    //         spyOn(gameService, 'proposeRematch').and.callThrough();
    //         await testUtils.expectInterfaceClickSuccess('#proposeRematch');

    //         // Then the button should be disabled
    //         testUtils.expectElementToBeDisabled('#proposeRematch');
    //     }));

    //     it('should send reply when rejecting', fakeAsync(async() => {
    //         // Given an ended game with a received proposal request
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         await testUtils.expectInterfaceClickSuccess('#resign');
    //         await receiveRequest(Player.ONE, 'Rematch');
    //         tick(0);
    //         testUtils.detectChanges();
    //         gameService = TestBed.inject(GameService);
    //         spyOn(gameService, 'rejectRematch').and.callThrough();

    //         // When the reject rematch button is clicked
    //         await testUtils.expectInterfaceClickSuccess('#reject');

    //         // Then the gameService's rejectRematch must be called
    //         expect(gameService.rejectRematch).toHaveBeenCalledOnceWith('configRoomId');
    //     }));

    //     it('should show when opponent rejected our rematch proposal', fakeAsync(async() => {
    //         // Given an ended game where we propose a rematch
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         await testUtils.expectInterfaceClickSuccess('#resign');
    //         tick(0);
    //         testUtils.detectChanges();
    //         await testUtils.expectInterfaceClickSuccess('#proposeRematch');
    //         tick(0);

    //         // When the rematch is rejected by the opponent
    //         await receiveReply(Player.ONE, 'Reject', 'Rematch');

    //         // Then we should be notified
    //         testUtils.expectElementToExist('#requestRejected');
    //     }));

    //     it('should show accept/reject button when proposition has been sent', fakeAsync(async() => {
    //         // Given an ended game
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         await testUtils.expectInterfaceClickSuccess('#resign');
    //         tick(0);
    //         testUtils.detectChanges();

    //         // When request is received
    //         testUtils.expectElementNotToExist('#accept');
    //         await receiveRequest(Player.ONE, 'Rematch');

    //         // Then accept/refuse buttons must be shown
    //         testUtils.detectChanges();
    //         testUtils.expectElementToExist('#accept');
    //     }));

    //     it('should send accepting request when user accept rematch', fakeAsync(async() => {
    //         // give a part with rematch request send by opponent
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         await testUtils.expectInterfaceClickSuccess('#resign');
    //         await receiveRequest(Player.ONE, 'Rematch');

    //         // When accepting it
    //         const router: Router = TestBed.inject(Router);
    //         spyOn(router, 'navigate').and.resolveTo();
    //         gameService = TestBed.inject(GameService);
    //         spyOn(gameService, 'acceptRematch').and.callThrough();
    //         tick(0);
    //         testUtils.detectChanges();
    //         await testUtils.expectInterfaceClickSuccess('#accept');

    //         // Then it should have called acceptRematch
    //         expect(gameService.acceptRematch).toHaveBeenCalledTimes(1);
    //     }));

    //     it('should redirect to new part when rematch is accepted', fakeAsync(async() => {
    //         // Given a part lost with rematch request send by user
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);

    //         await testUtils.expectInterfaceClickSuccess('#resign');
    //         tick(0);
    //         testUtils.detectChanges();
    //         await testUtils.expectInterfaceClickSuccess('#proposeRematch');

    //         // When opponent accepts it
    //         const router: Router = TestBed.inject(Router);
    //         spyOn(router, 'navigate').and.resolveTo();
    //         await receiveReply(Player.ONE, 'Accept', 'Rematch', 'nextPartId');
    //         await receiveAction(Player.ONE, 'EndGame');

    //         // Then it should redirect to new part
    //         expectValidRouting(router, ['/nextGameLoading'], NextGameLoadingComponent, { otherRoutes: true });
    //         expectValidRouting(router, ['/play', 'Quarto', 'nextPartId'], OnlineGameWrapperComponent, { otherRoutes: true });
    //     }));
    // });

    // describe('Non Player Experience', () => {

    //     it('should redirect to lobby when currentGame changed to non-observer', fakeAsync(async() => {
    //         // Given a part component where user is observer
    //         await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

    //         // When currentGame is updated to inform component that user is now candidate in another game
    //         const router: Router = TestBed.inject(Router);
    //         spyOn(router, 'navigate').and.resolveTo();
    //         const currentGame: CurrentGame = CurrentGameMocks.OTHER_CANDIDATE;
    //         CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));

    //         // Then the currentGame should have been removed
    //         expectValidRouting(router, ['/lobby'], LobbyComponent);
    //     }));

    //     it('should not be able to do anything', fakeAsync(async() => {
    //         // Given a part that we are observing
    //         await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
    //         // which has already some moves
    //         await receiveNewMoves(0, [FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED]);
    //         // and a request
    //         await receiveRequest(Player.ZERO, 'TakeBack');
    //         // When displaying the component
    //         // Then we don't see any interaction button
    //         const forbiddenButtons: string[] = [
    //             '#proposeTakeBack',
    //             '#proposeDraw',
    //             '#resign',
    //             '#accept',
    //             '#reject',
    //         ];
    //         for (const forbiddenButton of forbiddenButtons) {
    //             testUtils.expectElementNotToExist(forbiddenButton);
    //         }
    //     }));

    //     it('should display that the game is a draw', fakeAsync(async() => {
    //         // Given a part that the two players agreed to draw
    //         await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
    //         await receiveRequest(Player.ZERO, 'Draw');
    //         await receivePartDAOUpdate({
    //             result: MGPResult.AGREED_DRAW_BY_ONE.value,
    //         });
    //         await receiveReply(Player.ONE, 'Accept', 'Draw');
    //         await receiveAction(Player.ONE, 'EndGame');
    //         testUtils.detectChanges();
    //         tick(0);

    //         // When displaying the board
    //         // Then the text should indicate players have agreed to draw
    //         testUtils.expectElementToExist('#playersAgreedToDraw');
    //         expectGameToBeOver();
    //     }));

    //     it('should not notify timeout victory', fakeAsync(async() => {
    //         // Given a part where we are observer
    //         await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
    //         spyOn(gameService, 'notifyTimeout').and.callThrough();
    //         // When a player times out
    //         await wrapper.reachedOutOfTime(Player.ZERO);
    //         // Then we should not notify the timeout
    //         expect(gameService.notifyTimeout).not.toHaveBeenCalled();
    //     }));
    //     describe('Animation', () => {
    //         it(`should trigger animation when receiving player move (observer)`, fakeAsync(async() => {
    //             // Given any turn
    //             await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

    //             // When receiving players's move
    //             spyOn(testUtils.getGameComponent(), 'updateBoard').and.callThrough();
    //             await receiveNewMoves(0, [FIRST_MOVE_ENCODED]);

    //             // Then gameComponent.updateBoard should have been called with true, to show animation
    //             expect(testUtils.getGameComponent().updateBoard).toHaveBeenCalledOnceWith(true);
    //             tick(wrapper.configRoom.moveDuration * 1000);
    //         }));
    //     });
    // });

    // describe('Visuals', () => {
    //     it('should highlight each player name in their respective color', fakeAsync(async() => {
    //         // Given a game that has been started
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);

    //         // When the game is displayed
    //         tick(2);
    //         testUtils.detectChanges();

    //         // Then it should highlight the player's names
    //         testUtils.expectElementToHaveClass('#playerZeroIndicator', 'player0-bg-darker');
    //         testUtils.expectElementToHaveClass('#playerOneIndicator', 'player1-bg-darker');
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));

    //     it('should highlight the board with the color of the player when it is their turn', fakeAsync(async() => {
    //         // Given a game that has been started
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);

    //         // When the component initialize and it is the current player's turn
    //         tick(2);
    //         testUtils.detectChanges();

    //         // Then it should highlight the board with its color
    //         testUtils.expectElementToHaveClass('#board-highlight', 'player0-bg');
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));

    //     it('should highlight the board in grey when game is over', fakeAsync(async() => {
    //         // Given a game that has been started
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

    //         // When the game is over
    //         await testUtils.clickElement('#resign');
    //         tick(0);
    //         testUtils.detectChanges();

    //         // Then it should highlight the board with its color
    //         testUtils.expectElementToHaveClass('#board-highlight', 'endgame-bg');
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));

    //     it('should not highlight the board when it is the turn of the opponent', fakeAsync(async() => {
    //         // Given a game that has been started
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

    //         // When it is not the current player's turn
    //         await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
    //         testUtils.detectChanges();

    //         // Then it should not highlight the board
    //         testUtils.expectElementNotToHaveClass('#board-highlight', 'player1-bg');
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));
    // });

    // describe('onCancelMove', () => {
    //     it('should delegate to gameComponent.showLastMove', fakeAsync(async() => {
    //         // Given a any component
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
    //         await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
    //         const component: QuartoComponent = testUtils.getGameComponent();
    //         spyOn(component, 'showLastMove').and.callThrough();

    //         // When calling onCancelMove
    //         await testUtils.getWrapper().onCancelMove();

    //         // Then showLastMove should have been called
    //         expect(component.showLastMove).toHaveBeenCalledOnceWith(FIRST_MOVE);
    //     }));

    //     it('should not call gameComponent.showLastMove if there is no move', fakeAsync(async() => {
    //         // Given a component without previous move
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //         const component: QuartoComponent = testUtils.getGameComponent();
    //         spyOn(component, 'showLastMove').and.callThrough();

    //         // When calling onCancelMove
    //         await testUtils.getWrapper().onCancelMove();

    //         // Then showLastMove should not have been called
    //         expect(component.showLastMove).not.toHaveBeenCalled();
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));
    // });

    // describe('interactivity', () => {
    //     it('should be interactive at first turn for current player', fakeAsync(async() => {
    //         // Given a component at the beginning of the game, where we are Player.ZERO
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //         // When displaying it
    //         // Then it should be interactive
    //         expect(testUtils.getGameComponent().isInteractive()).toBeTrue();
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));

    //     it('should not be interactive when at the turn of the opponent', fakeAsync(async() => {
    //         // Given a game that has been started
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

    //         // When it is not the current player's turn
    //         await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);
    //         testUtils.detectChanges();

    //         // Then it should not be interactive
    //         expect(testUtils.getGameComponent().isInteractive()).toBeFalse();
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));

    //     it('should not be interactive when the game is finished', fakeAsync(async() => {
    //         // Given a board at the opponent's turn
    //         await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
    //         await doMoveByClicks(Player.ZERO, FIRST_MOVE, FIRST_MOVE_ENCODED);

    //         // When the game ends (e.g., they lose or resign)
    //         await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
    //         await receivePartDAOUpdate({
    //             winner: UserMocks.CREATOR_MINIMAL_USER,
    //             loser: UserMocks.OPPONENT_MINIMAL_USER,
    //             result: MGPResult.RESIGN.value,
    //         });
    //         await receiveAction(Player.ONE, 'EndGame');

    //         // Then it should not be interactive
    //         expect(testUtils.getGameComponent().isInteractive()).toBeFalse();
    //         tick(wrapper.configRoom.moveDuration * 1000);
    //     }));
    // });
});

/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import firebase from 'firebase/app';

import { OnlineGameWrapperComponent, UpdateType } from './online-game-wrapper.component';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { IJoiner, PartStatus } from 'src/app/domain/ijoiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { UserDAO } from 'src/app/dao/UserDAO';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { Request } from 'src/app/domain/request';
import { IPart, MGPResult, Part } from 'src/app/domain/icurrentpart';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player } from 'src/app/jscaip/Player';
import { IUser } from 'src/app/domain/iuser';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { Time } from 'src/app/domain/Time';
import { getMillisecondsDifference } from 'src/app/utils/TimeUtils';
import { Router } from '@angular/router';
import { GameWrapperMessages } from '../GameWrapper';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { Utils } from 'src/app/utils/utils';
import { GameService } from 'src/app/services/GameService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

describe('OnlineGameWrapperComponent of Quarto:', () => {

    /* Life cycle summary
     * component construction (beforeEach)
     * stage 0
     * ngOnInit (triggered by detectChanges)
     * stage 1: PartCreationComponent appear
     * startGame, launched by user if game was not started yet, or automatically (via partCreationComponent)
     * stage 2: PartCreationComponent dissapear, GameIncluderComponent appear
     * tick(1): the async part of startGame is now finished
     * stage 3: P4Component appear
     * differents scenarios
     */

    let componentTestUtils: ComponentTestUtils<QuartoComponent>;

    let wrapper: OnlineGameWrapperComponent;

    let joinerDAO: JoinerDAO;
    let partDAO: PartDAO;
    let userDAO: UserDAO;
    let chatDAO: ChatDAO;

    const USER_CREATOR: AuthUser = new AuthUser(MGPOptional.of('cre@tor'), MGPOptional.of('creator'), true);

    const PLAYER_CREATOR: IUser = {
        username: 'creator',
        state: 'online',
        verified: true,
    };
    const USER_OPPONENT: AuthUser = new AuthUser(MGPOptional.of('firstCandidate@mgp.team'), MGPOptional.of('firstCandidate'), true);

    const PLAYER_OPPONENT: IUser = {
        username: 'firstCandidate',
        last_changed: {
            seconds: Date.now() / 1000,
            nanoseconds: Date.now() % 1000,
        },
        state: 'online',
        verified: true,
    };
    const OBSERVER: IUser = {
        username: 'jeanJaja',
        last_changed: {
            seconds: Date.now() / 1000,
            nanoseconds: Date.now() % 1000,
        },
        state: 'online',
        verified: true,
    };
    const FAKE_MOMENT: Time = { seconds: 123, nanoseconds: 456000000 };

    const BASE_TAKE_BACK_REQUEST: Partial<IPart> = {
        request: Request.takeBackAccepted(Player.ONE),
        listMoves: [],
        turn: 0,
        lastMoveTime: FAKE_MOMENT,
    };
    let observerRole: Player;

    async function prepareMockDBContent(initialJoiner: IJoiner): Promise<void> {
        partDAO = TestBed.inject(PartDAO);
        joinerDAO = TestBed.inject(JoinerDAO);
        userDAO = TestBed.inject(UserDAO);
        chatDAO = TestBed.inject(ChatDAO);
        await joinerDAO.set('joinerId', initialJoiner);
        await partDAO.set('joinerId', PartMocks.INITIAL.doc);
        await userDAO.set('firstCandidateDocId', PLAYER_OPPONENT);
        await userDAO.set('creatorDocId', PLAYER_CREATOR);
        await userDAO.set(Utils.getNonNullable(OBSERVER.username), OBSERVER);
        await chatDAO.set('joinerId', { messages: [], status: `I don't have a clue` });
        return Promise.resolve();
    }
    async function prepareStartedGameFor(user: AuthUser, shorterGlobalChrono?: boolean): Promise<void> {
        await prepareMockDBContent(JoinerMocks.INITIAL.doc);
        AuthenticationServiceMock.setUser(user);
        observerRole = user === USER_CREATOR ? Player.ZERO : Player.ONE;
        componentTestUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as OnlineGameWrapperComponent;
        componentTestUtils.detectChanges();
        tick(1);
        componentTestUtils.bindGameComponent();

        const partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
        expect(partCreationId)
            .withContext('partCreation id should be present after ngOnInit')
            .toBeTruthy();
        expect(wrapper.partCreation)
            .withContext('partCreation field should also be present')
            .toBeTruthy();
        await joinerDAO.update('joinerId', { candidates: ['firstCandidate'] });
        componentTestUtils.detectChanges();
        await joinerDAO.update('joinerId', {
            partStatus: PartStatus.PART_CREATED.value,
            candidates: ['firstCandidate'],
            chosenPlayer: 'firstCandidate',
        });
        // TODO: replace by real actor action (chooseCandidate)
        componentTestUtils.detectChanges();
        await wrapper.partCreation.proposeConfig();
        componentTestUtils.detectChanges();
        if (shorterGlobalChrono != null) {
            await joinerDAO.update('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
                totalPartDuration: 10,
            });
        } else {
            await joinerDAO.update('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }
        const modifications: Partial<IPart> = {
            playerOne: 'firstCandidate',
            turn: 0,
            remainingMsForZero: 1800 * 1000,
            remainingMsForOne: 1800 * 1000,
            beginning: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await partDAO.updateAndBumpIndex('joinerId', observerRole, 0, modifications);
        componentTestUtils.detectChanges();
        return Promise.resolve();
    }
    const FIRST_MOVE: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BABB);

    const SECOND_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);

    const THIRD_MOVE: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BABA);

    const FIRST_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(FIRST_MOVE);

    const SECOND_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(SECOND_MOVE);

    const THIRD_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(THIRD_MOVE);

    async function doMove(move: QuartoMove, legal: boolean): Promise<MGPValidation> {
        const state: QuartoState = wrapper.gameComponent.rules.node.gameState as QuartoState;
        const result: MGPValidation = await wrapper.gameComponent.chooseMove(move, state);
        expect(result.isSuccess())
            .withContext('move ' + move.toString() + ' should be legal but failed because: ' + result.reason)
            .toEqual(legal);
        componentTestUtils.detectChanges();
        tick(1);
        return result;
    }
    async function receiveRequest(request: Request, lastIndex: number): Promise<void> {
        await receivePartDAOUpdate({ request }, lastIndex);
    }
    async function receivePartDAOUpdate(update: Partial<IPart>, lastIndex: number): Promise<void> {
        const user: Player = observerRole;
        await partDAO.updateAndBumpIndex('joinerId', user, lastIndex, update);
        componentTestUtils.detectChanges();
        tick(1);
    }
    async function askTakeBack(): Promise<void> {
        return await componentTestUtils.clickElement('#askTakeBackButton');
    }
    async function acceptTakeBack(): Promise<void> {
        return await componentTestUtils.clickElement('#acceptTakeBackButton');
    }
    async function refuseTakeBack(): Promise<void> {
        return await componentTestUtils.clickElement('#refuseTakeBackButton');
    }
    async function receiveNewMoves(moves: number[],
                                   lastIndex: number,
                                   remainingMsForZero: number,
                                   remainingMsForOne: number)
    : Promise<void>
    {
        const modifications: Partial<IPart> = {
            listMoves: ArrayUtils.copyImmutableArray(moves),
            turn: moves.length,
            request: null,
            remainingMsForOne,
            remainingMsForZero, // TODO: only send one of the two time updated, since that's what happens
            lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
        };
        return await receivePartDAOUpdate(modifications, lastIndex);
    }
    async function prepareBoard(moves: QuartoMove[], player: Player = Player.ZERO): Promise<void> {
        let authUser: AuthUser = USER_CREATOR;
        if (player === Player.ONE) {
            authUser = USER_OPPONENT;
        }
        await prepareStartedGameFor(authUser);
        tick(1);
        const receivedMoves: number[] = [];
        let remainingMsForZero: number = 1800 * 1000;
        let remainingMsForOne: number = 1800 * 1000;
        let offset: number = 0;
        if (player === Player.ONE) {
            offset = 1;
            const firstMove: QuartoMove = moves[0];
            const encodedMove: number = QuartoMove.encoder.encodeNumber(firstMove);
            receivedMoves.push(encodedMove);
            await receiveNewMoves(receivedMoves, 1, remainingMsForZero, remainingMsForOne);
        }
        for (let i: number = offset; i < moves.length; i+=2) {
            const move: QuartoMove = moves[i];
            await doMove(moves[i], true);
            receivedMoves.push(QuartoMove.encoder.encodeNumber(move), QuartoMove.encoder.encodeNumber(moves[i+1]));
            if (i > 1) {
                if (i % 2 === 0) {
                    remainingMsForOne -= 1;
                } else {
                    remainingMsForZero -= 1;
                }
            }
            await receiveNewMoves(receivedMoves, i + 2, remainingMsForZero, remainingMsForOne);
        }
    }
    function expectGameToBeOver(): void {
        expect(wrapper.chronoZeroGlobal.isIdle()).withContext('chrono zero global should be idle').toBeTrue();
        expect(wrapper.chronoZeroTurn.isIdle()).withContext('chrono zero turn should be idle').toBeTrue();
        expect(wrapper.chronoOneGlobal.isIdle()).withContext('chrono one global should be idle').toBeTrue();
        expect(wrapper.chronoOneTurn.isIdle()).withContext('chrono one turn should be idle').toBeTrue();
        expect(wrapper.endGame).toBeTrue();
    }
    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame('Quarto');
    }));
    it('Should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareStartedGameFor(USER_CREATOR);
        spyOn(wrapper, 'reachedOutOfTime').and.callFake(() => {});
        // Should not even been called but:
        // reachedOutOfTime is called (in test) after tick(1) even though there is still remainingTime
        tick(1);
        expect(wrapper.currentPart.doc.listMoves).toEqual([]);
        expect(wrapper.currentPart.doc.listMoves).toEqual([]);
        expect(wrapper.currentPlayer).toEqual('creator');
        wrapper.pauseCountDownsFor(Player.ZERO);
    }));
    it('Should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        await prepareStartedGameFor(USER_CREATOR);
        const partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
        let quartoTag: DebugElement = componentTestUtils.querySelector('app-quarto');
        expect(partCreationId)
            .withContext('partCreation id should be absent after config accepted')
            .toBeFalsy();
        expect(quartoTag)
            .withContext('quarto tag should be absent before config accepted and async ms finished')
            .toBeFalsy();
        expect(wrapper.partCreation)
            .withContext('partCreation field should be absent after config accepted')
            .toBeFalsy();
        expect(componentTestUtils.getComponent())
            .withContext('gameComponent field should be absent after config accepted and async ms finished')
            .toBeFalsy();
        tick(1);

        quartoTag = componentTestUtils.querySelector('app-quarto');
        expect(quartoTag)
            .withContext('quarto tag should be present after config accepted and async millisec finished')
            .toBeTruthy();
        expect(wrapper.gameComponent)
            .withContext('gameComponent field should also be present after config accepted and async millisec finished')
            .toBeTruthy();
        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('Should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor(USER_CREATOR);
        tick(1);

        await doMove(FIRST_MOVE, true);

        expect(wrapper.currentPart.doc.listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(wrapper.currentPart.doc.turn).toEqual(1);

        // Receive second move
        const remainingMsForZero: number = Utils.getNonNullable(wrapper.currentPart.doc.remainingMsForZero);
        const remainingMsForOne: number = Utils.getNonNullable(wrapper.currentPart.doc.remainingMsForOne);
        await receiveNewMoves([FIRST_MOVE_ENCODED, 166], 2, remainingMsForZero, remainingMsForOne);

        expect(wrapper.currentPart.doc.turn).toEqual(2);
        expect(wrapper.currentPart.doc.listMoves).toEqual([FIRST_MOVE_ENCODED, 166]);
        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('should show player names', fakeAsync(async() => {
        // Given a started game
        await prepareStartedGameFor(USER_CREATOR);
        tick(1);
        componentTestUtils.detectChanges();

        // Then the usernames should be shown
        const playerIndicator: HTMLElement = componentTestUtils.findElement('#playerZeroIndicator').nativeElement;
        expect(playerIndicator.innerText).toBe(USER_CREATOR.username.get());
        const opponentIndicator: HTMLElement = componentTestUtils.findElement('#playerOneIndicator').nativeElement;
        expect(opponentIndicator.innerText).toBe(USER_OPPONENT.username.get());

        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('Prepared Game for joiner should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor(USER_OPPONENT);
        tick(1);

        // Receive first move
        await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);

        expect(wrapper.currentPart.doc.listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(wrapper.currentPart.doc.turn).toEqual(1);

        // Do second move
        const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBA);
        await doMove(move, true);
        const expectedListMove: number[] = [FIRST_MOVE_ENCODED, QuartoMove.encoder.encodeNumber(move)];
        expect(wrapper.currentPart.doc.listMoves).toEqual(expectedListMove);
        expect(wrapper.currentPart.doc.turn).toEqual(2);

        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('Move should trigger db change', fakeAsync(async() => {
        await prepareStartedGameFor(USER_CREATOR);
        tick(1);
        spyOn(partDAO, 'update').and.callThrough();
        await doMove(FIRST_MOVE, true);
        expect(wrapper.currentPart.doc.listMoves).toEqual([QuartoMove.encoder.encodeNumber(FIRST_MOVE)]);
        const expectedUpdate: Partial<IPart> = {
            lastUpdate: {
                index: 2,
                player: observerRole.value,
            },
            listMoves: [QuartoMove.encoder.encodeNumber(FIRST_MOVE)],
            turn: 1,
            // remaining times not updated on first turn of the component
            request: null,
            lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
        };
        // TODO: should receive somewhere some kind of Timestamp written by DB
        expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', expectedUpdate );
        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('should forbid making a move when it is not the turn of the player', fakeAsync(async() => {
        const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);

        // given a game
        await prepareStartedGameFor(USER_CREATOR);
        spyOn(messageDisplayer, 'gameMessage');
        tick(1);

        // when it is not the player's turn (because he made the first move)
        await doMove(FIRST_MOVE, true);

        // then the player cannot play
        componentTestUtils.clickElement('#chooseCoord_0_0');
        expect(messageDisplayer.gameMessage).toHaveBeenCalledWith(GameWrapperMessages.NOT_YOUR_TURN());

        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('Should allow player to pass when gameComponent allows it', fakeAsync(async() => {
        await prepareStartedGameFor(USER_CREATOR);
        tick(1);
        componentTestUtils.expectElementNotToExist('#passButton');

        wrapper.gameComponent.canPass = true;
        wrapper.gameComponent['pass'] = async() => {
            return MGPValidation.SUCCESS;
        };
        componentTestUtils.detectChanges();

        await componentTestUtils.clickElement('#passButton');

        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('Should not update currentPart when receiving MOVE_WITHOUT_TIME update', fakeAsync(async() => {
        // Given a board where its the opponent's (first) turn
        await prepareStartedGameFor(USER_CREATOR);
        tick(1);
        const CURRENT_PART: Part = wrapper.currentPart;

        // when receiving a move time being null
        await receivePartDAOUpdate({
            lastMoveTime: null,
            listMoves: [FIRST_MOVE_ENCODED],
            turn: 1,
        }, 1);

        // then currentPart should not be updated
        expect(wrapper.currentPart).toEqual(CURRENT_PART);
        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('Should not do anything when receiving duplicate', fakeAsync(async() => {
        // Given a board where its the opponent's (first) turn
        await prepareStartedGameFor(USER_CREATOR);
        tick(1);
        const CURRENT_PART: Part = wrapper.currentPart;

        // when receiving the same move
        await receivePartDAOUpdate({
            ...CURRENT_PART.doc,
        }, 0); // 0 so that even when bumped, the lastUpdate stays the same

        // then currentPart should not be updated
        expect(wrapper.currentPart).toEqual(CURRENT_PART);
        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    describe('Move victory', () => {
        it('Victory move from player should notifyVictory', fakeAsync(async() => {
            //  Given a board on which user can win
            const move0: QuartoMove = new QuartoMove(0, 3, QuartoPiece.AAAB);
            const move1: QuartoMove = new QuartoMove(1, 3, QuartoPiece.AABA);
            const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBB);
            const move3: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AABB);
            await prepareBoard([move0, move1, move2, move3]);
            componentTestUtils.expectElementNotToExist('#winnerIndicator');

            // when doing winning move
            spyOn(partDAO, 'update').and.callThrough();
            const winningMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.ABAA);
            await doMove(winningMove, true);

            // then the game should be a victory
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(winningMove);
            expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                lastUpdate: {
                    index: 6,
                    player: observerRole.value,
                },
                listMoves: [move0, move1, move2, move3, winningMove].map(QuartoMove.encoder.encodeNumber),
                turn: 5,
                // remainingTimes are not present on the first move of a current board
                request: null,
                lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                winner: 'creator',
                loser: 'firstCandidate',
                result: MGPResult.VICTORY.value,
            });
            componentTestUtils.expectElementToExist('#youWonIndicator');
            expectGameToBeOver();
        }));
        it('Draw move from player should notifyDraw', fakeAsync(async() => {
            //  Given a board on which user can draw
            const moves: QuartoMove[] = [
                new QuartoMove(0, 0, QuartoPiece.AAAB),
                new QuartoMove(0, 1, QuartoPiece.AABA),
                new QuartoMove(0, 2, QuartoPiece.BBAA),
                new QuartoMove(0, 3, QuartoPiece.ABAA),

                new QuartoMove(1, 0, QuartoPiece.ABAB),
                new QuartoMove(1, 1, QuartoPiece.ABBA),
                new QuartoMove(1, 2, QuartoPiece.BABB),
                new QuartoMove(1, 3, QuartoPiece.BAAA),

                new QuartoMove(2, 0, QuartoPiece.BAAB),
                new QuartoMove(2, 1, QuartoPiece.BABA),
                new QuartoMove(2, 2, QuartoPiece.ABBB),
                new QuartoMove(2, 3, QuartoPiece.AABB),

                new QuartoMove(3, 0, QuartoPiece.BBBA),
                new QuartoMove(3, 1, QuartoPiece.BBAB),
                new QuartoMove(3, 2, QuartoPiece.BBBB),
            ];
            await prepareBoard(moves, Player.ONE);
            componentTestUtils.expectElementNotToExist('#winnerIndicator');

            // when doing winning move
            spyOn(partDAO, 'update').and.callThrough();
            const drawingMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.NONE);
            await doMove(drawingMove, true);

            // then the game should be a victory
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(drawingMove);
            const listMoves: QuartoMove[] = moves.concat(drawingMove);
            expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                lastUpdate: {
                    index: 17,
                    player: Player.ONE.value,
                },
                listMoves: listMoves.map(QuartoMove.encoder.encodeNumber),
                turn: 16,
                // TODO: investigate on why remainingTimes is not changed
                request: null,
                lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                result: MGPResult.HARD_DRAW.value,
            });
            componentTestUtils.expectElementToExist('#hardDrawIndicator');
            expectGameToBeOver();
        }));
    });
    describe('Take Back', () => {
        describe('sending/receiving', () => {
            it('Should send take back request when player ask to', fakeAsync(async() => {
                // Given a board where its the opponent's (first) turn
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);

                // when demanding to take back
                spyOn(partDAO, 'update').and.callThrough();
                await askTakeBack();

                // then a request should be sent
                expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                    lastUpdate: {
                        index: 3,
                        player: Player.ZERO.value,
                    },
                    request: Request.takeBackAsked(Player.ZERO),
                });
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('Should forbid to propose to take back while take back request is waiting', fakeAsync(async() => {
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                componentTestUtils.expectElementNotToExist('#askTakeBackButton');
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                componentTestUtils.detectChanges();
                componentTestUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('Should not propose to Player.ONE to take back before his first move', fakeAsync(async() => {
                // Given a board where nobody already played
                await prepareStartedGameFor(USER_OPPONENT);
                tick(1);

                // when asking take back, the button should not be here
                componentTestUtils.expectElementNotToExist('#askTakeBackButton');

                // when receiving a new move, it should still not be showed nor possible
                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                componentTestUtils.expectElementNotToExist('#askTakeBackButton');

                // when doing the first move, it should become possible, but only once
                await doMove(new QuartoMove(2, 2, QuartoPiece.BBAA), true);
                await askTakeBack();
                componentTestUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('Should only propose to accept take back when opponent asked', fakeAsync(async() => {
                // given a board where opponent did not ask to take back and where both player could have ask
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

                // accepting take back should not be proposed
                componentTestUtils.expectElementNotToExist('#acceptTakeBackButton');
                await receiveRequest(Request.takeBackAsked(Player.ONE), 3);

                // then should allow it after proposing sent
                spyOn(partDAO, 'update').and.callThrough();
                await acceptTakeBack();

                // and then again not allowing it
                componentTestUtils.expectElementNotToExist('#acceptTakeBackButton');
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('Should only propose player to refuse take back when opponent asked', fakeAsync(async() => {
                // Given a board with previous move
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                componentTestUtils.expectElementNotToExist('#refuseTakeBackButton');
                await receiveRequest(Request.takeBackAsked(Player.ONE), 3);
                spyOn(partDAO, 'update').and.callThrough();

                // When refusing take back
                await refuseTakeBack();

                // Then a TakeBackRefused request should have been sent
                componentTestUtils.expectElementNotToExist('#refuseTakeBackButton');
                expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ZERO.value,
                    },
                    request: Request.takeBackRefused(Player.ZERO),
                });

                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('Should not allow player to play while take back request is waiting for him', fakeAsync(async() => {
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await receiveRequest(Request.takeBackAsked(Player.ONE), 3);

                spyOn(partDAO, 'update').and.callThrough();
                await doMove(THIRD_MOVE, true);
                expect(partDAO.update).not.toHaveBeenCalled();

                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('Should cancel take back request when take back requester do a move', fakeAsync(async() => {
                // given an initial board where a take back request has been done by user
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();

                // when doing move while waiting for answer
                spyOn(partDAO, 'update').and.callThrough();
                await doMove(THIRD_MOVE, true);

                // then update should remove request
                expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ZERO.value,
                    },
                    listMoves: [FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED, THIRD_MOVE_ENCODED],
                    turn: 3,
                    remainingMsForOne: 1799999,
                    request: null,
                    lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                });

                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('Should forbid player to ask take back again after refusal', fakeAsync(async() => {
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receiveRequest(Request.takeBackRefused(Player.ONE), 3);

                componentTestUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('should ignore take back accepted request before they have time included', fakeAsync(async() => {
                // Given an initial board where it's opponent's turn
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);

                await doMove(FIRST_MOVE, true);

                // when opponent accepts take back but lastMoveTime is not yet updated
                spyOn(wrapper, 'takeBackTo').and.callThrough();
                await receivePartDAOUpdate({
                    request: Request.takeBackAccepted(Player.ONE),
                    listMoves: [],
                    turn: 0,
                    remainingMsForZero: 179999,
                    lastMoveTime: null,
                }, 2);

                // then 'takeBackFor' should not be called
                expect(wrapper.takeBackTo).not.toHaveBeenCalled();
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
        });
        describe('Opponent given take back during his turn', () => {
            it('should move board back two turn and call restartCountDown', fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareStartedGameFor(USER_OPPONENT);
                tick(1);

                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 3);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(2);
                spyOn(wrapper, 'resetChronoFor').and.callThrough();

                // when accepting opponent's take back
                await acceptTakeBack();

                // Then turn should be changed to 0 and resumeCountDown be called
                const opponentTurnDiv: DebugElement = componentTestUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it(`should reset opponents chronos to what it was at pre-take-back turn beginning`, fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareStartedGameFor(USER_OPPONENT);
                tick(1);

                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 3);

                // when accepting opponent's take back
                spyOn(wrapper, 'resetChronoFor').and.callThrough();
                await acceptTakeBack();

                // Then opponents chrono should have been reset
                expect(wrapper.resetChronoFor).toHaveBeenCalledOnceWith(Player.ZERO);
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it(`Should send reduce opponent's remainingTime, since opponent just played`, fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareStartedGameFor(USER_OPPONENT);
                tick(1);

                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 3);

                // when accepting opponent's take back
                spyOn(partDAO, 'update').and.callThrough();
                await acceptTakeBack();

                // Then opponents take back request should have include remainingTime and lastTimeMove
                expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ONE.value,
                    },
                    request: Request.takeBackAccepted(Player.ONE),
                    listMoves: [],
                    turn: 0,
                    remainingMsForZero: 1799999,
                    remainingMsForOne: 1799999,
                    lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                });
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
        });
        describe('Opponent given take back during user turn', () => {
            it('should move board back one turn and call switchPlayer (for opponent)', fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareStartedGameFor(USER_OPPONENT);
                tick(1);

                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 2);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(1);
                spyOn(wrapper, 'switchPlayer').and.callThrough();

                // when accepting opponent's take back
                await acceptTakeBack();

                // Then turn should be changed to 0 and resumeCountDown be called
                const opponentTurnDiv: DebugElement = componentTestUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.switchPlayer).toHaveBeenCalledOnceWith();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it(`Should resumeCountDown for opponent and reset user's time`, fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareStartedGameFor(USER_OPPONENT);
                tick(1);

                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 2);

                // when accepting opponent's take back after some "thinking" time
                spyOn(wrapper, 'resumeCountDownFor').and.callThrough();
                spyOn(wrapper.chronoZeroGlobal, 'changeDuration').and.callThrough();
                spyOn(partDAO, 'update').and.callThrough();
                tick(73); // TODOTODO 73 le phoque
                const beginningTime: Time = wrapper.currentPart.doc.beginning as Time;
                const lastMoveTime: Time = wrapper.currentPart.doc.lastMoveTime as Time;
                const usedTimeOfFirstTurn: number = getMillisecondsDifference(beginningTime, lastMoveTime);
                const remainingMsForZero: number = (1800 * 1000) - usedTimeOfFirstTurn;
                await acceptTakeBack();

                // Then count down should be resumed for opponent and user shoud receive his decision time back
                expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    lastUpdate: {
                        index: 4,
                        player: Player.ONE.value,
                    },
                    turn: 0,
                    listMoves: [],
                    request: Request.takeBackAccepted(Player.ONE),
                    remainingMsForZero,
                    remainingMsForOne: 1800 * 1000,
                    lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                });
                expect(wrapper.chronoZeroGlobal.changeDuration).toHaveBeenCalledWith(remainingMsForZero);

                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
        });
        describe('User given take back during his turn', () => {
            it('should move board back two turn and call resetChronoFor', fakeAsync(async() => {
                // Given an initial board where it's user (second) turn, and user just asked for take back
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);

                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(2);
                spyOn(wrapper, 'resetChronoFor').and.callThrough();

                // when opponent accept user's take back
                await receivePartDAOUpdate({
                    ...BASE_TAKE_BACK_REQUEST,
                    remainingMsForOne: 1799999,
                }, 4);
                const opponentTurnDiv: DebugElement = componentTestUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('should reset user chronos to what it was at pre-take-back turn beginning', fakeAsync(async() => {
                // Given an initial board where it's user second turn, and user just asked for take back
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);

                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(2);

                // when opponent accept user's take back
                spyOn(wrapper, 'resetChronoFor').and.callThrough();
                await receivePartDAOUpdate({
                    ...BASE_TAKE_BACK_REQUEST,
                    remainingMsForOne: 1799999,
                }, 4);

                // Then user's chronos should start again to what they were at beginning
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('should do alternative move afterwards without taking back move time off (during his turn)', fakeAsync(async() => {
                // Given an initial board where user was autorised to take back
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                await receivePartDAOUpdate({
                    ...BASE_TAKE_BACK_REQUEST,
                    remainingMsForOne: 1799999,
                }, 4);

                // when playing alernative move
                spyOn(partDAO, 'update').and.callThrough();
                const ALTERNATIVE_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const ALTERNATIVE_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(ALTERNATIVE_MOVE);
                await doMove(ALTERNATIVE_MOVE, true);

                // Then partDAO should be updated without including remainingMsFor(any)
                expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    lastUpdate: {
                        index: 6,
                        player: Player.ZERO.value,
                    },
                    turn: 1,
                    listMoves: [ALTERNATIVE_MOVE_ENCODED],
                    request: null,
                    lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                });
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
        });
        describe('User given take back during opponent turn', () => {
            it('should move board back one turn and call switchPlayer (for creator)', fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);

                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(1);
                spyOn(wrapper, 'switchPlayer').and.callThrough();

                // when opponent accept user's take back
                await receivePartDAOUpdate(BASE_TAKE_BACK_REQUEST, 3);
                const opponentTurnDiv: DebugElement = componentTestUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.switchPlayer).toHaveBeenCalledOnceWith();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it(`should resumeCountDown for user without removing time of opponent`, fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);

                await doMove(FIRST_MOVE, true);
                spyOn(wrapper, 'resumeCountDownFor').and.callThrough();
                spyOn(partDAO, 'update').and.callThrough();
                await askTakeBack();

                // when opponent accept user's take back
                await receivePartDAOUpdate(BASE_TAKE_BACK_REQUEST, 4);

                // Then count down should be resumed and update not changing time
                expect(wrapper.resumeCountDownFor).toHaveBeenCalledWith(Player.ZERO);
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
            it('should do alternative move afterwards without taking back move time off (during opponent turn)', fakeAsync(async() => {
                // Given an initial board where opponent just took back the a move
                await prepareStartedGameFor(USER_CREATOR);
                tick(1);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receivePartDAOUpdate(BASE_TAKE_BACK_REQUEST, 3);

                // when playing alernative move
                spyOn(partDAO, 'update').and.callThrough();
                const ALTERNATIVE_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const ALTERNATIVE_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(ALTERNATIVE_MOVE);
                await doMove(ALTERNATIVE_MOVE, true);

                // Then partDAO should be updated without including remainingMsFor(any)
                expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ZERO.value,
                    },
                    turn: 1,
                    listMoves: [ALTERNATIVE_MOVE_ENCODED],
                    request: null,
                    lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                });
                tick(wrapper.joiner.maximalMoveDuration * 1000);
            }));
        });
    });
    describe('Agreed Draw', () => {
        async function setup() {
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();
        }
        it('should send draw request when player asks to', fakeAsync(async() => {
            // Given any board
            await setup();
            spyOn(partDAO, 'update').and.callThrough();

            // When clicking the propose draw button
            await componentTestUtils.clickElement('#proposeDrawButton');

            // Then a request of draw proposition should have been sent
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                lastUpdate: {
                    index: 2,
                    player: Player.ZERO.value,
                },
                request: Request.drawProposed(Player.ZERO),
            });
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should forbid to propose to draw while draw request is waiting', fakeAsync(async() => {
            await setup();
            await componentTestUtils.clickElement('#proposeDrawButton');
            componentTestUtils.expectElementNotToExist('#proposeDrawButton');

            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should forbid to propose to draw after refusal', fakeAsync(async() => {
            await setup();
            await componentTestUtils.clickElement('#proposeDrawButton');
            await receiveRequest(Request.drawRefused(Player.ONE), 1);

            tick(1);
            componentTestUtils.expectElementNotToExist('#proposeDrawButton');

            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should finish the game after accepting a proposed draw', fakeAsync(async() => {
            // Given a part on which a draw has been proposed
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE), 1);
            spyOn(partDAO, 'update').and.callThrough();

            // When accepting the drawn
            await componentTestUtils.clickElement('#acceptDrawButton');
            tick(1);

            // Then a request indicating game is an agreed draw should be sent
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                lastUpdate: {
                    index: 3,
                    player: Player.ZERO.value,
                },
                result: MGPResult.AGREED_DRAW_BY_ZERO.value,
                request: null,
            });
            componentTestUtils.expectElementToExist('#youAgreedToDrawIndicator');
            expectGameToBeOver();
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should finish the game when opponent accepts our proposed draw', fakeAsync(async() => {
            // given a gameComponent where draw has been proposed
            await setup();
            await componentTestUtils.clickElement('#proposeDrawButton');

            // when draw is accepted
            spyOn(partDAO, 'update').and.callThrough();
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
                request: null,
            }, 3);

            // then game should be over
            expectGameToBeOver();
            componentTestUtils.expectElementToExist('#yourOpponentAgreedToDrawIndicator');
            expect(partDAO.update).toHaveBeenCalledTimes(1);
        }));
        it('should send refusal when player asks to', fakeAsync(async() => {
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE), 1);

            spyOn(partDAO, 'update').and.callThrough();

            await componentTestUtils.clickElement('#refuseDrawButton');
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                lastUpdate: {
                    index: 3,
                    player: Player.ZERO.value,
                },
                request: Request.drawRefused(Player.ZERO),
            });

            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should only propose to accept/refuse draw when asked', fakeAsync(async() => {
            await setup();
            componentTestUtils.expectElementNotToExist('#acceptDrawButton');
            componentTestUtils.expectElementNotToExist('#refuseDrawButton');
            await receiveRequest(Request.drawProposed(Player.ONE), 1);

            componentTestUtils.expectElementToExist('#acceptDrawButton');
            componentTestUtils.expectElementToExist('#refuseDrawButton');

            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
    });
    describe('End Game Time Management', () => {
        it(`should stop player's global chrono when local reach end`, fakeAsync(async() => {
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroGlobal, 'stop').and.callThrough();
            tick(wrapper.joiner.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(0);
            expect(wrapper.chronoZeroGlobal.stop).toHaveBeenCalled();
        }));
        it(`should stop player's local chrono when global chrono reach end`, fakeAsync(async() => {
            await prepareStartedGameFor(USER_CREATOR, true);
            tick(1);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroTurn, 'stop').and.callThrough();
            tick(wrapper.joiner.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(0);
            expect(wrapper.chronoZeroTurn.stop).toHaveBeenCalled();
        }));
        it(`should stop offline opponent's global chrono when local reach end`, fakeAsync(async() => {
            // given an online game where it's the opponent's turn
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();

            // when he reach time out
            tick(wrapper.joiner.maximalMoveDuration * 1000);

            // then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalled();
        }));
        it(`should stop offline opponent's local chrono when global chrono reach end`, fakeAsync(async() => {
            // given an online game where it's the opponent's turn
            await prepareStartedGameFor(USER_CREATOR, true);
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneTurn, 'stop').and.callThrough();

            // when he reach time out
            tick(wrapper.joiner.maximalMoveDuration * 1000); // TODO: maximalPartDuration, for this one!!

            // then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(wrapper.chronoOneTurn.stop).toHaveBeenCalled();
        }));
        it(`should not notifyTimeout for online opponent`, fakeAsync(async() => {
            // given an online game where it's the opponent's; opponent is online
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            spyOn(wrapper, 'notifyTimeoutVictory').and.callThrough();

            // when he reach time out
            tick(wrapper.joiner.maximalMoveDuration * 1000);

            // then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
            expect(wrapper.notifyTimeoutVictory).not.toHaveBeenCalled();
        }));
        it(`should notifyTimeout for offline opponent`, fakeAsync(async() => {
            // given an online game where it's the opponent's; opponent is online
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            spyOn(wrapper, 'notifyTimeoutVictory').and.callThrough();
            spyOn(wrapper, 'opponentIsOffline').and.returnValue(true);

            // when he reach time out
            tick(wrapper.joiner.maximalMoveDuration * 1000);

            // then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalled();
            expect(wrapper.notifyTimeoutVictory).toHaveBeenCalled();
        }));
        it(`should send opponent his remainingTime after first move`, fakeAsync(async() => {
            // given a board where a first move has been made
            await prepareStartedGameFor(USER_OPPONENT);
            tick(1);
            await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
            const beginning: Time = wrapper.currentPart.doc.beginning as Time;
            const firstMoveTime: Time = wrapper.currentPart.doc.lastMoveTime as Time;
            const msUsedForFirstMove: number = getMillisecondsDifference(beginning, firstMoveTime);

            // when doing the next move
            expect(wrapper.currentPart.doc.remainingMsForZero).toEqual(1800 * 1000);
            await doMove(SECOND_MOVE, true);

            // then the update sent should have calculated time between creation and first move
            // and should have removed it from remainingMsForZero
            const remainingMsForZero: number = (1800 * 1000) - msUsedForFirstMove;
            expect(wrapper.currentPart.doc.remainingMsForZero)
                .withContext(`Should have sent the opponent its updated remainingTime`)
                .toEqual(remainingMsForZero);
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should update chrono when receiving your remainingTime in the update', fakeAsync(async() => {
            // given a board where a first move has been made
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            spyOn(wrapper.chronoZeroGlobal, 'changeDuration').and.callThrough();
            await doMove(FIRST_MOVE, true);
            expect(wrapper.currentPart.doc.remainingMsForZero).toEqual(1800 * 1000);

            // when receiving new move
            await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

            // then the global chrono of update-player should be updated
            expect(wrapper.chronoZeroGlobal.changeDuration)
                .withContext(`Chrono.ChangeDuration should have been refreshed with update's datas`)
                .toHaveBeenCalledWith(Utils.getNonNullable(wrapper.currentPart.doc.remainingMsForZero));
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('when resigning, lastMoveTime must be upToDate then remainingMs');
        it('when winning move is done, remainingMs at last turn of opponent must be');
    });
    describe('AddTime functionnalities', () => {
        it('should allow to add local time to opponent', fakeAsync(async() => {
            // Given an onlineGameComponent
            await prepareStartedGameFor(USER_CREATOR);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            // when local countDownComponent emit addTime
            await wrapper.addTurnTime();

            // then some kind of addTurnTimeTo(player) should be sent
            expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                lastUpdate: {
                    index: 2,
                    player: Player.ZERO.value,
                },
                request: Request.turnTimeAdded(Player.ONE),
            });
            const msUntilTimeout: number = (wrapper.joiner.maximalMoveDuration + 30) * 1000;
            tick(msUntilTimeout);
        }));
        it('should resume for both chrono at once when adding time to one', fakeAsync(async() => {
            // Given an onlineGameComponent
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
            spyOn(wrapper.chronoZeroTurn, 'resume').and.callThrough();

            // when receiving a request to add local time to player zero
            await receiveRequest(Request.turnTimeAdded(Player.ZERO), 1);

            // then both chrono of player zero should have been resumed
            expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledTimes(1); // he failed, was 0
            expect(wrapper.chronoZeroTurn.resume).toHaveBeenCalledTimes(1); // he worked
            const msUntilTimeout: number = (wrapper.joiner.maximalMoveDuration + 30) * 1000;
            tick(msUntilTimeout);
        }));
        it('should add time to chrono local when receiving the addTurnTime request (Player.ONE)', fakeAsync(async() => {
            // Given an onlineGameComponent
            await prepareStartedGameFor(USER_CREATOR);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            // when receiving addTurnTime request
            await receiveRequest(Request.turnTimeAdded(Player.ONE), 1);

            // then chrono local of player one should be filled
            const wrapper: OnlineGameWrapperComponent = componentTestUtils.wrapper as OnlineGameWrapperComponent;
            const msUntilTimeout: number = (wrapper.joiner.maximalMoveDuration + 30) * 1000;
            expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes + 30 sec
            tick(msUntilTimeout);
        }));
        it('should add time to local chrono when receiving the addTurnTime request (Player.ZERO)', fakeAsync(async() => {
            // Given an onlineGameComponent on user turn
            await prepareStartedGameFor(USER_CREATOR);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            // when receiving addTurnTime request
            await receiveRequest(Request.turnTimeAdded(Player.ZERO), 1);
            // componentTestUtils.detectChanges(); // TODOTODO will we need this

            // then chrono local of player one should be filled
            const wrapper: OnlineGameWrapperComponent = componentTestUtils.wrapper as OnlineGameWrapperComponent;
            const msUntilTimeout: number = (wrapper.joiner.maximalMoveDuration + 30) * 1000;
            expect(wrapper.chronoZeroTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes + 30 sec
            tick(msUntilTimeout);
        }));
        it('should allow to add global time to opponent (as Player.ZERO)', fakeAsync(async() => {
            // Given an onlineGameComponent on user's turn
            await prepareStartedGameFor(USER_CREATOR);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            // when countDownComponent emit addGlobalTime
            await wrapper.addGlobalTime();

            // then a request to add global time to player one should be send
            expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                lastUpdate: {
                    index: 2,
                    player: Player.ZERO.value,
                },
                request: Request.globalTimeAdded(Player.ONE),
                remainingMsForOne: (1800 * 1000) + (5 * 60 * 1000),
            });
            const msUntilTimeout: number = wrapper.joiner.maximalMoveDuration * 1000;
            expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes
            tick(msUntilTimeout);
        }));
        it('should allow to add global time to opponent (as Player.ONE)', fakeAsync(async() => {
            // Given an onlineGameComponent on opponent's turn
            await prepareStartedGameFor(USER_OPPONENT);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            // when countDownComponent emit addGlobalTime
            await wrapper.addGlobalTime();

            // then a request to add global time to player zero should be send
            expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                lastUpdate: {
                    index: 2,
                    player: Player.ONE.value,
                },
                request: Request.globalTimeAdded(Player.ZERO),
                remainingMsForZero: (1800 * 1000) + (5 * 60 * 1000),
            });
            const msUntilTimeout: number = wrapper.joiner.maximalMoveDuration * 1000;
            expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes
            tick(msUntilTimeout);
        }));
        it('should add time to global chrono when receiving the addGlobalTime request (Player.ONE)', fakeAsync(async() => {
            // Given an onlineGameComponent on user's turn
            await prepareStartedGameFor(USER_CREATOR);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            // when receiving addGlobalTime request
            await receiveRequest(Request.globalTimeAdded(Player.ONE), 1);

            // then chrono global of player one should be filled with 5 new minutes
            const wrapper: OnlineGameWrapperComponent = componentTestUtils.wrapper as OnlineGameWrapperComponent;
            expect(wrapper.chronoOneGlobal.remainingMs).toBe((30 * 60 * 1000) + (5 * 60 * 1000));
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should add time to global chrono when receiving the addGlobalTime request (Player.ZERO)', fakeAsync(async() => {
            // Given an onlineGameComponent
            await prepareStartedGameFor(USER_CREATOR);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            // when receiving addGlobalTime request
            await receiveRequest(Request.globalTimeAdded(Player.ZERO), 1);

            // then chrono global of player one should be filled with 5 new minutes
            const wrapper: OnlineGameWrapperComponent = componentTestUtils.wrapper as OnlineGameWrapperComponent;
            expect(wrapper.chronoZeroGlobal.remainingMs).toBe((30 * 60 * 1000) + (5 * 60 * 1000));
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should postpone the timeout of chrono and not only change displayed time', fakeAsync(async() => {
            // Given an onlineGameComponent
            await prepareStartedGameFor(USER_CREATOR);
            spyOn(partDAO, 'update').and.callThrough();
            tick(1);

            await receiveRequest(Request.turnTimeAdded(Player.ZERO), 1);
            componentTestUtils.detectChanges();

            // then endgame should happend later
            tick(wrapper.joiner.maximalMoveDuration * 1000);
            expect(componentTestUtils.wrapper.endGame).withContext('game should not be finished yet').toBeFalse();
            tick(30 * 1000);
            expectGameToBeOver();
        }));
    });
    describe('User "handshake"', () => {
        it(`Should make opponent's name lightgrey when he is absent`, fakeAsync(async() => {
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            expect(wrapper.getPlayerNameClass(1)).toEqual('has-text-black');
            userDAO.update('firstCandidateDocId', { state: 'offline' });
            componentTestUtils.detectChanges();
            tick();
            expect(wrapper.getPlayerNameClass(1)).toBe('has-text-grey-light');
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
    });
    describe('Resign', () => {
        it('should end game after clicking on resign button', fakeAsync(async() => {
            // Given an online game component
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            await doMove(FIRST_MOVE, true);

            // when clicking on resign button
            spyOn(partDAO, 'update').and.callThrough();
            await componentTestUtils.clickElement('#resignButton');

            // then the game should be ended
            expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                lastUpdate: {
                    index: 3,
                    player: Player.ZERO.value,
                },
                winner: 'firstCandidate',
                loser: 'creator',
                request: null,
                result: MGPResult.RESIGN.value,
            });
            expectGameToBeOver();
        }));
        it('Should not allow player to move after resigning', fakeAsync(async() => {
            // Given a component where user has resigned
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
            await componentTestUtils.clickElement('#resignButton');

            // when attempting a move
            spyOn(partDAO, 'update').and.callThrough();
            await doMove(SECOND_MOVE, false);

            // then it should be refused
            expect(partDAO.update).not.toHaveBeenCalled();
            expectGameToBeOver();
        }));
        it('Should display when the opponent resigned', fakeAsync(async() => {
            // Given a board where user has resign
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
            await receivePartDAOUpdate({
                winner: 'creator',
                loser: 'firstCandidate',
                result: MGPResult.RESIGN.value,
                request: null,
            }, 3);

            // when checking "victory text"
            const resignText: string = componentTestUtils.findElement('#resignIndicator').nativeElement.innerText;

            // then we should see "opponent has resign"
            expect(resignText).toBe(`firstCandidate has resigned.`);
            expectGameToBeOver();
        }));
    });
    describe('getUpdateType', () => {
        it('Move + Time_updated + Request_removed = UpdateType.MOVE', fakeAsync(async() => {
            // Given a part with lastMoveTime set and a take back just accepted
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 3,
                listMoves: [1, 2, 3],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 333, nanoseconds: 333000000 },
                request: Request.takeBackAccepted(Player.ZERO),
            });

            // When making a move changing: turn, listMove and lastMoveTime
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 4,
                listMoves: [1, 2, 3, 4],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 444, nanoseconds: 444000000 },
                // And obviously, no longer the previous request code
            });

            // Then the update should be detected as a Move
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('First Move + Time_added + Score_added = UpdateType.MOVE', fakeAsync(async() => {
            // Given a part where no move has been done
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 1,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 0,
                listMoves: [],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
            });

            // When doing the first move update (turn, listMove) add (scores, lastMoveTime)
            const update: Part = new Part({
                lastUpdate: {
                    index: 2,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                // And obviously, the added score and time
                scorePlayerZero: 0,
                scorePlayerOne: 0,
                lastMoveTime: { seconds: 1111, nanoseconds: 111000000 },
            });

            // Then the update should be seen as a move
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('First Move After Tack Back + Time_modified = UpdateType.MOVE', fakeAsync(async() => {
            // Given a "second" first move
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 0,
                listMoves: [],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 1111, nanoseconds: 111000000 },
            });

            // When doing a move again, modifying (turn, listMoves, lasMoveTime)
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                // And obviously, the modified time
                lastMoveTime: { seconds: 2222, nanoseconds: 222000000 },
            });

            // Then the update should be seen as a Move
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('Move + Time_modified + Score_modified = UpdateType.MOVE', fakeAsync(async() => {
            // Gvien a part with present scores
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 1111, nanoseconds: 111000000 },
                scorePlayerZero: 1,
                scorePlayerOne: 1,
            });

            // When doing an update modifying the score (turn, listMoves, scores, lastMoveTime)
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 2,
                listMoves: [1, 2],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 2222, nanoseconds: 222000000 },
                scorePlayerZero: 1,
                // And obviously, the score update and time added
                scorePlayerOne: 4,
            });

            // Then the update should be seen as a move
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('Move + Time_removed + Score_added = UpdateType.MOVE_WITHOUT_TIME', fakeAsync(async() => {
            // Given a part without score yet
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 1111, nanoseconds: 111000000 },
            });

            // When doing a move creating score but removing lastMoveTime
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 2,
                listMoves: [1, 2],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                // And obviously, the added score
                scorePlayerZero: 0,
                scorePlayerOne: 0,
                // of course, no more lastMoveTime
            });

            // Then the update should be recognised as a move without time
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE_WITHOUT_TIME);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('Move + Time_removed + Score_modified = UpdateType.MOVE_WITHOUT_TIME', fakeAsync(async() => {
            // Given a part with scores
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 1111, nanoseconds: 111000000 },
                scorePlayerZero: 1,
                scorePlayerOne: 1,
            });

            // When updating part with a move, score, but removing time
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 2,
                listMoves: [1, 2],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                scorePlayerZero: 1,
                // lastMoveTime is removed
                scorePlayerOne: 4, // modified
            });

            // Then the update should be seen as a move without time
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE_WITHOUT_TIME);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('AcceptTakeBack + Time_removed = UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME', fakeAsync(async() => {
            // Given a part where take back as been requested
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 125, nanoseconds: 456000000 },
                request: Request.takeBackAsked(Player.ZERO),
            });

            // When accepting it, without sending time update
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                // but
                request: Request.takeBackAccepted(Player.ONE),
                // and no longer lastMoveTime
            });

            // Then the update should be seen as a ACCEPT_TAKE_BACK_WITHOUT_TIME
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('AcceptTakeBack + Time_updated = UpdateType.REQUEST', fakeAsync(async() => {
            // Given a board with take back asked
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 125, nanoseconds: 456000000 },
                request: Request.takeBackAsked(Player.ZERO),
            });

            // When accepting it and updating lastMoveTime
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                // but
                lastMoveTime: { seconds: 127, nanoseconds: 456000000 },
                request: Request.takeBackAccepted(Player.ONE),
            });

            // Then the update should be seen as a request
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.REQUEST);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
        it('Request.TurnTimeAdded + one remainingMs modified = UpdateType.REQUEST', fakeAsync(async() => {
            // Given a part with take back asked
            await prepareStartedGameFor(USER_CREATOR);
            wrapper.currentPart = new Part({
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastMoveTime: { seconds: 125, nanoseconds: 456000000 },
                request: Request.takeBackAsked(Player.ZERO),
            });

            // When time added, and remaining time updated
            const update: Part = new Part({
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                // but
                request: Request.globalTimeAdded(Player.ZERO),
                remainingMsForZero: (1800 * 1000) + (5 * 60 * 1000),
            });

            // Then the update should be seen as a request
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.REQUEST);
            tick(wrapper.joiner.maximalMoveDuration * 1000 + 1);
        }));
    });
    describe('rematch', () => {
        it('should show propose button only when game is ended', fakeAsync(async() => {
            // given a game that is not finished
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();
            componentTestUtils.expectElementNotToExist('#proposeRematchButton');

            // when it is finished
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);

            // then it should allow to propose rematch
            componentTestUtils.expectElementToExist('#proposeRematchButton');
        }));
        it('should sent proposal request when proposing', fakeAsync(async() => {
            const gameService: GameService = TestBed.inject(GameService);
            // given an ended game
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);

            // when the propose rematch button is clicked
            spyOn(gameService, 'proposeRematch').and.callThrough();
            await componentTestUtils.expectInterfaceClickSuccess('#proposeRematchButton');

            // then the gameService must be called
            expect(gameService.proposeRematch).toHaveBeenCalledOnceWith('joinerId', 2, Player.ZERO);
        }));
        it('should show accept/refuse button when proposition has been sent', fakeAsync(async() => {
            // given an ended game
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);

            // when request is received
            componentTestUtils.expectElementNotToExist('#acceptRematchButton');
            await receiveRequest(Request.rematchProposed(Player.ONE), 2);

            // then accept/refuse buttons must be shown
            componentTestUtils.expectElementToExist('#acceptRematchButton');
        }));
        it('should sent accepting request when user accept rematch', fakeAsync(async() => {
            const gameService: GameService = TestBed.inject(GameService);
            // give a part with rematch request send by opponent
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);
            await receiveRequest(Request.rematchProposed(Player.ONE), 2);

            // when accepting it
            spyOn(gameService, 'acceptRematch').and.callThrough();
            await componentTestUtils.expectInterfaceClickSuccess('#acceptRematchButton');

            // then it should have called acceptRematch
            expect(gameService.acceptRematch).toHaveBeenCalledTimes(1);
        }));
        it('should redirect to new part when rematch is accepted', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            // given a part lost with rematch request send by user
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);
            await componentTestUtils.expectInterfaceClickSuccess('#proposeRematchButton');

            // when opponent accept it
            spyOn(router, 'navigate');
            await receiveRequest(Request.rematchAccepted('Quarto', 'nextPartId'), 3);

            // then it should redirect to new part
            const first: string = '/nextGameLoading';
            const second: string = '/play/Quarto/nextPartId';
            expect(router.navigate).toHaveBeenCalledWith([first]);
            expect(router.navigate).toHaveBeenCalledWith([second]);
        }));
    });
    describe('Non Player Experience', () => {
        it('Should not be able to do anything', fakeAsync(async() => {
            await prepareStartedGameFor(new AuthUser(MGPOptional.ofNullable(OBSERVER.username),
                                                     MGPOptional.of('observer@home'),
                                                     true));
            spyOn(componentTestUtils.wrapper as OnlineGameWrapperComponent, 'startCountDownFor').and.callFake(() => null);

            const forbiddenFunctionNames: string[] = [
                'canProposeDraw',
                'canAskTakeBack',
                'acceptRematch',
                'proposeRematch',
                'canResign',
            ];
            for (const name of forbiddenFunctionNames) {
                expect(wrapper[name]()).toBeFalse();
            }
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should display that the game is a draw', fakeAsync(async() => {
            // Given a part that the two player agreed to draw
            await prepareStartedGameFor(new AuthUser(MGPOptional.ofNullable(OBSERVER.username),
                                                     MGPOptional.of('observer@home'),
                                                     true));
            spyOn(componentTestUtils.wrapper as OnlineGameWrapperComponent, 'startCountDownFor').and.callFake(() => null);
            await receiveRequest(Request.drawProposed(Player.ONE), 1);
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ZERO.value,
                request: null,
            }, 2);

            // When displaying the board
            // Then the text should indicate player have agreed to draw
            componentTestUtils.expectElementToExist('#playersAgreedToDraw');
            expectGameToBeOver();
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
    });
    describe('Visuals', () => {
        it('should highlight each player name in their respective color', fakeAsync(async() => {
            // given a game that has been started
            await prepareStartedGameFor(USER_CREATOR);

            // when the game is displayed
            tick(1);
            componentTestUtils.detectChanges();

            // then it should highlight the player's names
            componentTestUtils.expectElementToHaveClass('#playerZeroIndicator', 'player0-bg');
            componentTestUtils.expectElementToHaveClass('#playerOneIndicator', 'player1-bg');
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should highlight the board with the color of the player when it is their turn', fakeAsync(async() => {
            // given a game that has been started
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();

            // when it is the current player's turn

            // then it should highlight the board with its color
            componentTestUtils.expectElementToHaveClass('#board-tile', 'player0-bg');
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should highlight the board in grey when game is over', fakeAsync(async() => {
            // given a game that has been started
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);
            componentTestUtils.detectChanges();

            // when the game is over
            await componentTestUtils.clickElement('#resignButton');

            // then it should highlight the board with its color
            componentTestUtils.expectElementToHaveClass('#board-tile', 'endgame-bg');
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
        it('should not highlight the board when it is the turn of the opponent', fakeAsync(async() => {
            // given a game that has been started
            await prepareStartedGameFor(USER_CREATOR);
            tick(1);

            // when it is not the current player's turn
            await doMove(FIRST_MOVE, true);
            componentTestUtils.detectChanges();

            // then it should not highlight the board
            componentTestUtils.expectElementNotToHaveClass('#board-tile', 'player1-bg');
            tick(wrapper.joiner.maximalMoveDuration * 1000);
        }));
    });
});

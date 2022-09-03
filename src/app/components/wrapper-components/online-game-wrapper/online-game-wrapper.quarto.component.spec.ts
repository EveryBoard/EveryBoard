/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

import { OnlineGameWrapperComponent, UpdateType } from './online-game-wrapper.component';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { ConfigRoom, PartStatus } from 'src/app/domain/ConfigRoom';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { UserDAO } from 'src/app/dao/UserDAO';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { Request } from 'src/app/domain/Request';
import { MGPResult, Part, PartDocument } from 'src/app/domain/Part';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { FocussedPart, User } from 'src/app/domain/User';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { AuthUser, ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { FirestoreTime } from 'src/app/domain/Time';
import { getMillisecondsDifference } from 'src/app/utils/TimeUtils';
import { GameWrapperMessages } from '../GameWrapper';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Utils } from 'src/app/utils/utils';
import { GameService } from 'src/app/services/GameService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NextGameLoadingComponent } from '../../normal-component/next-game-loading/next-game-loading.component';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { GameStatus } from 'src/app/jscaip/Rules';
import { PartCreationComponent } from '../part-creation/part-creation.component';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ChatService } from 'src/app/services/ChatService';

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

    let testUtils: ComponentTestUtils<QuartoComponent, MinimalUser>;

    let wrapper: OnlineGameWrapperComponent;

    let configRoomDAO: ConfigRoomDAO;
    let partDAO: PartDAO;
    let userDAO: UserDAO;

    const OBSERVER: User = {
        username: 'jeanJaja',
        lastUpdateTime: new Timestamp(Date.now() / 1000, Date.now() % 1000),
        state: 'online',
        verified: true,
    };
    const USER_OBSERVER: AuthUser = new AuthUser('obs3rv3eDu8012',
                                                 MGPOptional.ofNullable(OBSERVER.username),
                                                 MGPOptional.of('observer@home'),
                                                 true);
    const FAKE_MOMENT: Timestamp = new Timestamp(123, 456000000);

    const BASE_TAKE_BACK_REQUEST: Partial<Part> = {
        request: Request.takeBackAccepted(Player.ONE),
        listMoves: [],
        turn: 0,
        lastUpdateTime: FAKE_MOMENT,
    };
    let observerRole: PlayerOrNone;

    async function prepareMockDBContent(initialConfigRoom: ConfigRoom): Promise<void> {
        partDAO = TestBed.inject(PartDAO);
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
        userDAO = TestBed.inject(UserDAO);
        await configRoomDAO.set('configRoomId', initialConfigRoom);
        await partDAO.set('configRoomId', PartMocks.INITIAL);
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        await userDAO.set(USER_OBSERVER.id, OBSERVER);
        spyOn(TestBed.inject(ChatService), 'startObserving').and.resolveTo();
        spyOn(TestBed.inject(ChatService), 'stopObserving').and.resolveTo();
        return Promise.resolve();
    }
    async function prepareWrapper(user: AuthUser): Promise<void> {
        testUtils = await ComponentTestUtils.basic('Quarto');
        await prepareMockDBContent(ConfigRoomMocks.INITIAL);
        ConnectedUserServiceMock.setUser(user);
    }
    async function prepareStartedGameFor(user: AuthUser,
                                         shorterGlobalChrono: boolean = false,
                                         waitForPartToStart: boolean = true)
    : Promise<void>
    {
        await prepareWrapper(user);

        if (user.id === UserMocks.CREATOR_AUTH_USER.id) {
            observerRole = Player.ZERO;
        } else if (user.id === UserMocks.OPPONENT_AUTH_USER.id) {
            observerRole = Player.ONE;
        } else {
            observerRole = PlayerOrNone.NONE;
        }
        testUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = testUtils.wrapper as OnlineGameWrapperComponent;
        testUtils.detectChanges();
        tick(1);

        const partCreationId: DebugElement = testUtils.findElement('#partCreation');
        let context: string = 'partCreation id should be present after ngOnInit';
        expect(partCreationId).withContext(context).toBeTruthy();
        context = 'partCreation field should also be present';
        expect(wrapper.partCreation).withContext(context).toBeTruthy();
        await configRoomDAO.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
        testUtils.detectChanges();
        await configRoomDAO.update('configRoomId', ConfigRoomMocks.WITH_CHOSEN_OPPONENT);
        // TODO: replace by a click on the component to really simulate it "end2end"
        testUtils.detectChanges();
        if (observerRole === Player.ZERO) { // Creator
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                id: 'configRoomId',
                role: 'Player',
                typeGame: 'P4',
                opponent: UserMocks.OPPONENT_MINIMAL_USER,
            }));
            await wrapper.partCreation.proposeConfig();
        } else if (observerRole === Player.ONE) { // Opponent
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                id: 'configRoomId',
                role: 'Player',
                typeGame: 'P4',
                opponent: UserMocks.CREATOR_MINIMAL_USER,
            }));
            await configRoomDAO.update('configRoomId', ConfigRoomMocks.WITH_PROPOSED_CONFIG);
        } else { // Observer
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
                id: 'configRoomId',
                role: 'Observer',
                typeGame: 'P4',
            }));
        }
        testUtils.detectChanges();
        if (shorterGlobalChrono === true) {
            await configRoomDAO.update('configRoomId', {
                partStatus: PartStatus.PART_STARTED.value,
                totalPartDuration: 10,
            });
        } else {
            await configRoomDAO.update('configRoomId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }
        const update: Partial<Part> = {
            playerOne: UserMocks.OPPONENT_MINIMAL_USER,
            turn: 0,
            remainingMsForZero: 1800 * 1000,
            remainingMsForOne: 1800 * 1000,
            beginning: serverTimestamp(),
        };
        const observerRoleAsPlayer: Player = observerRole === PlayerOrNone.NONE ? Player.ZERO : observerRole as Player;
        await partDAO.updateAndBumpIndex('configRoomId', observerRoleAsPlayer, 0, update);
        testUtils.detectChanges();
        if (waitForPartToStart === true) {
            tick(1);
            testUtils.detectChanges();
            testUtils.bindGameComponent();
            testUtils.prepareSpies();
        }
        return Promise.resolve();
    }
    async function prepareStartedGameWithMoves(encodedMoves: number[]): Promise<void> {
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, false, false);
        await receiveNewMoves(encodedMoves, 2, 1799999, 1800 * 1000);
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
        const message: string = 'move ' + move.toString() + ' should be legal but failed because: ' + result.reason;
        expect(result.isSuccess()).withContext(message).toEqual(legal);
        testUtils.detectChanges();
        tick(1);
        return result;
    }
    async function receiveRequest(request: Request, lastIndex: number): Promise<void> {
        await receivePartDAOUpdate({ request }, lastIndex);
    }
    async function receivePartDAOUpdate(update: Partial<Part>, lastIndex: number): Promise<void> {
        const observerRoleAsPlayer: Player = observerRole === PlayerOrNone.NONE ? Player.ZERO : observerRole as Player;
        await partDAO.updateAndBumpIndex('configRoomId', observerRoleAsPlayer, lastIndex, update);
        testUtils.detectChanges();
        tick(1);
    }
    async function askTakeBack(): Promise<void> {
        return await testUtils.clickElement('#askTakeBackButton');
    }
    async function acceptTakeBack(): Promise<void> {
        return await testUtils.clickElement('#acceptTakeBackButton');
    }
    async function refuseTakeBack(): Promise<void> {
        return await testUtils.clickElement('#refuseTakeBackButton');
    }
    async function receiveNewMoves(moves: number[],
                                   lastIndex: number,
                                   remainingMsForZero: number,
                                   remainingMsForOne: number)
    : Promise<void>
    {
        const update: Partial<Part> = {
            listMoves: ArrayUtils.copyImmutableArray(moves),
            turn: moves.length,
            request: null,
            remainingMsForOne,
            remainingMsForZero, // TODO: only send one of the two time updated, since that's what happens
            lastUpdateTime: serverTimestamp(),
        };
        return await receivePartDAOUpdate(update, lastIndex);
    }
    async function prepareBoard(moves: QuartoMove[], player: Player = Player.ZERO): Promise<void> {
        let authUser: AuthUser;
        if (player === Player.ONE) {
            authUser = UserMocks.OPPONENT_AUTH_USER;
        } else {
            authUser = UserMocks.CREATOR_AUTH_USER;
        }
        await prepareStartedGameFor(authUser);
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
    it('should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        spyOn(wrapper, 'reachedOutOfTime').and.callFake(async() => {});
        // Should not even been called but:
        // reachedOutOfTime is called (in test) after tick(1) even though there is still remainingTime
        expect(wrapper.currentPart.data.listMoves).toEqual([]);
        expect(wrapper.currentPart.data.listMoves).toEqual([]);
        expect(wrapper.currentPlayer.name).toEqual('creator');
        wrapper.pauseCountDownsFor(Player.ZERO);
    }));
    it('Should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        // Given an online game being created
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, false, false);
        const partCreationId: DebugElement = testUtils.findElement('#partCreation');
        let quartoTag: DebugElement = testUtils.querySelector('app-quarto');
        expect(partCreationId)
            .withContext('partCreation id should be absent after config accepted')
            .toBeFalsy();
        expect(quartoTag)
            .withContext('quarto tag should be absent before config accepted and async ms finished')
            .toBeFalsy();
        expect(wrapper.partCreation)
            .withContext('partCreation field should be absent after config accepted')
            .toBeFalsy();
        expect(testUtils.getComponent())
            .withContext('gameComponent field should be absent after config accepted and async ms finished')
            .toBeFalsy();

        // When the component initializes
        tick(1);
        testUtils.detectChanges();

        // Then the game component should become present in the component
        quartoTag = testUtils.querySelector('app-quarto');
        expect(quartoTag)
            .withContext('quarto tag should be present after config accepted and async millisec finished')
            .toBeTruthy();
        expect(wrapper.gameComponent)
            .withContext('gameComponent field should also be present after config accepted and async millisec finished')
            .toBeTruthy();
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        await doMove(FIRST_MOVE, true);

        expect(wrapper.currentPart.data.listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(wrapper.currentPart.data.turn).toEqual(1);

        // Receive second move
        const remainingMsForZero: number = Utils.getNonNullable(wrapper.currentPart.data.remainingMsForZero);
        const remainingMsForOne: number = Utils.getNonNullable(wrapper.currentPart.data.remainingMsForOne);
        await receiveNewMoves([FIRST_MOVE_ENCODED, 166], 2, remainingMsForZero, remainingMsForOne);

        expect(wrapper.currentPart.data.turn).toEqual(2);
        expect(wrapper.currentPart.data.listMoves).toEqual([FIRST_MOVE_ENCODED, 166]);
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    describe('Late Arrival', () => {
        it('Should allow user to arrive late on the game', fakeAsync(async() => {
            // Given a part that has already started (moves have been done)
            await prepareStartedGameWithMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED]);

            // When arriving and playing
            tick(1);

            // Then the new move should be done
            expect(testUtils.wrapper.gameComponent.getState().turn).toBe(2);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('Should allow user to arrive late on the game (not on his turn)', fakeAsync(async() => {
            // Given a part that has already started (moves have been done)
            await prepareStartedGameWithMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED, THIRD_MOVE_ENCODED]);

            // When arriving and playing
            tick(1);

            // Then the new move should be done
            expect(testUtils.wrapper.gameComponent.getState().turn).toBe(3);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    describe('Component initialisation', () => {
        it('should mark creator as Player when arriving', fakeAsync(async() => {
            // Given a part that as not initialised yet
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When ngOnInit start
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'updateObservedPart').and.callThrough();
            tick(1);
            testUtils.detectChanges();

            // Then updateObservedPart should have been called as Player
            const update: Partial<FocussedPart> = {
                role: 'Player',
            };
            expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith(update);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should mark chosen opponent as Player when arriving', fakeAsync(async() => {
            // Given a part that as not initialised yet
            await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER, false, false);

            // When ngOnInit start
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'updateObservedPart').and.callThrough();
            tick(1);
            testUtils.detectChanges();

            // Then updateObservedPart should have been called as Player
            const update: Partial<FocussedPart> = {
                role: 'Player',
            };
            expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith(update);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should show player names', fakeAsync(async() => {
            // Given a started game
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When initialising the component
            tick(1);
            testUtils.detectChanges();

            // Then the usernames should be shown
            const playerIndicator: HTMLElement = testUtils.findElement('#playerZeroIndicator').nativeElement;
            expect(playerIndicator.innerText).toBe(UserMocks.CREATOR_AUTH_USER.username.get());
            const opponentIndicator: HTMLElement = testUtils.findElement('#playerOneIndicator').nativeElement;
            expect(opponentIndicator.innerText).toBe(UserMocks.OPPONENT_AUTH_USER.username.get());

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    it('prepared game for configRoom should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
        // Receive first move
        await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);

        expect(wrapper.currentPart.data.listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(wrapper.currentPart.data.turn).toEqual(1);

        // Do second move
        const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBA);
        await doMove(move, true);
        const expectedListMove: number[] = [FIRST_MOVE_ENCODED, QuartoMove.encoder.encodeNumber(move)];
        expect(wrapper.currentPart.data.listMoves).toEqual(expectedListMove);
        expect(wrapper.currentPart.data.turn).toEqual(2);

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('move should trigger db change', fakeAsync(async() => {
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        spyOn(partDAO, 'update').and.callThrough();
        await doMove(FIRST_MOVE, true);
        expect(wrapper.currentPart.data.listMoves).toEqual([QuartoMove.encoder.encodeNumber(FIRST_MOVE)]);
        const expectedUpdate: Partial<Part> = {
            lastUpdate: {
                index: 2,
                player: observerRole.value,
            },
            listMoves: [QuartoMove.encoder.encodeNumber(FIRST_MOVE)],
            turn: 1,
            // remaining times not updated on first turn of the component
            request: null,
            lastUpdateTime: serverTimestamp(),
        };
        // TODO: should receive somewhere some kind of Timestamp written by DB
        expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', expectedUpdate );
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should forbid making a move when it is not the turn of the player', fakeAsync(async() => {
        // Given a game
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
        spyOn(messageDisplayer, 'gameMessage');

        // When it is not the player's turn (because he made the first move)
        await doMove(FIRST_MOVE, true);

        // Then the player cannot play
        await testUtils.clickElement('#chooseCoord_0_0');
        expect(messageDisplayer.gameMessage).toHaveBeenCalledWith(GameWrapperMessages.NOT_YOUR_TURN());

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should allow player to pass when gameComponent allows it', fakeAsync(async() => {
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        testUtils.expectElementNotToExist('#passButton');

        wrapper.gameComponent.canPass = true;
        wrapper.gameComponent.pass = async() => {
            return MGPValidation.SUCCESS;
        };
        testUtils.detectChanges();

        await testUtils.clickElement('#passButton');

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should not update currentPart when receiving MOVE_WITHOUT_TIME update', fakeAsync(async() => {
        // Given a board where its the opponent's (first) turn
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        const CURRENT_PART: PartDocument = wrapper.currentPart;
        // When receiving a move time being null
        await receivePartDAOUpdate({
            lastUpdateTime: null,
            listMoves: [FIRST_MOVE_ENCODED],
            turn: 1,
        }, 1);

        // Then currentPart should not be updated
        const lastUpdateTime: FirestoreTime | undefined = wrapper.currentPart.data.lastUpdateTime;
        expect(lastUpdateTime === null ||lastUpdateTime === undefined).toBeTrue();
        const currentPartExceptLastUpdateTime: Part = {
            ...CURRENT_PART.data,
            lastUpdateTime: undefined,
        };
        expect(wrapper.currentPart.data).toEqual(currentPartExceptLastUpdateTime);
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should not do anything when receiving duplicate', fakeAsync(async() => {
        // Given a board where its the opponent's (first) turn
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        const CURRENT_PART: PartDocument = wrapper.currentPart;

        // When receiving the same move
        await receivePartDAOUpdate({
            ...CURRENT_PART.data,
        }, 0); // 0 so that even when bumped, the lastUpdate stays the same

        // Then currentPart should not be updated
        expect(wrapper.currentPart).toEqual(CURRENT_PART);
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    describe('ObservedPart Change', () => {
        it('should redirect to lobby when linked to a non-observed different part', fakeAsync(async() => {
            // Given a part where you are observer
            await prepareStartedGameFor(USER_OBSERVER);
            spyOn(wrapper, 'startCountDownFor').and.callFake(() => null);

            // When observedPart update to inform component that user is now candidate in a game
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.callFake(async() => false);
            const observedPart: FocussedPart = {
                id: 'another-id',
                role: 'Candidate',
                typeGame: 'P4, because why not',
                opponent: { id: 'creator-id', name: 'mister-creator' },
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then a redirection to lobby should be triggered
            expect(router.navigate).toHaveBeenCalledOnceWith(['/lobby']);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should not redirect to lobby when linked to an observed different part', fakeAsync(async() => {
            // Given a part where you are observer
            await prepareStartedGameFor(USER_OBSERVER);
            spyOn(wrapper, 'startCountDownFor').and.callFake(() => null);

            // When observedPart update to inform component that user is now candidate in a game
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.callFake(async() => false);
            const observedPart: FocussedPart = {
                id: 'another-id',
                role: 'Observer',
                typeGame: 'P4, because why not',
                opponent: { id: 'creator-id', name: 'mister-creator' },
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then a redirection to lobby should be triggered
            expect(router.navigate).not.toHaveBeenCalled();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    describe('Move victory', () => {
        it('should notifyVictory when active player win', fakeAsync(async() => {
            //  Given a board on which user can win
            const move0: QuartoMove = new QuartoMove(0, 3, QuartoPiece.AAAB);
            const move1: QuartoMove = new QuartoMove(1, 3, QuartoPiece.AABA);
            const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBB);
            const move3: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AABB);

            await prepareBoard([move0, move1, move2, move3]);
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing winning move
            spyOn(partDAO, 'update').and.callThrough();
            const winningMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.ABAA);
            await doMove(winningMove, true);
            tick(1000); // second update in queue for some reason ?

            // Then the game should be a victory
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(winningMove);
            expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                lastUpdate: {
                    index: 6,
                    player: observerRole.value,
                },
                listMoves: [move0, move1, move2, move3, winningMove].map(QuartoMove.encoder.encodeNumber),
                turn: 5,
                // remainingTimes are not present on the first move of a current board
                request: null,
                lastUpdateTime: serverTimestamp(),
                winner: UserMocks.CREATOR_MINIMAL_USER,
                loser: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.VICTORY.value,
            });
            testUtils.fixture.detectChanges();
            testUtils.expectElementToExist('#youWonIndicator');
            expectGameToBeOver();
        }));
        it('should notifyVictory when active player loose', fakeAsync(async() => {
            //  Given a board on which user can loose on his turn
            const move0: QuartoMove = new QuartoMove(2, 2, QuartoPiece.BBAA);
            const move1: QuartoMove = new QuartoMove(0, 3, QuartoPiece.AAAB);
            await prepareBoard([move0, move1]);
            testUtils.expectElementNotToExist('#youLostIndicator');

            // When doing loosing move
            spyOn(partDAO, 'update').and.callThrough();
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.ONE_WON);
            const loosing: QuartoMove = new QuartoMove(3, 3, QuartoPiece.ABAA);
            await doMove(loosing, true);
            tick(1000); // second update in queue for some reason ?

            // Then the game should be a victory
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(loosing);
            expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                lastUpdate: {
                    index: 4,
                    player: observerRole.value,
                },
                listMoves: [move0, move1, loosing].map(QuartoMove.encoder.encodeNumber),
                turn: 3,
                // remainingTimes are not present on the first move of a current board
                request: null,
                lastUpdateTime: serverTimestamp(),
                winner: UserMocks.OPPONENT_MINIMAL_USER,
                loser: UserMocks.CREATOR_MINIMAL_USER,
                result: MGPResult.VICTORY.value,
            });
            testUtils.fixture.detectChanges();
            testUtils.expectElementToExist('#youLostIndicator');
            expectGameToBeOver();
        }));
        it('should removeObservedPart when one player win', fakeAsync(async() => {
            //  Given a board on which user can win
            const move0: QuartoMove = new QuartoMove(0, 3, QuartoPiece.AAAB);
            const move1: QuartoMove = new QuartoMove(1, 3, QuartoPiece.AABA);
            const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBB);
            const move3: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AABB);
            await prepareBoard([move0, move1, move2, move3]);
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing winning move
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'removeObservedPart').and.callThrough();
            const winningMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.ABAA);
            await doMove(winningMove, true);
            tick(1000);
            testUtils.fixture.detectChanges();

            // Then removeObservedPart should have been called
            expect(connectedUserService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
        it('should notifyDraw when a draw move from player is done', fakeAsync(async() => {
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
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing drawing move
            spyOn(partDAO, 'update').and.callThrough();
            const drawingMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.EMPTY);
            await doMove(drawingMove, true);
            tick(1000); // When time arrive too quickly after the move_without_time started
            testUtils.fixture.detectChanges();

            // Then the game should be a draw
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(drawingMove);
            const listMoves: QuartoMove[] = moves.concat(drawingMove);
            expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                lastUpdate: {
                    index: 17,
                    player: Player.ONE.value,
                },
                listMoves: listMoves.map(QuartoMove.encoder.encodeNumber),
                turn: 16,
                // TODO: investigate on why remainingTimes is not changed
                request: null,
                lastUpdateTime: serverTimestamp(),
                result: MGPResult.HARD_DRAW.value,
            });
            testUtils.expectElementToExist('#hardDrawIndicator');
            expectGameToBeOver();
        }));
        it('should removeObservedPart when players draw', fakeAsync(async() => {
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
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing drawing move
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'removeObservedPart').and.callThrough();
            const drawingMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.EMPTY);
            await doMove(drawingMove, true);
            // For some reason doMove call the two update (without time then time only) very close to each other
            // Provoking a call to a timeout workaround so the two update are applied sequencially and not parallelly
            tick(1000);

            // Then removeObservedPart should have been called
            expect(connectedUserService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
    });
    describe('Take Back', () => {
        describe('sending/receiving', () => {
            it('Should send take back request when player ask to', fakeAsync(async() => {
                // Given a board where its the opponent's (first) turn
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);

                // When demanding to take back
                spyOn(partDAO, 'update').and.callThrough();
                await askTakeBack();

                // Then a request should be sent
                expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                    lastUpdate: {
                        index: 3,
                        player: Player.ZERO.value,
                    },
                    request: Request.takeBackAsked(Player.ZERO),
                });
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should forbid to propose to take back while take back request is waiting', fakeAsync(async() => {
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                testUtils.expectElementNotToExist('#askTakeBackButton');
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                testUtils.detectChanges();
                testUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should not propose to Player.ONE to take back before his first move', fakeAsync(async() => {
                // Given a board where nobody already played
                await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);

                // When asking take back, the button should not be here
                testUtils.expectElementNotToExist('#askTakeBackButton');

                // When receiving a new move, it should still not be showed nor possible
                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                testUtils.expectElementNotToExist('#askTakeBackButton');

                // When doing the first move, it should become possible, but only once
                await doMove(new QuartoMove(2, 2, QuartoPiece.BBAA), true);
                await askTakeBack();
                testUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should only propose to accept take back when opponent asked', fakeAsync(async() => {
                // Given a board where opponent did not ask to take back and where both player could have ask
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

                // accepting take back should not be proposed
                testUtils.expectElementNotToExist('#acceptTakeBackButton');
                await receiveRequest(Request.takeBackAsked(Player.ONE), 3);

                // Then should allow it after proposing sent
                spyOn(partDAO, 'update').and.callThrough();
                await acceptTakeBack();

                // and then again not allowing it
                testUtils.expectElementNotToExist('#acceptTakeBackButton');
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should only propose player to refuse take back when opponent asked', fakeAsync(async() => {
                // Given a board with previous move
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                testUtils.expectElementNotToExist('#refuseTakeBackButton');
                await receiveRequest(Request.takeBackAsked(Player.ONE), 3);
                spyOn(partDAO, 'update').and.callThrough();

                // When refusing take back
                await refuseTakeBack();

                // Then a TakeBackRefused request should have been sent
                testUtils.expectElementNotToExist('#refuseTakeBackButton');
                expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ZERO.value,
                    },
                    request: Request.takeBackRefused(Player.ZERO),
                });

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should not allow player to play while take back request is waiting for him', fakeAsync(async() => {
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await receiveRequest(Request.takeBackAsked(Player.ONE), 3);

                spyOn(partDAO, 'update').and.callThrough();
                await doMove(THIRD_MOVE, true);
                expect(partDAO.update).not.toHaveBeenCalled();

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should cancel take back request when take back requester do a move', fakeAsync(async() => {
                // Given an initial board where a take back request has been done by user
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();

                // When doing move while waiting for answer
                spyOn(partDAO, 'update').and.callThrough();
                await doMove(THIRD_MOVE, true);

                // Then update should remove request
                expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ZERO.value,
                    },
                    listMoves: [FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED, THIRD_MOVE_ENCODED],
                    turn: 3,
                    remainingMsForOne: 1799999,
                    request: null,
                    lastUpdateTime: serverTimestamp(),
                });

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should forbid player to ask take back again after refusal', fakeAsync(async() => {
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receiveRequest(Request.takeBackRefused(Player.ONE), 3);

                testUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should ignore take back accepted request before they have time included', fakeAsync(async() => {
                // Given an initial board where it's opponent's turn
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);

                // When opponent accepts take back but lastUpdateTime is not yet updated
                spyOn(wrapper, 'takeBackTo').and.callThrough();
                await receivePartDAOUpdate({
                    request: Request.takeBackAccepted(Player.ONE),
                    listMoves: [],
                    turn: 0,
                    remainingMsForZero: 179999,
                    lastUpdateTime: null,
                }, 2);

                // Then 'takeBackFor' should not be called
                expect(wrapper.takeBackTo).not.toHaveBeenCalled();
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('Opponent given take back during his turn', () => {
            it('should move board back two turn and call restartCountDown', fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 3);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(2);
                spyOn(wrapper, 'resetChronoFor').and.callThrough();

                // When accepting opponent's take back
                await acceptTakeBack();

                // Then turn should be changed to 0 and resumeCountDown be called
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should reset opponents chronos to what it was at pre-take-back turn beginning`, fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 3);

                // When accepting opponent's take back
                spyOn(wrapper, 'resetChronoFor').and.callThrough();
                await acceptTakeBack();

                // Then opponents chrono should have been reset
                expect(wrapper.resetChronoFor).toHaveBeenCalledOnceWith(Player.ZERO);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`Should reduce opponent's remainingTime, since opponent just played`, fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 3);

                // When accepting opponent's take back
                spyOn(partDAO, 'update').and.callThrough();
                await acceptTakeBack();

                // Then opponents take back request should have include remainingTime and lastTimeMove
                expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ONE.value,
                    },
                    request: Request.takeBackAccepted(Player.ONE),
                    listMoves: [],
                    turn: 0,
                    remainingMsForZero: 1799999,
                    remainingMsForOne: 1799999,
                    lastUpdateTime: serverTimestamp(),
                });
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('Opponent given take back during user turn', () => {
            it('should move board back one turn and call switchPlayer (for opponent)', fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 2);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(1);
                spyOn(wrapper, 'switchPlayer').and.callThrough();

                // When accepting opponent's take back
                await acceptTakeBack();

                // Then turn should be changed to 0 and resumeCountDown be called
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.switchPlayer).toHaveBeenCalledOnceWith();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`Should resumeCountDown for opponent and reset user's time`, fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await receiveRequest(Request.takeBackAsked(Player.ZERO), 2);

                // When accepting opponent's take back after some "thinking" time
                spyOn(wrapper, 'resumeCountDownFor').and.callThrough();
                spyOn(wrapper.chronoZeroGlobal, 'changeDuration').and.callThrough();
                spyOn(partDAO, 'update').and.callThrough();

                const beginningTime: Timestamp = wrapper.currentPart.data.beginning as Timestamp;
                const lastUpdateTime: Timestamp = wrapper.currentPart.data.lastUpdateTime as Timestamp;
                const usedTimeOfFirstTurn: number = getMillisecondsDifference(beginningTime, lastUpdateTime);
                const remainingMsForZero: number = (1800 * 1000) - usedTimeOfFirstTurn;
                await acceptTakeBack();

                // Then count down should be resumed for opponent and user shoud receive his decision time back
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 4,
                        player: Player.ONE.value,
                    },
                    turn: 0,
                    listMoves: [],
                    request: Request.takeBackAccepted(Player.ONE),
                    remainingMsForZero,
                    remainingMsForOne: 1800 * 1000,
                    lastUpdateTime: serverTimestamp(),
                });
                expect(wrapper.chronoZeroGlobal.changeDuration).toHaveBeenCalledWith(remainingMsForZero);

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('User given take back during his turn', () => {
            it('should move board back two turn and call resetChronoFor', fakeAsync(async() => {
                // Given an initial board where it's user (second) turn, and user just asked for take back
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(2);
                spyOn(wrapper, 'resetChronoFor').and.callThrough();

                // When opponent accept user's take back
                await receivePartDAOUpdate({
                    ...BASE_TAKE_BACK_REQUEST,
                    remainingMsForOne: 1799999,
                }, 4);
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should reset user chronos to what it was at pre-take-back turn beginning', fakeAsync(async() => {
                // Given an initial board where it's user second turn, and user just asked for take back
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(2);

                // When opponent accept user's take back
                spyOn(wrapper, 'resetChronoFor').and.callThrough();
                await receivePartDAOUpdate({
                    ...BASE_TAKE_BACK_REQUEST,
                    remainingMsForOne: 1799999,
                }, 4);

                // Then user's chronos should start again to what they were at beginning
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should do alternative move afterwards without taking back move time off (during user's turn)`, fakeAsync(async() => {
                // Given an initial board where user was autorised to take back
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                await receivePartDAOUpdate({
                    ...BASE_TAKE_BACK_REQUEST,
                    remainingMsForOne: 1799999,
                }, 4);

                // When playing alernative move
                spyOn(partDAO, 'update').and.callThrough();
                const ALTERNATIVE_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const ALTERNATIVE_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(ALTERNATIVE_MOVE);
                await doMove(ALTERNATIVE_MOVE, true);

                // Then partDAO should be updated without including remainingMsFor(any)
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 6,
                        player: Player.ZERO.value,
                    },
                    turn: 1,
                    listMoves: [ALTERNATIVE_MOVE_ENCODED],
                    remainingMsForOne: 1799998,
                    request: null,
                    lastUpdateTime: serverTimestamp(),
                });
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('User given take back during opponent turn', () => {
            it('should move board back one turn and call switchPlayer (for creator)', fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(1);
                spyOn(wrapper, 'switchPlayer').and.callThrough();

                // When opponent accept user's take back
                await receivePartDAOUpdate(BASE_TAKE_BACK_REQUEST, 3);
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.switchPlayer).toHaveBeenCalledOnceWith();
                expect(wrapper.gameComponent.rules.node.gameState.turn).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should resumeCountDown for user without removing time of opponent`, fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                spyOn(wrapper, 'resumeCountDownFor').and.callThrough();
                spyOn(partDAO, 'update').and.callThrough();
                await askTakeBack();

                // When opponent accept user's take back
                await receivePartDAOUpdate(BASE_TAKE_BACK_REQUEST, 4);

                // Then count down should be resumed and update not changing time
                expect(wrapper.resumeCountDownFor).toHaveBeenCalledWith(Player.ZERO);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should do alternative move afterwards without taking back move time off (during opponent turn)', fakeAsync(async() => {
                // Given an initial board where opponent just took back the a move
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receivePartDAOUpdate(BASE_TAKE_BACK_REQUEST, 3);

                // When playing alernative move
                spyOn(partDAO, 'update').and.callThrough();
                const ALTERNATIVE_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const ALTERNATIVE_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(ALTERNATIVE_MOVE);
                await doMove(ALTERNATIVE_MOVE, true);

                // Then partDAO should be updated without including remainingMsFor(any)
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ZERO.value,
                    },
                    turn: 1,
                    listMoves: [ALTERNATIVE_MOVE_ENCODED],
                    remainingMsForZero: 1799999,
                    request: null,
                    lastUpdateTime: serverTimestamp(),
                });
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
    });
    describe('Agreed Draw', () => {
        async function setup() {
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        }
        it('should send draw request when player asks to', fakeAsync(async() => {
            // Given any board
            await setup();
            spyOn(partDAO, 'update').and.callThrough();

            // When clicking the propose draw button
            await testUtils.clickElement('#proposeDrawButton');

            // Then a request of draw proposition should have been sent
            expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                lastUpdate: {
                    index: 2,
                    player: Player.ZERO.value,
                },
                request: Request.drawProposed(Player.ZERO),
            });
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should forbid to propose to draw while draw request is waiting', fakeAsync(async() => {
            await setup();
            await testUtils.clickElement('#proposeDrawButton');
            testUtils.expectElementNotToExist('#proposeDrawButton');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should forbid to propose to draw after refusal', fakeAsync(async() => {
            await setup();
            await testUtils.clickElement('#proposeDrawButton');
            await receiveRequest(Request.drawRefused(Player.ONE), 1);

            testUtils.expectElementNotToExist('#proposeDrawButton');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should finish the game after accepting a proposed draw', fakeAsync(async() => {
            // Given a part on which a draw has been proposed
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE), 1);
            spyOn(partDAO, 'update').and.callThrough();

            // When accepting the draw
            await testUtils.clickElement('#acceptDrawButton');

            // Then a request indicating game is an agreed draw should be sent
            expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                lastUpdate: {
                    index: 3,
                    player: Player.ZERO.value,
                },
                result: MGPResult.AGREED_DRAW_BY_ZERO.value,
                request: null,
            });
            testUtils.expectElementToExist('#youAgreedToDrawIndicator');
            expectGameToBeOver();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should finish the game when opponent accepts our proposed draw', fakeAsync(async() => {
            // Given a gameComponent where draw has been proposed
            await setup();
            await testUtils.clickElement('#proposeDrawButton');

            // When draw is accepted
            spyOn(partDAO, 'update').and.callThrough();
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
                request: null,
            }, 3);

            // Then game should be over
            expectGameToBeOver();
            testUtils.expectElementToExist('#yourOpponentAgreedToDrawIndicator');
            expect(partDAO.update).toHaveBeenCalledTimes(1);
        }));
        it('should removeObservedPart when opponent accepts our proposed draw', fakeAsync(async() => {
            // Given a gameComponent where draw has been proposed
            await setup();
            await testUtils.clickElement('#proposeDrawButton');

            // When draw is accepted
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'removeObservedPart').and.callThrough();
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
                request: null,
            }, 3);

            // Then removeObservedPart should have been called
            expect(connectedUserService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
        it('should send refusal when player asks to', fakeAsync(async() => {
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE), 1);

            spyOn(partDAO, 'update').and.callThrough();

            await testUtils.clickElement('#refuseDrawButton');
            expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                lastUpdate: {
                    index: 3,
                    player: Player.ZERO.value,
                },
                request: Request.drawRefused(Player.ZERO),
            });

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should only propose to accept/refuse draw when asked', fakeAsync(async() => {
            await setup();
            testUtils.expectElementNotToExist('#acceptDrawButton');
            testUtils.expectElementNotToExist('#refuseDrawButton');
            await receiveRequest(Request.drawProposed(Player.ONE), 1);

            testUtils.expectElementToExist('#acceptDrawButton');
            testUtils.expectElementToExist('#refuseDrawButton');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    describe('End Game Time Management', () => {
        it(`should stop player's global chrono when local reach end`, fakeAsync(async() => {
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroGlobal, 'stop').and.callThrough();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);
            expect(wrapper.chronoZeroGlobal.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop player's local chrono when global chrono reach end`, fakeAsync(async() => {
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroTurn, 'stop').and.callThrough();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);
            expect(wrapper.chronoZeroTurn.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop offline opponent's global chrono when local reach end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();

            // When he reach time out
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop offline opponent's local chrono when global chrono reach end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, true);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneTurn, 'stop').and.callThrough();

            // When he reach time out
            tick(wrapper.configRoom.maximalMoveDuration * 1000); // TODO: maximalPartDuration, for this one!!

            // Then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneTurn.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should not notifyTimeout for online opponent`, fakeAsync(async() => {
            // Given an online game where it's the opponent's; opponent is online
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            spyOn(wrapper, 'notifyTimeoutVictory').and.callThrough();

            // When he reach time out
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
            expect(wrapper.notifyTimeoutVictory).not.toHaveBeenCalled();
        }));
        xit(`should notifyTimeout for offline opponent`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn and opponent is offline
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            spyOn(wrapper, 'notifyTimeoutVictory').and.callThrough();
            spyOn(wrapper, 'opponentIsOffline').and.returnValue(true);

            // When opponent reach time out locally
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
            const winner: MinimalUser = UserMocks.CREATOR_MINIMAL_USER;
            const loser: MinimalUser = UserMocks.OPPONENT_MINIMAL_USER;
            expect(wrapper.notifyTimeoutVictory).toHaveBeenCalledOnceWith(winner, Player.ZERO, 1, loser);
        }));
        it(`should send opponent his remainingTime after first move`, fakeAsync(async() => {
            // Given a board where a first move has been made
            await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
            await receiveNewMoves([FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
            const beginning: Timestamp = wrapper.currentPart.data.beginning as Timestamp;
            const firstMoveTime: Timestamp = wrapper.currentPart.data.lastUpdateTime as Timestamp;
            const msUsedForFirstMove: number = getMillisecondsDifference(beginning, firstMoveTime);

            // When doing the next move
            expect(wrapper.currentPart.data.remainingMsForZero).toEqual(1800 * 1000);
            await doMove(SECOND_MOVE, true);

            // Then the update sent should have calculated time between creation and first move
            // and should have removed it from remainingMsForZero
            const remainingMsForZero: number = (1800 * 1000) - msUsedForFirstMove;
            expect(wrapper.currentPart.data.remainingMsForZero)
                .withContext(`Should have sent the opponent its updated remainingTime`)
                .toEqual(remainingMsForZero);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should update chrono when receiving your remainingTime in the update', fakeAsync(async() => {
            // Given a board where a first move has been made
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper.chronoZeroGlobal, 'changeDuration').and.callThrough();
            await doMove(FIRST_MOVE, true);
            expect(wrapper.currentPart.data.remainingMsForZero).toEqual(1800 * 1000);

            // When receiving new move
            await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

            // Then the global chrono of update-player should be updated
            expect(wrapper.chronoZeroGlobal.changeDuration)
                .withContext(`Chrono.ChangeDuration should have been refreshed with update's datas`)
                .toHaveBeenCalledWith(Utils.getNonNullable(wrapper.currentPart.data.remainingMsForZero));
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('when resigning, lastUpdateTime must be upToDate then remainingMs');
        it('when winning move is done, remainingMs at last turn of opponent must be');
    });
    async function prepareStartedGameForCreator() {
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        tick(1);
    }
    describe('AddTime feature', () => {
        describe('creator', () => {
            async function prepareStartedGameForCreator() {
                await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            }
            it('should allow to add local time to opponent', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(partDAO, 'update').and.callThrough();

                // When local countDownComponent emit addTime
                await wrapper.addTurnTime();

                // Then partDAO should be updated with a Request.turnTimeAdded
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 2,
                        player: Player.ZERO.value,
                    },
                    request: Request.addTurnTime(Player.ONE),
                });
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                tick(msUntilTimeout);
            }));
            it('should resume for both chrono at once when adding time to one', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
                spyOn(wrapper.chronoZeroTurn, 'resume').and.callThrough();

                // When receiving a request to add local time to player zero
                await receiveRequest(Request.addTurnTime(Player.ZERO), 1);

                // Then both chronos of player zero should have been resumed
                expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledTimes(1); // it failed, was 0
                expect(wrapper.chronoZeroTurn.resume).toHaveBeenCalledTimes(1); // it worked
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                tick(msUntilTimeout);
            }));
            it('should add time to chrono local when receiving the addTurnTime request (Player.ONE)', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addTurnTime request
                await receiveRequest(Request.addTurnTime(Player.ONE), 1);

                // Then chrono local of player one should be increased
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes + 30 sec
                tick(msUntilTimeout);
            }));
            it('should add time to local chrono when receiving the addTurnTime request (Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent on user turn
                await prepareStartedGameForCreator();
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addTurnTime request
                await receiveRequest(Request.addTurnTime(Player.ZERO), 1);

                // Then chrono local of player one should be increased
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                expect(wrapper.chronoZeroTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes + 30 sec
                tick(msUntilTimeout);
            }));
            it('should allow to add global time to opponent (as Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent on user's turn
                await prepareStartedGameForCreator();
                spyOn(partDAO, 'update').and.callThrough();

                // When countDownComponent emit addGlobalTime
                await wrapper.addGlobalTime();

                // Then a request to add global time to player one should be sent
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 2,
                        player: Player.ZERO.value,
                    },
                    request: Request.addGlobalTime(Player.ONE),
                    remainingMsForOne: (1800 * 1000) + (5 * 60 * 1000),
                });
                const msUntilTimeout: number = wrapper.configRoom.maximalMoveDuration * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes
                tick(msUntilTimeout);
            }));
            it('should add time to global chrono when receiving the addGlobalTime request (Player.ONE)', fakeAsync(async() => {
                // Given an onlineGameComponent on user's turn
                await prepareStartedGameForCreator();
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addGlobalTime request
                await receiveRequest(Request.addGlobalTime(Player.ONE), 1);

                // Then chrono global of player one should be increased by 5 new minutes
                expect(wrapper.chronoOneGlobal.remainingMs).toBe((30 * 60 * 1000) + (5 * 60 * 1000));
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should add time to global chrono when receiving the addGlobalTime request (Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addGlobalTime request
                await receiveRequest(Request.addGlobalTime(Player.ZERO), 1);

                // Then chrono global of player one should be increased by 5 new minutes
                expect(wrapper.chronoZeroGlobal.remainingMs).toBe((30 * 60 * 1000) + (5 * 60 * 1000));
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should postpone the timeout of chrono and not only change displayed time', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving a addTurnTime request
                await receiveRequest(Request.addTurnTime(Player.ZERO), 1);
                testUtils.detectChanges();

                // Then game should end by timeout only after new time has run out
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
                expect(testUtils.wrapper.endGame).withContext('game should not be finished yet').toBeFalse();
                tick(30 * 1000);
                expectGameToBeOver();
            }));
        });
        describe('opponent', () => {
            it('should allow to add global time to opponent (as Player.ONE)', fakeAsync(async() => {
                // Given an onlineGameComponent on opponent's turn
                await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);
                spyOn(partDAO, 'update').and.callThrough();

                // When countDownComponent emit addGlobalTime
                await wrapper.addGlobalTime();

                // Then a request to add global time to player zero should be sent
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 2,
                        player: Player.ONE.value,
                    },
                    request: Request.addGlobalTime(Player.ZERO),
                    remainingMsForZero: (1800 * 1000) + (5 * 60 * 1000),
                });
                const msUntilTimeout: number = wrapper.configRoom.maximalMoveDuration * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes
                tick(msUntilTimeout);
            }));
        });
    });
    xdescribe('User "handshake"', () => {
        xit(`should make opponent's name lightgrey when he is token-outdated`, fakeAsync(async() => {
            // Given a connected opponent
            await prepareStartedGameForCreator();

            // When the opponent token become too old
            // Creator update his last presence token
            await userDAO.updatePresenceToken(UserMocks.CREATOR_AUTH_USER.id);
            // but chosenOpponent don't update his last presence token
            tick(PartCreationComponent.TOKEN_TIMEOUT); // two token time pass and reactive the timeout
            testUtils.detectChanges();

            // Then opponent's name should be lightgrey
            testUtils.expectElementToHaveClass('#playerOneIndicator', 'has-text-grey-light');
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
    });
    describe('Resign', () => {
        it('should end game after clicking on resign button', fakeAsync(async() => {
            // Given an online game component
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);

            // When clicking on resign button
            spyOn(partDAO, 'update').and.callThrough();
            await testUtils.clickElement('#resignButton');

            // Then the game should be ended
            expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                lastUpdate: {
                    index: 3,
                    player: Player.ZERO.value,
                },
                winner: UserMocks.OPPONENT_MINIMAL_USER,
                loser: UserMocks.CREATOR_MINIMAL_USER,
                request: null,
                result: MGPResult.RESIGN.value,
            });
            expectGameToBeOver();
        }));
        it('Should not allow player to move after resigning', fakeAsync(async() => {
            // Given a component where user has resigned
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
            await testUtils.clickElement('#resignButton');

            // When attempting a move
            spyOn(partDAO, 'update').and.callThrough();
            await doMove(SECOND_MOVE, false);

            // Then it should be refused
            expect(partDAO.update).not.toHaveBeenCalled();
            expectGameToBeOver();
        }));
        it('Should display when the opponent resigned', fakeAsync(async() => {
            // Given a board where user has resign
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
            await receivePartDAOUpdate({
                winner: UserMocks.CREATOR_MINIMAL_USER,
                loser: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.RESIGN.value,
                request: null,
            }, 3);

            // When checking "victory text"
            const resignText: string = testUtils.findElement('#resignIndicator').nativeElement.innerText;

            // Then we should see "opponent has resign"
            expect(resignText).toBe(`firstCandidate has resigned.`);
            expectGameToBeOver();
        }));
        it('Should removeObservedPart when the opponent resigned', fakeAsync(async() => {
            // Given a board where user has resign
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            tick(1);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

            // When receiving opponents submission to our greatness and recognition as overlord of their land
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'removeObservedPart').and.callThrough();
            await receivePartDAOUpdate({
                winner: UserMocks.CREATOR_MINIMAL_USER,
                loser: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.RESIGN.value,
                request: null,
            }, 3);

            // Then removeObservedPart should be called
            expect(connectedUserService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
    });
    describe('getUpdatesTypes', () => {
        it('nothing changed = UpdateType.DUPLICATE', fakeAsync(async() => {
            // Given any part
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 3,
                listMoves: [1, 2, 3],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(333, 333000000),
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When making a move changing nothing
            const update: PartDocument = new PartDocument('configRoomId', initialPart);

            // Then the update should be detected as a Duplicata
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.DUPLICATE]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('Move + Time_updated + Request_removed = UpdateType.MOVE', fakeAsync(async() => {
            // Given a part with lastUpdateTime set and a take back just accepted
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 3,
                listMoves: [1, 2, 3],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(333, 333000000),
                request: Request.takeBackAccepted(Player.ZERO),
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When making a move changing: turn, listMove and lastUpdateTime
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                turn: 4,
                listMoves: [1, 2, 3, 4],
                lastUpdateTime: new Timestamp(444, 444000000),
                // And obviously, no longer the previous request code
                request: null,
            });

            // Then the update should be detected as a Move
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.MOVE]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('First Move + Time_added + Score_added = UpdateType.MOVE', fakeAsync(async() => {
            // Given a part where no move has been done
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 1,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 0,
                listMoves: [],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When doing the first move update (turn, listMove) add (scores, lastUpdateTime)
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 2,
                    player: 0,
                },
                turn: 1,
                listMoves: [1],
                // And obviously, the added score and time
                scorePlayerZero: 0,
                scorePlayerOne: 0,
                lastUpdateTime: new Timestamp(1111, 111000000),
            });

            // Then the update should be seen as a move
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.MOVE]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('First Move After Tack Back + Time_modified = UpdateType.MOVE', fakeAsync(async() => {
            // Given a "second" first move
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 0,
                listMoves: [],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(1111, 111000000),
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When doing a move again, modifying (turn, listMoves, lasMoveTime)
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 0,
                },
                turn: 1,
                listMoves: [1],
                // And obviously, the modified time
                lastUpdateTime: new Timestamp(2222, 222000000),
            });

            // Then the update should be seen as a Move
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.MOVE]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('Move + Time_modified + Score_modified = UpdateType.MOVE', fakeAsync(async() => {
            // Gvien a part with present scores
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(1111, 111000000),
                scorePlayerZero: 1,
                scorePlayerOne: 1,
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When doing an update modifying the score (turn, listMoves, scores, lastUpdateTime)
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                turn: 2,
                listMoves: [1, 2],
                lastUpdateTime: new Timestamp(2222, 222000000),
                scorePlayerZero: 1,
                // And obviously, the score update and time added
                scorePlayerOne: 4,
            });

            // Then the update should be seen as a move
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.MOVE]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('Move + Time_removed + Score_added = UpdateType.MOVE_WITHOUT_TIME', fakeAsync(async() => {
            // Given a part without score yet
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(1111, 111000000),
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When doing a move creating score but removing lastUpdateTime
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                turn: 2,
                listMoves: [1, 2],
                // And obviously, the added score
                scorePlayerZero: 0,
                scorePlayerOne: 0,
                // of course, no more lastUpdateTime
            });

            // Then the update should be recognised as a move without time
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.MOVE_WITHOUT_TIME]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('Move + Time_removed + Score_modified = UpdateType.MOVE_WITHOUT_TIME', fakeAsync(async() => {
            // Given a part with scores
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(1111, 111000000),
                scorePlayerZero: 1,
                scorePlayerOne: 1,
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When updating part with a move, score, but removing time
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                turn: 2,
                listMoves: [1, 2],
                scorePlayerZero: 1,
                // lastUpdateTime is removed
                scorePlayerOne: 4, // modified
            });

            // Then the update should be seen as a move without time
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.MOVE_WITHOUT_TIME]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('AcceptTakeBack + Time_removed = UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME', fakeAsync(async() => {
            // Given a part where take back as been requested
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(125, 456000000),
                request: Request.takeBackAsked(Player.ZERO),
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When accepting it, without sending time update
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                // but
                request: Request.takeBackAccepted(Player.ONE),
                // and no longer lastUpdateTime
                lastUpdateTime: null,
            });

            // Then the update should be seen as a ACCEPT_TAKE_BACK_WITHOUT_TIME
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.ACCEPT_TAKE_BACK_WITHOUT_TIME]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('AcceptTakeBack + Time_updated = UpdateType.REQUEST', fakeAsync(async() => {
            // Given a board with take back asked
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(125, 456000000),
                request: Request.takeBackAsked(Player.ZERO),
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When accepting it and updating lastUpdateTime
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                // but
                lastUpdateTime: new Timestamp(127, 456000000),
                request: Request.takeBackAccepted(Player.ONE),
            });

            // Then the update should be seen as a request
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.REQUEST]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
        it('Request.AddTurnTime + one remainingMs modified = UpdateType.REQUEST', fakeAsync(async() => {
            // Given a part with take back asked
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                remainingMsForZero: 1800 * 1000,
                remainingMsForOne: 1800 * 1000,
                beginning: FAKE_MOMENT,
                lastUpdateTime: new Timestamp(125, 456000000),
                request: Request.takeBackAsked(Player.ZERO),
            };
            wrapper.currentPart = new PartDocument('configRoomId', initialPart);

            // When time added, and remaining time updated
            const update: PartDocument = new PartDocument('configRoomId', {
                ...initialPart,
                lastUpdate: {
                    index: 4,
                    player: 1,
                },
                // but
                request: Request.addGlobalTime(Player.ZERO),
                remainingMsForZero: (1800 * 1000) + (5 * 60 * 1000),
                lastUpdateTime: new Timestamp(127, 456000000),
            });

            // Then the update should be seen as a request
            expect(wrapper.getUpdatesTypes(update)).toEqual([UpdateType.REQUEST]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
    });
    describe('rematch', () => {
        it('should show propose button only when game is ended', fakeAsync(async() => {
            // Given a game that is not finished
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            testUtils.expectElementNotToExist('#proposeRematchButton');

            // When it is finished
            await testUtils.expectInterfaceClickSuccess('#resignButton', true);

            // Then it should allow to propose rematch
            testUtils.expectElementToExist('#proposeRematchButton');
        }));
        it('should send proposal request when proposing', fakeAsync(async() => {
            // Given an ended game
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.expectInterfaceClickSuccess('#resignButton', true);

            // When the propose rematch button is clicked
            const gameService: GameService = TestBed.inject(GameService);
            spyOn(gameService, 'proposeRematch').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#proposeRematchButton');

            // Then the gameService must be called
            expect(gameService.proposeRematch).toHaveBeenCalledOnceWith('configRoomId', 2, Player.ZERO);
        }));
        it('should show accept/refuse button when proposition has been sent', fakeAsync(async() => {
            // Given an ended game
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.expectInterfaceClickSuccess('#resignButton', true);

            // When request is received
            testUtils.expectElementNotToExist('#acceptRematchButton');
            await receiveRequest(Request.rematchProposed(Player.ONE), 2);

            // Then accept/refuse buttons must be shown
            testUtils.expectElementToExist('#acceptRematchButton');
        }));
        it('should sent accepting request when user accept rematch', fakeAsync(async() => {
            // given a part with rematch request send by opponent
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.expectInterfaceClickSuccess('#resignButton', true);
            await receiveRequest(Request.rematchProposed(Player.ONE), 2);
            tick(1);

            // When accepting it
            const gameService: GameService = TestBed.inject(GameService);
            spyOn(gameService, 'acceptRematch').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#acceptRematchButton');

            // Then it should have called acceptRematch
            expect(gameService.acceptRematch).toHaveBeenCalledTimes(1);
        }));
        it('should redirect to new part when rematch is accepted', fakeAsync(async() => {
            // Given a part lost with rematch request send by user
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.expectInterfaceClickSuccess('#resignButton', true);
            await testUtils.expectInterfaceClickSuccess('#proposeRematchButton');

            // When opponent accepts it
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate');
            await receiveRequest(Request.rematchAccepted('Quarto', 'nextPartId'), 3);

            // Then it should redirect to new part
            expectValidRouting(router, ['/nextGameLoading'], NextGameLoadingComponent, { otherRoutes: true });
            expectValidRouting(router, ['/play', 'Quarto', 'nextPartId'], OnlineGameWrapperComponent, { otherRoutes: true });
        }));
    });
    describe('Non Player Experience', () => {
        it('should mark user as Observer when arriving', fakeAsync(async() => {
            // Given a part that as not initialised yet
            await prepareStartedGameFor(USER_OBSERVER, false, false);

            // When ngOnInit start
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'updateObservedPart').and.callThrough();
            tick(1);
            testUtils.detectChanges();

            // Then updateObservedPart should have been called as Observer
            const update: Partial<FocussedPart> = {
                role: 'Observer',
            };
            expect(connectedUserService.updateObservedPart).toHaveBeenCalledOnceWith(update);

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should remove observedPart when leaving the component', fakeAsync(async() => {
            // Given a part component where user is observer
            await prepareStartedGameFor(USER_OBSERVER);
            tick(1);

            // When user leaves the component (here, destroy it)
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'removeObservedPart').and.callThrough();
            testUtils.fixture.destroy();

            // Then the observedPart should have been removed
            expect(connectedUserService.removeObservedPart).toHaveBeenCalledOnceWith();
        }));
        it('should redirect to lobby when observedPart changed to non-observer', fakeAsync(async() => {
            // Given a part component where user is observer
            await prepareStartedGameFor(USER_OBSERVER);
            tick(1);

            // When observedPart update to inform component that user is now candidate in a game
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.callFake(async() => {return false;});
            const observedPart: FocussedPart = {
                id: 'another-id',
                role: 'Candidate',
                typeGame: 'P4, because why not',
                opponent: { id: 'creator-id', name: 'mister-creator' },
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then the observedPart should have been removed
            expect(router.navigate).toHaveBeenCalledOnceWith(['/lobby']);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should not removeObservedPart when destroying component after observedPart changed to non-observer', fakeAsync(async() => {
            // Given a part component where user was observer
            await prepareStartedGameFor(USER_OBSERVER);
            tick(1);

            // When the update arrive to tell component that user is now non-observer-elsewhere
            const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
            spyOn(connectedUserService, 'removeObservedPart').and.callThrough();
            const observedPart: FocussedPart = {
                id: 'another-id',
                role: 'Candidate',
                typeGame: 'P4, because why not',
                opponent: { id: 'creator-id', name: 'mister-creator' },
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
            // For some reason the previous line did not trigger ngOnDestroy, so here we are
            testUtils.fixture.destroy();

            // Then the observedPart should have been removed
            expect(connectedUserService.removeObservedPart).not.toHaveBeenCalled();
        }));
        it('should not be able to do anything', fakeAsync(async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // TODOTODO triple check that without the tick(1), component AINT STARTED!
            await prepareStartedGameFor(USER_OBSERVER);
            tick(1);

            const forbiddenFunctions: { name: string, isAsync: boolean } [] = [
                { name: 'canProposeDraw', isAsync: false },
                { name: 'canAskTakeBack', isAsync: false },
                { name: 'acceptRematch', isAsync: true },
                { name: 'proposeRematch', isAsync: true },
                { name: 'canResign', isAsync: false },
            ];
            for (const forbiddenFunction of forbiddenFunctions) {
                const expectedError: string = 'Non playing should not call ' + forbiddenFunction.name;
                const expectedMessage: string = 'Assertion failure: ' + expectedError;
                if (forbiddenFunction.isAsync) {
                    await expectAsync(wrapper[forbiddenFunction.name]()).toBeRejectedWithError(expectedMessage);
                } else {
                    expect(() => wrapper[forbiddenFunction.name]()).toThrowError(expectedMessage);
                }
                expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', expectedError);
            }
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should display that the game is a draw', fakeAsync(async() => {
            // Given a part that the two player agreed to draw
            await prepareStartedGameFor(USER_OBSERVER);
            tick(1);
            await receiveRequest(Request.drawProposed(Player.ONE), 1);
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ZERO.value,
                request: null,
            }, 2);

            // When displaying the board
            // Then the text should indicate players have agreed to draw
            testUtils.expectElementToExist('#playersAgreedToDraw');
            expectGameToBeOver();
        }));
    });
    describe('Visuals', () => {
        it('should highlight each player name in their respective color', fakeAsync(async() => {
            // Given a game that has been started
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When the game is displayed
            tick(1);
            testUtils.detectChanges();

            // Then it should highlight the player's names
            testUtils.expectElementToHaveClass('#playerZeroIndicator', 'player0-bg');
            testUtils.expectElementToHaveClass('#playerOneIndicator', 'player1-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should highlight the board with the color of the player when it is their turn', fakeAsync(async() => {
            // Given a game that has not been started
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When the component initialize and it is the current player's turn
            tick(1);
            testUtils.detectChanges();

            // Then it should highlight the board with its color
            testUtils.expectElementToHaveClass('#board-tile', 'player0-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should highlight the board in grey when game is over', fakeAsync(async() => {
            // Given a game that has been started
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);

            // When the game is over
            await testUtils.clickElement('#resignButton');

            // Then it should highlight the board with its color
            testUtils.expectElementToHaveClass('#board-tile', 'endgame-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should not highlight the board when it is the turn of the opponent', fakeAsync(async() => {
            // Given a game that has been started
            await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);

            // When it is not the current player's turn
            await doMove(FIRST_MOVE, true);
            testUtils.detectChanges();

            // Then it should not highlight the board
            testUtils.expectElementNotToHaveClass('#board-tile', 'player1-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
});

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
import { PartService } from 'src/app/services/PartService';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { UserDAO } from 'src/app/dao/UserDAO';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { Action, MGPResult, Part, PartDocument, Reply, RequestType } from 'src/app/domain/Part';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { FocusedPart, User } from 'src/app/domain/User';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { getMillisecondsDifference } from 'src/app/utils/TimeUtils';
import { GameWrapperMessages } from '../GameWrapper';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { GameService } from 'src/app/services/GameService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NextGameLoadingComponent } from '../../normal-component/next-game-loading/next-game-loading.component';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { GameStatus } from 'src/app/jscaip/Rules';
import { PartCreationComponent } from '../part-creation/part-creation.component';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { FocusedPartMocks } from 'src/app/domain/mocks/FocusedPartMocks.spec';
import { LobbyComponent } from '../../normal-component/lobby/lobby.component';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { ConfigRoomService } from 'src/app/services/ConfigRoomService';
import { UserService } from 'src/app/services/UserService';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { ObservedPartServiceMock } from 'src/app/services/tests/ObservedPartService.spec';

export type PreparationResult<T extends AbstractGameComponent> = {
    testUtils: ComponentTestUtils<T, MinimalUser>;
    role: PlayerOrNone;
}

export async function prepareMockDBContent(initialConfigRoom: ConfigRoom): Promise<void> {
    const partDAO: PartDAO = TestBed.inject(PartDAO);
    const configRoomDAO: ConfigRoomDAO = TestBed.inject(ConfigRoomDAO);
    const userDAO: UserDAO = TestBed.inject(UserDAO);
    await configRoomDAO.set('configRoomId', initialConfigRoom);
    await partDAO.set('configRoomId', PartMocks.INITIAL);
    await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
    await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
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
    await userDAO.set(USER_OBSERVER.id, OBSERVER);
    return;
}

export async function prepareWrapper<T extends AbstractGameComponent>(user: AuthUser, component: string)
: Promise<ComponentTestUtils<T, MinimalUser>>
{
    const testUtils: ComponentTestUtils<T, MinimalUser> = await ComponentTestUtils.basic(component);
    await prepareMockDBContent(ConfigRoomMocks.INITIAL);
    ConnectedUserServiceMock.setUser(user);
    return testUtils;
}

export async function prepareStartedGameFor<T extends AbstractGameComponent>(
    user: AuthUser,
    component: string,
    shorterGlobalChrono: boolean = false,
    waitForPartToStart: boolean = true)
: Promise<PreparationResult<T>>
{
    const testUtils: ComponentTestUtils<T, MinimalUser> = await prepareWrapper<T>(user, component);
    testUtils.prepareFixture(OnlineGameWrapperComponent);
    const wrapper: OnlineGameWrapperComponent = testUtils.wrapper as OnlineGameWrapperComponent;
    testUtils.detectChanges();
    tick(1);

    const partCreationId: DebugElement = testUtils.findElement('#partCreation');
    let context: string = 'partCreation id should be present after ngOnInit';
    expect(partCreationId).withContext(context).toBeTruthy();
    context = 'partCreation field should also be present';
    expect(wrapper.partCreation).withContext(context).toBeTruthy();
    const configRoomService: ConfigRoomService = TestBed.inject(ConfigRoomService);
    await configRoomService.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
    testUtils.detectChanges();
    const configRoomDAO: ConfigRoomDAO = TestBed.inject(ConfigRoomDAO);
    await configRoomDAO.update('configRoomId', ConfigRoomMocks.WITH_CHOSEN_OPPONENT);
    testUtils.detectChanges();
    let role: PlayerOrNone = PlayerOrNone.NONE;
    if (user.id === UserMocks.CREATOR_AUTH_USER.id) {
        role = Player.ZERO;
    } else if (user.id === UserMocks.OPPONENT_AUTH_USER.id) {
        role = Player.ONE;
    }
    await configRoomDAO.update('configRoomId', ConfigRoomMocks.WITH_PROPOSED_CONFIG);
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
    }; // LE MOMENT OU LE TOUR PASSE A ZERO PEUT P-E FAIRE TRIGGERER PARFOIS LE GAME-INCLUDER
    const roleAsPlayer: Player = role === PlayerOrNone.NONE ? Player.ZERO : role as Player;
    const gameService: GameService = TestBed.inject(GameService);
    await gameService.updateAndBumpIndex('configRoomId', roleAsPlayer, 0, update);
    testUtils.detectChanges();
    if (waitForPartToStart === true) {
        tick(2);
        testUtils.detectChanges();
        testUtils.bindGameComponent();
        testUtils.prepareSpies();
    }
    return { testUtils, role };
}

fdescribe('OnlineGameWrapperComponent of Quarto:', () => {

    /* Life cycle summary
     * component construction (beforeEach)
     * stage 0
     * ngOnInit (triggered by detectChanges)
     * stage 1: PartCreationComponent appear
     * startGame, launched by user if game was not started yet, or automatically (via partCreationComponent)
     * stage 2: PartCreationComponent dissapear, game component appear
     * tick(1): the async part of startGame is now finished
     * stage 3: P4Component appear
     * differents scenarios
     */

    let testUtils: ComponentTestUtils<QuartoComponent, MinimalUser>;
    let wrapper: OnlineGameWrapperComponent;
    let partDAO: PartDAO;
    let partService: PartService;
    let gameService: GameService;

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

    let role: PlayerOrNone;

    const FIRST_MOVE: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BABB);

    const SECOND_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);

    const THIRD_MOVE: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BABA);

    const FIRST_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(FIRST_MOVE);

    const SECOND_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(SECOND_MOVE);

    const THIRD_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(THIRD_MOVE);

    async function doMove(move: QuartoMove, legal: boolean): Promise<MGPValidation> {
        const state: QuartoState = wrapper.gameComponent.getState() as QuartoState;
        const result: MGPValidation = await wrapper.gameComponent.chooseMove(move, state);
        const message: string = 'move ' + move.toString() + ' should be legal but failed because: ' + result.reason;
        expect(result.isSuccess()).withContext(message).toEqual(legal);
        testUtils.detectChanges();
        tick(1);
        return result;
    }
    async function receiveRequest(player: Player, request: RequestType): Promise<void> {
        await partService.addRequest('configRoomId', player, request);
        testUtils.detectChanges();
    }
    async function receiveReply(player: Player, reply: Reply, request: RequestType, data?: JSONValue): Promise<void> {
        await partService.addReply('configRoomId', player, reply, request, data);
        testUtils.detectChanges();
    }
    async function receiveAction(player: Player, action: Action): Promise<void> {
        await partService.addAction('configRoomId', player, action);
        testUtils.detectChanges();
    }
    async function receivePartDAOUpdate(update: Partial<Part>, lastIndex: number, detectChanges: boolean = true)
    : Promise<void>
    {
        const roleAsPlayer: Player = role === PlayerOrNone.NONE ? Player.ZERO : role as Player;
        await gameService.updateAndBumpIndex('configRoomId', roleAsPlayer, lastIndex, update);
        if (detectChanges) {
            testUtils.detectChanges();
        }
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
    async function receiveNewMoves(initialTurn: number,
                                   newMoves: number[],
                                   lastIndex: number,
                                   remainingMsForZero: number,
                                   remainingMsForOne: number,
                                   detectChanges: boolean = true)
    : Promise<void>
    {
        const update: Partial<Part> = {
            turn: initialTurn + newMoves.length,
            request: null,
            remainingMsForOne,
            remainingMsForZero,
            lastUpdateTime: serverTimestamp(),
        };
        const gameService: GameService = TestBed.inject(GameService);
        let currentPlayer: Player = Player.of(initialTurn % 2);
        for (const move of newMoves) {
            gameService.addMove('configRoomId', currentPlayer, move);
            currentPlayer = currentPlayer.getOpponent()
        }
        return await receivePartDAOUpdate(update, lastIndex, detectChanges);
    }
    async function prepareTestUtilsFor(authUser: AuthUser,
                                       shorterGlobalChrono?: boolean,
                                       waitForPartToStart?: boolean)
    : Promise<void>
    {
        const preparationResult: PreparationResult<QuartoComponent> =
            await prepareStartedGameFor<QuartoComponent>(authUser,
                                                         'Quarto',
                                                         shorterGlobalChrono,
                                                         waitForPartToStart);
        testUtils = preparationResult.testUtils;
        role = preparationResult.role;
        partDAO = TestBed.inject(PartDAO);
        partService = TestBed.inject(PartService);
        gameService = TestBed.inject(GameService);
        wrapper = testUtils.wrapper as OnlineGameWrapperComponent;
    }
    async function prepareBoard(moves: QuartoMove[], player: Player = Player.ZERO): Promise<void> {
        let authUser: AuthUser;
        if (player === Player.ONE) {
            authUser = UserMocks.OPPONENT_AUTH_USER;
        } else {
            authUser = UserMocks.CREATOR_AUTH_USER;
        }
        await prepareTestUtilsFor(authUser);
        let remainingMsForZero: number = 1800 * 1000;
        let remainingMsForOne: number = 1800 * 1000;
        let offset: number = 0;
        let turn: number = 0;
        if (player === Player.ONE) {
            offset = 1;
            const firstMove: QuartoMove = moves[0];
            const encodedMove: number = QuartoMove.encoder.encodeNumber(firstMove);
            await receiveNewMoves(turn, [encodedMove], 1, remainingMsForZero, remainingMsForOne);
            turn += 1;
        }
        for (let i: number = offset; i < moves.length; i+=2) {
            const move: QuartoMove = moves[i];
            await doMove(moves[i], true);
            if (i > 1) {
                if (i % 2 === 0) {
                    remainingMsForOne -= 1;
                } else {
                    remainingMsForZero -= 1;
                }
            }
            const newMoves: number[] = [QuartoMove.encoder.encodeNumber(move), QuartoMove.encoder.encodeNumber(moves[i+1])];
            await receiveNewMoves(turn, newMoves, i + 2, remainingMsForZero, remainingMsForOne);
            turn += 2;
        }
    }
    function expectGameToBeOver(): void {
        expect(wrapper.chronoZeroGlobal.isIdle()).withContext('chrono zero global should be idle').toBeTrue();
        expect(wrapper.chronoZeroTurn.isIdle()).withContext('chrono zero turn should be idle').toBeTrue();
        expect(wrapper.chronoOneGlobal.isIdle()).withContext('chrono one global should be idle').toBeTrue();
        expect(wrapper.chronoOneTurn.isIdle()).withContext('chrono one turn should be idle').toBeTrue();
        expect(wrapper.endGame).toBeTrue();
    }
    async function prepareStartedGameWithMoves(encodedMoves: number[]): Promise<void> {
        // 1. Creating the mocks and testUtils but NOT component
        // 2. Setting the db with the encodedMoves including
        // 3. Setting the component and making it start like it would

        const user: AuthUser = UserMocks.CREATOR_AUTH_USER;
        testUtils = await prepareWrapper<QuartoComponent>(user, 'Quarto');
        const configRoomService: ConfigRoomService = TestBed.inject(ConfigRoomService);
        await configRoomService.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
        const configRoomDAO: ConfigRoomDAO = TestBed.inject(ConfigRoomDAO);
        await configRoomDAO.update('configRoomId', ConfigRoomMocks.WITH_CHOSEN_OPPONENT);
        role = PlayerOrNone.NONE;
        if (user.id === UserMocks.CREATOR_AUTH_USER.id) {
            role = Player.ZERO;
        } else if (user.id === UserMocks.OPPONENT_AUTH_USER.id) {
            role = Player.ONE;
        }
        await configRoomDAO.update('configRoomId', ConfigRoomMocks.WITH_PROPOSED_CONFIG);
        await configRoomDAO.update('configRoomId', {
            partStatus: PartStatus.PART_STARTED.value,
        });
        const update: Partial<Part> = {
            playerOne: UserMocks.OPPONENT_MINIMAL_USER,
            turn: 0,
            remainingMsForZero: 1800 * 1000,
            remainingMsForOne: 1800 * 1000,
            beginning: serverTimestamp(),
        };
        const roleAsPlayer: Player = role === PlayerOrNone.NONE ? Player.ZERO : role as Player;
        const gameService: GameService = TestBed.inject(GameService);
        await gameService.updateAndBumpIndex('configRoomId', roleAsPlayer, 0, update);

        let offset: number = 0;
        let remainingMsForZero: number = Utils.getNonNullable(update.remainingMsForZero);
        let remainingMsForOne: number = Utils.getNonNullable(update.remainingMsForOne);
        let turn: number = 0;
        if (role === Player.ONE) {
            offset = 1;
            const encodedMove: number = encodedMoves[0];
            await receiveNewMoves(turn, [encodedMove], 1, remainingMsForZero, remainingMsForOne, false);
            turn += 1;
        }
        for (let i: number = offset; i < encodedMoves.length; i++) {
            if (i > 1) {
                if (i % 2 === 0) {
                    remainingMsForOne -= 1;
                } else {
                    remainingMsForZero -= 1;
                }
            }
            await receiveNewMoves(turn, [encodedMoves[i]], i + 1, remainingMsForZero, remainingMsForOne, false);
            turn += 1;
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
        testUtils.detectChanges();
        tick(2);

        testUtils.bindGameComponent();
        testUtils.prepareSpies();
    }
    it('Should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        spyOn(wrapper, 'reachedOutOfTime').and.callFake(async() => {});
        // Should not even been called but:
        // reachedOutOfTime is called (in test) after tick(1) even though there is still remainingTime
        expect(Utils.getNonNullable(wrapper.currentPlayer).name).toEqual('creator');
        wrapper.pauseCountDownsFor(Player.ZERO);
    }));
    it('should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        // Given an online game being created
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, false, false);
        const partCreationId: DebugElement = testUtils.findElement('#partCreation');
        let quartoTag: DebugElement = testUtils.findElement('app-quarto');
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
        tick(2);
        testUtils.detectChanges();

        // Then the game component should become present in the component
        quartoTag = testUtils.findElement('app-quarto');
        expect(quartoTag)
            .withContext('quarto tag should be present after config accepted and async millisec finished')
            .toBeTruthy();
        expect(wrapper.gameComponent)
            .withContext('gameComponent field should also be present after config accepted and async millisec finished')
            .toBeTruthy();
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('Should allow simple move', fakeAsync(async() => {
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        await doMove(FIRST_MOVE, true);

        expect(wrapper.currentPart?.data.turn).toEqual(1);

        // Receive second move
        const remainingMsForZero: number = Utils.getNonNullable(wrapper.currentPart?.data.remainingMsForZero);
        const remainingMsForOne: number = Utils.getNonNullable(wrapper.currentPart?.data.remainingMsForOne);
        await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, remainingMsForZero, remainingMsForOne);

        expect(wrapper.currentPart?.data.turn).toEqual(2);
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    describe('Late Arrival', () => {
        it('Should allow user to arrive late on the game (on their turn)', fakeAsync(async() => {
            // Given a part that has already started (moves have been done)
            await prepareStartedGameWithMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED]);

            // When arriving and playing
            tick(1);

            // Then the new move should be done
            expect(testUtils.wrapper.gameComponent.getState().turn).toBe(2);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('Should allow user to arrive late on the game (not on their turn)', fakeAsync(async() => {
            // Given a part that has already started (moves have been done)
            await prepareStartedGameWithMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED, THIRD_MOVE_ENCODED]);

            // When arriving and playing
            tick(1);

            // Then the new move should be done
            expect(testUtils.wrapper.gameComponent.getState().turn).toBe(3);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    describe('Component initialization', () => {
        it('should mark creator as Player when arriving', fakeAsync(async() => {
            // Given a component that is not initialized yet
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When component is initialized
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'updateObservedPart').and.callThrough();
            tick(2);
            testUtils.detectChanges();

            // Then updateObservedPart should have been called as Player
            const update: Partial<FocusedPart> = {
                id: 'configRoomId',
                typeGame: 'Quarto',
                opponent: null,
                role: 'Player',
            };
            expect(observedPartService.updateObservedPart).toHaveBeenCalledOnceWith(update);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should mark chosen opponent as Player when arriving', fakeAsync(async() => {
            // Given a component that is not initialized yet
            await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, false, false);

            // When component is initialized
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'updateObservedPart').and.callThrough();
            tick(2);
            testUtils.detectChanges();

            // Then updateObservedPart should have been called as Player
            const update: Partial<FocusedPart> = {
                id: 'configRoomId',
                typeGame: 'Quarto',
                opponent: UserMocks.CREATOR_MINIMAL_USER,
                role: 'Player',
            };
            expect(observedPartService.updateObservedPart).toHaveBeenCalledOnceWith(update);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should show player names', fakeAsync(async() => {
            // Given a started game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When initializing the component
            tick(2);
            testUtils.detectChanges();

            // Then the usernames should be shown
            testUtils.expectElementToExist('#playerZeroIndicator');
            const playerIndicator: HTMLElement = testUtils.findElement('#playerZeroIndicator').nativeElement;
            expect(playerIndicator.innerText).toBe(UserMocks.CREATOR_AUTH_USER.username.get());
            testUtils.expectElementToExist('#playerOneIndicator');
            const opponentIndicator: HTMLElement = testUtils.findElement('#playerOneIndicator').nativeElement;
            expect(opponentIndicator.innerText).toBe(UserMocks.OPPONENT_AUTH_USER.username.get());

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    it('prepared game for configRoom should allow simple move', fakeAsync(async() => {
        console.log('---- PREPARING')
        await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
        // Receive first move
        console.log('---- FIRST MOVE')
        await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
        expect(wrapper.currentPart?.data.turn).toEqual(1);

        // Do second move
        console.log('---- SECOND MOVE')
        const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBA);
        await doMove(move, true);
        expect(wrapper.currentPart?.data.turn).toEqual(2);

        console.log('---- DONE')
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('playing a move should trigger part change and send the move', fakeAsync(async() => {
        // Given a part
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        spyOn(partDAO, 'update').and.callThrough();
        spyOn(partService, 'addMove').and.callThrough();
        // When playing a move
        await doMove(FIRST_MOVE, true);
        // Then it should update the part in the DB and send the move
        const expectedUpdate: Partial<Part> = {
            lastUpdate: {
                index: 2,
                player: role.value,
            },
            turn: 1,
            // remaining times not updated on first turn of the component
            request: null,
            lastUpdateTime: serverTimestamp(),
        };
        expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', expectedUpdate);
        expect(partService.addMove).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, FIRST_MOVE_ENCODED);
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should forbid making a move when it is not the turn of the player', fakeAsync(async() => {
        // Given a game
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
        spyOn(messageDisplayer, 'gameMessage').and.callThrough();

        // When it is not the player's turn (because he made the first move)
        await doMove(FIRST_MOVE, true);

        // Then the player cannot play
        await testUtils.clickElement('#chooseCoord_0_0');
        expect(messageDisplayer.gameMessage).toHaveBeenCalledWith(GameWrapperMessages.NOT_YOUR_TURN());

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('Should allow player to pass when gameComponent allows it', fakeAsync(async() => {
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        testUtils.expectElementNotToExist('#passButton');

        wrapper.gameComponent.canPass = true;
        wrapper.gameComponent.pass = async() => {
            return MGPValidation.SUCCESS;
        };
        testUtils.detectChanges();

        await testUtils.clickElement('#passButton');

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should not do anything when receiving duplicate', fakeAsync(async() => {
        // Given a board where its the opponent's (first) turn
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        const CURRENT_PART: PartDocument | null = wrapper.currentPart;

        // When receiving the same move
        await receivePartDAOUpdate({
            ...CURRENT_PART?.data,
        }, 0); // 0 so that even when bumped, the lastUpdate stays the same

        // Then currentPart should not be updated
        expect(wrapper.currentPart).toEqual(CURRENT_PART);
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    describe('ObservedPart Change', () => {
        it('should redirect to lobby when role and partId change', fakeAsync(async() => {
            // Given a part where the user is observer
            await prepareTestUtilsFor(USER_OBSERVER);
            spyOn(wrapper, 'startCountDownFor').and.callFake(() => null);

            // When observedPart is updated to inform component that user is now candidate in a game
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            const observedPart: FocusedPart = FocusedPartMocks.OTHER_CANDIDATE;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then a redirection to lobby should be triggered
            expectValidRouting(router, ['/lobby'], LobbyComponent);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should not redirect to lobby when role stay "observer" but partId change', fakeAsync(async() => {
            // Given a part where the user is observer
            await prepareTestUtilsFor(USER_OBSERVER);
            spyOn(wrapper, 'startCountDownFor').and.callFake(() => null);

            // When observedPart is updated to inform component that user is now candidate in a game
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            const observedPart: FocusedPart = FocusedPartMocks.OTHER_OBSERVER;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then a redirection to lobby should not have been triggered
            expect(router.navigate).not.toHaveBeenCalled();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should not do anything particular when observer leaves this part from another tab', fakeAsync(async() => {
            // Given a part where the user is observer
            await prepareTestUtilsFor(USER_OBSERVER);
            spyOn(wrapper, 'startCountDownFor').and.callFake(() => null);

            // When observedPart is updated to inform component that user stopped observing some part in another tab
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            ObservedPartServiceMock.setObservedPart(MGPOptional.empty());

            // Then nothing special should have happened, including no redirection
            // Though compo.observedPart should have been locally changed
            expect(router.navigate).not.toHaveBeenCalled();
            expect(wrapper.getObservedPart()).toEqual(MGPOptional.empty());
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    describe('Move victory', () => {
        it('should notifyVictory when active player wins', fakeAsync(async() => {
            // Given a board on which user can win
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.ZERO_WON);
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing winning move
            let partDAOCalled: boolean = false;
            partDAO['updateBackup'] = partDAO.update;
            spyOn(partDAO, 'update').and.callFake(async(id: string, update: Part) => {
                expect(update.winner).toBe(UserMocks.CREATOR_MINIMAL_USER);
                expect(update.loser).toBe(UserMocks.OPPONENT_MINIMAL_USER);
                expect(update.result).toBe(MGPResult.VICTORY.value);
                partDAOCalled = true;
                return partDAO['updateBackup'](id, update);
            });
            await doMove(FIRST_MOVE, true);
            // the call to the serverTimeMock() is very close to the update
            // hence, the second update got called while the first update was executing
            tick(1000);

            // Then the game should be a victory
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(FIRST_MOVE);
            expect(partDAOCalled).toBeTrue(); // Ensure the check on update has passed and succeed
            testUtils.fixture.detectChanges();
            testUtils.expectElementToExist('#youWonIndicator');
            expectGameToBeOver();
        }));
        it('should notifyVictory when active player loses', fakeAsync(async() => {
            // Given a board on which user can lose on his turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.ONE_WON);
            testUtils.expectElementNotToExist('#youLostIndicator');

            // When doing losing move
            let partDAOCalled: boolean = false;
            partDAO['updateBackup'] = partDAO.update;
            spyOn(partDAO, 'update').and.callFake(async(id: string, update: Part) => {
                expect(update.winner).toBe(UserMocks.OPPONENT_MINIMAL_USER);
                expect(update.loser).toBe(UserMocks.CREATOR_MINIMAL_USER);
                expect(update.result).toBe(MGPResult.VICTORY.value);
                partDAOCalled = true;
                return partDAO['updateBackup'](id, update);
            });
            await doMove(FIRST_MOVE, true);
            // the call to the serverTimeMock() is very close to the update
            // hence, the second update got called while the first update was executing
            tick(1000);

            // Then the game should be a victory
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(FIRST_MOVE);
            expect(partDAOCalled).toBeTrue(); // Ensure the check on update has passed and succeed
            testUtils.fixture.detectChanges();
            testUtils.expectElementToExist('#youLostIndicator');
            expectGameToBeOver();
        }));
        it('should removeObservedPart when one player wins', fakeAsync(async() => {
            // Given a board on which user can win
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.ZERO_WON);
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing winning move
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            await doMove(FIRST_MOVE, true);
            // the call to the serverTimeMock() is very close to the update
            // hence, the second update got called while the first update was executing
            tick(1000);
            testUtils.fixture.detectChanges();

            // Then removeObservedPart should have been called
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
        it('should notifyDraw when a draw move from player is done', fakeAsync(async() => {
            // Given a board on which user can draw
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.DRAW);
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing drawing move
            let partDAOCalled: boolean = false;
            partDAO['updateBackup'] = partDAO.update;
            spyOn(partDAO, 'update').and.callFake(async(id: string, update: Part) => {
                expect(update.result).toBe(MGPResult.HARD_DRAW.value);
                partDAOCalled = true;
                return partDAO['updateBackup'](id, update);
            });
            await doMove(FIRST_MOVE, true);
            tick(1000); // When time arrive too quickly after the move_without_time started
            testUtils.fixture.detectChanges();

            // Then the game should be a draw
            expect(wrapper.gameComponent.rules.node.move.get()).toEqual(FIRST_MOVE);
            expect(partDAOCalled).toBeTrue(); // Ensure the check on update has passed and succeed
            testUtils.expectElementToExist('#hardDrawIndicator');
            expectGameToBeOver();
        }));
        it('should removeObservedPart when players draw', fakeAsync(async() => {
            // Given a board on which user can draw
            await prepareBoard([new QuartoMove(0, 0, QuartoPiece.AAAB)], Player.ONE);
            spyOn(wrapper.gameComponent.rules, 'getGameStatus').and.returnValue(GameStatus.DRAW);
            testUtils.expectElementNotToExist('#winnerIndicator');

            // When doing drawing move
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            await doMove(FIRST_MOVE, true);
            // For some reason doMove call the two update (without time then time only) very close to each other
            // Provoking a call to a timeout workaround so the two update are applied sequencially and not parallelly
            tick(1000);

            // Then removeObservedPart should have been called
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
    });
    describe('Take Back', () => {
        describe('sending/receiving', () => {
            it('should send take back request when player ask to', fakeAsync(async() => {
                // Given a board where its the opponent's (first) turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);

                // When demanding to take back
                spyOn(partService, 'addRequest').and.callThrough();
                await askTakeBack();

                // Then a request should be sent
                expect(partService.addRequest).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'TakeBack');
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should not propose to Player.ONE to take back before his first move', fakeAsync(async() => {
                // Given a board where nobody already played
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);

                // When asking take back, the button should not be here
                testUtils.expectElementNotToExist('#askTakeBackButton');

                // When receiving a new move, it should still not be showed nor possible
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                testUtils.expectElementNotToExist('#askTakeBackButton');

                // When doing the first move, it should become possible, but only once
                await doMove(new QuartoMove(2, 2, QuartoPiece.BBAA), true);
                await askTakeBack();
                testUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should only propose to accept take back when opponent asked', fakeAsync(async() => {
                // Given a board where opponent did not ask to take back and where both player could have ask
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

                // accepting take back should not be proposed
                testUtils.expectElementNotToExist('#acceptTakeBackButton');
                await receiveRequest(Player.ONE, 'TakeBack');

                // Then should allow it after proposing sent
                await acceptTakeBack();
                tick();
                testUtils.detectChanges();

                // and then again not allowing it
                testUtils.expectElementNotToExist('#acceptTakeBackButton');
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should remove take back refusal button after it has been rejected', fakeAsync(async() => {
                // Given a board with previous move
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                testUtils.expectElementNotToExist('#refuseTakeBackButton');
                await receiveRequest(Player.ONE, 'TakeBack');
                spyOn(partService, 'addReply').and.callThrough();

                // When refusing take back
                await refuseTakeBack();
                testUtils.detectChanges();

                // Then a TakeBack rejection reply should have been sent
                testUtils.expectElementNotToExist('#refuseTakeBackButton');
                expect(partService.addReply).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'Reject', 'TakeBack');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should not allow player to play while take back request is waiting for him', fakeAsync(async() => {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await receiveRequest(Player.ONE, 'TakeBack');

                spyOn(partDAO, 'update').and.callThrough();
                await doMove(THIRD_MOVE, true);
                expect(partDAO.update).not.toHaveBeenCalled();

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            xit('should cancel take back request when take back requester do a move', fakeAsync(async() => {
                // REVIEW: what should we do? add a "reject" or just ignore requests that contain a move afterwards
                // Given an initial board where a take back request has been done by user
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
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
                    turn: 3,
                    remainingMsForOne: 1799999,
                    request: null,
                    lastUpdateTime: serverTimestamp(),
                });

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('Should forbid player to ask take back again after refusal', fakeAsync(async() => {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receiveReply(Player.ONE, 'Reject', 'TakeBack');

                testUtils.expectElementNotToExist('#askTakeBackButton');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('Opponent given take back during his turn', () => {
            it('should move board back two turn and call restartCountDown', fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Player.ZERO, 'TakeBack');
                expect(wrapper.gameComponent.getTurn()).toBe(2);
                spyOn(wrapper, 'resetChronoFor').and.callThrough();

                // When accepting opponent's take back
                await acceptTakeBack();

                // Then turn should be changed to 0 and resumeCountDown be called
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should reset opponents chronos to what it was at pre-take-back turn beginning`, fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Player.ZERO, 'TakeBack');

                // When accepting opponent's take back
                spyOn(wrapper, 'resetChronoFor').and.callThrough();
                await acceptTakeBack();

                // Then opponents chrono should have been reset
                expect(wrapper.resetChronoFor).toHaveBeenCalledOnceWith(Player.ZERO);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            xit(`Should reduce opponent's remainingTime, since opponent just played`, fakeAsync(async() => {
                // REVIEW: TODO
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Player.ZERO, 'TakeBack');

                // When accepting opponent's take back
                spyOn(partDAO, 'update').and.callThrough();
                await acceptTakeBack();

                // Then opponents take back request should have include remainingTime and lastTimeMove
                expect(partDAO.update).toHaveBeenCalledWith('configRoomId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ONE.value,
                    },
                    // TODO request: Request.takeBackAccepted(Player.ONE),
                    turn: 0,
                    remainingMsForZero: 1799998,
                    remainingMsForOne: 1799999,
                    lastUpdateTime: serverTimestamp(),
                });
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('Opponent given take back during user turn', () => {
            xit('should move board back one turn and call switchPlayer (for opponent)', fakeAsync(async() => {
                // REVIEW: fail because of chronos
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await receiveRequest(Player.ZERO, 'TakeBack');
                expect(wrapper.gameComponent.getTurn()).toBe(1);
                spyOn(wrapper, 'switchPlayerChronosOnMove').and.callThrough();

                // When accepting opponent's take back
                await acceptTakeBack();
                testUtils.detectChanges();

                // Then turn should be changed to 0 and resumeCountDown be called
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                // REVIEW expect(wrapper.switchPlayerChronosOnMove).toHaveBeenCalledOnceWith(Player.ONE);
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            xit(`Should resumeCountDown for opponent and reset user's time`, fakeAsync(async() => {
                // REVIEW: after chronos
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
                await receiveRequest(Player.ZERO, 'TakeBack');
                testUtils.detectChanges();

                // When accepting opponent's take back after some "thinking" time
                spyOn(wrapper, 'resumeCountDownFor').and.callThrough();
                spyOn(wrapper.chronoZeroGlobal, 'changeDuration').and.callThrough();
                spyOn(partDAO, 'update').and.callThrough();

                const beginningTime: Timestamp = wrapper.currentPart?.data.beginning as Timestamp;
                const lastUpdateTime: Timestamp = wrapper.currentPart?.data.lastUpdateTime as Timestamp;
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
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                expect(wrapper.gameComponent.getTurn()).toBe(2);
                spyOn(wrapper, 'resetChronoFor').and.callThrough();

                // When opponent accept user's take back
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should reset user chronos to what it was at pre-take-back turn beginning', fakeAsync(async() => {
                // Given an initial board where it's user second turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                expect(wrapper.gameComponent.getTurn()).toBe(2);

                // When opponent accept user's take back
                spyOn(wrapper, 'resetChronoFor').and.callThrough();
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');

                // Then user's chronos should start again to what they were at beginning
                expect(wrapper.resetChronoFor).toHaveBeenCalledWith(Player.ZERO);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            xit(`should do alternative move afterwards without taking back move time off (during user's turn)`, fakeAsync(async() => {
                // REVIEW: after time management
                // Given an initial board where user was authorized to take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
                await askTakeBack();
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');

                // When playing alernative move
                spyOn(partDAO, 'update').and.callThrough();
                const ALTERNATIVE_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                await doMove(ALTERNATIVE_MOVE, true);

                // Then partDAO should be updated without including remainingMsFor(any)
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 6,
                        player: Player.ZERO.value,
                    },
                    turn: 1,
                    remainingMsForOne: 1799998,
                    request: null,
                    lastUpdateTime: serverTimestamp(),
                });
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('User given take back during opponent turn', () => {
            it('should move board back one turn and update current player', fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                expect(wrapper.gameComponent.getTurn()).toBe(1);
                spyOn(wrapper, 'switchPlayerChronosOnMove').and.callThrough();

                // When opponent accept user's take back
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            xit(`should resumeCountDown for user without removing time of opponent`, fakeAsync(async() => {
                // REVIEW: after improving chronos
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                spyOn(wrapper, 'resumeCountDownFor').and.callThrough();
                spyOn(partDAO, 'update').and.callThrough();
                await askTakeBack();

                // When opponent accept user's take back
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');

                // Then count down should be resumed and update not changing time
                expect(wrapper.resumeCountDownFor).toHaveBeenCalledWith(Player.ZERO);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            xit('should do alternative move afterwards without taking back move time off (during opponent turn)', fakeAsync(async() => {
                // REVIEW: after timing
                // Given an initial board where opponent just took back the a move
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');

                // When playing alernative move
                spyOn(partDAO, 'update').and.callThrough();
                const ALTERNATIVE_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                await doMove(ALTERNATIVE_MOVE, true);

                // Then partDAO should be updated without including remainingMsFor(any)
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                    lastUpdate: {
                        index: 5,
                        player: Player.ZERO.value,
                    },
                    turn: 1,
                    remainingMsForZero: 1799998,
                    request: null,
                    lastUpdateTime: serverTimestamp(),
                });
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
    });
    describe('Agreed Draw', () => {
        async function setup() {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        }
        it('should send draw request when player asks to', fakeAsync(async() => {
            // Given any board
            await setup();
            spyOn(partService, 'addRequest').and.callThrough();

            // When clicking the propose draw button
            await testUtils.clickElement('#proposeDrawButton');

            // Then a draw request should have been sent
            expect(partService.addRequest).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'Draw')
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
            await receiveReply(Player.ONE, 'Reject', 'Draw');

            testUtils.expectElementNotToExist('#proposeDrawButton');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should finish the game after accepting a proposed draw', fakeAsync(async() => {
            // Given a part on which a draw has been proposed
            await setup();
            await receiveRequest(Player.ONE, 'Draw');
            spyOn(gameService, 'acceptDraw').and.callThrough();
            testUtils.detectChanges();

            // When accepting the draw
            await testUtils.clickElement('#acceptDrawButton');

            // Then the draw is being accepted
            expect(gameService.acceptDraw).toHaveBeenCalledOnceWith('configRoomId', 1, Player.ZERO);
            tick(1); // REVIEW: wtf? test doesn't work without it
            testUtils.detectChanges();
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
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
                request: null,
            }, 3);

            // Then removeObservedPart should have been called
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
        it('should send refusal when player asks to', fakeAsync(async() => {
            await setup();
            await receiveRequest(Player.ONE, 'Draw');

            spyOn(partService, 'addReply').and.callThrough();

            await testUtils.clickElement('#refuseDrawButton');
            expect(partService.addReply).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'Reject', 'Draw');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should only propose to accept/refuse draw when asked', fakeAsync(async() => {
            await setup();
            testUtils.expectElementNotToExist('#acceptDrawButton');
            testUtils.expectElementNotToExist('#refuseDrawButton');
            await receiveRequest(Player.ONE, 'Draw');

            testUtils.expectElementToExist('#acceptDrawButton');
            testUtils.expectElementToExist('#refuseDrawButton');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    describe('End Game Time Management', () => {
        it(`should stop player's global chrono when local reach end`, fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroGlobal, 'stop').and.callThrough();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);
            expect(wrapper.chronoZeroGlobal.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop player's local chrono when global chrono reach end`, fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroTurn, 'stop').and.callThrough();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);
            expect(wrapper.chronoZeroTurn.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop offline opponent's global chrono when local reach end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, true);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneTurn, 'stop').and.callThrough();

            // When he reach time out
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it shoud be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneTurn.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should not notifyTimeout for online opponent`, fakeAsync(async() => {
            // Given an online game where it's the opponent's; opponent is online
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            spyOn(wrapper, 'notifyTimeoutVictory').and.callThrough();
            spyOn(wrapper, 'opponentIsOffline').and.returnValue(true);

            // When opponent reach time out locally
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it should be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
            const winner: MinimalUser = UserMocks.CREATOR_MINIMAL_USER;
            const loser: MinimalUser = UserMocks.OPPONENT_MINIMAL_USER;
            expect(wrapper.notifyTimeoutVictory).toHaveBeenCalledOnceWith(winner, Player.ZERO, 1, loser);
        }));
        xit(`should send opponent their remainingTime after first move`, fakeAsync(async() => {
            // REVIEW TODO: time management will be reimplemented, then we can update this test
            // Given a board where a first move has been made
            await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
            await receiveNewMoves(0, [FIRST_MOVE_ENCODED], 1, 1800 * 1000, 1800 * 1000);
            const beginning: Timestamp = wrapper.currentPart?.data.beginning as Timestamp;
            const firstMoveTime: Timestamp = wrapper.currentPart?.data.lastUpdateTime as Timestamp;
            const msUsedForFirstMove: number = getMillisecondsDifference(beginning, firstMoveTime);

            // When doing the next move
            expect(wrapper.currentPart?.data.remainingMsForZero).toEqual(1800 * 1000);
            await doMove(SECOND_MOVE, true);

            // Then the update sent should have calculated time between creation and first move
            // and should have removed it from remainingMsForZero
            const remainingMsForZero: number = (1800 * 1000) - msUsedForFirstMove;
            expect(wrapper.currentPart?.data.remainingMsForZero)
                .withContext(`Should have sent the opponent its updated remainingTime`)
                .toEqual(remainingMsForZero);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        xit('should update chrono when receiving your remainingTime in the update', fakeAsync(async() => {
            // TODO FOR REVIEW: time management will be updated later
            // Given a board where a first move has been made
            console.log('--- PREPARING')
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper.chronoZeroGlobal, 'changeDuration').and.callThrough();
            console.log('--- FIRST MOVE')
            await doMove(FIRST_MOVE, true);
            expect(wrapper.currentPart?.data.remainingMsForZero).toEqual(1800 * 1000);

            // When receiving new move
            console.log('--- SECOND MOVE')
            await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

            // Then the global chrono of update-player should be updated
            expect(wrapper.chronoZeroGlobal.changeDuration)
                .withContext(`Chrono.ChangeDuration should have been refreshed with update's datas`)
                .toHaveBeenCalledWith(Utils.getNonNullable(wrapper.currentPart?.data.remainingMsForZero));
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('when resigning, lastUpdateTime must be upToDate then remainingMs');
        it('when winning move is done, remainingMs at last turn of opponent must be');
    });
    xdescribe('AddTime feature', () => { // TODO FOR REVIEW: need to fix time management
        describe('creator', () => {
            async function prepareStartedGameForCreator() {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            }
            it('should allow to add local time to opponent', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(partService, 'addAction').and.callThrough();

                // When local countDownComponent emit addTime
                await wrapper.addTurnTime();

                // Then a add time action is generated
                expect(partService.addAction).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'AddTurnTime');
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                tick(msUntilTimeout);
            }));
            it('should resume for both chrono at once when adding time to one', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
                spyOn(wrapper.chronoZeroTurn, 'resume').and.callThrough();

                // When receiving a request to add local time to player zero
                await receiveAction(Player.ZERO, 'AddTurnTime');

                // Then both chronos of player zero should have been resumed
                expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledTimes(1); // it failed, was 0
                expect(wrapper.chronoZeroTurn.resume).toHaveBeenCalledTimes(1); // it worked
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                tick(msUntilTimeout);
            }));
            it('should add time to chrono local when receiving the addTurnTime request (Player.ONE)', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addTurnTime request
                await receiveAction(Player.ONE, 'AddTurnTime');

                // Then chrono local of player one should be increased
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes + 30 sec
                tick(msUntilTimeout);
            }));
            it('should add time to local chrono when receiving the addTurnTime request (Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent on user turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addTurnTime request
                await receiveAction(Player.ZERO, 'AddTurnTime');

                // Then chrono local of player one should be increased
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                expect(wrapper.chronoZeroTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes + 30 sec
                tick(msUntilTimeout);
            }));
            it('should allow to add global time to opponent (as Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent on user's turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(partService, 'addAction').and.callThrough();

                // When countDownComponent emit addGlobalTime
                await wrapper.addGlobalTime();

                // Then a request to add global time to player one should be sent
                expect(partService.addAction).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'AddGlobalTime');
                const msUntilTimeout: number = wrapper.configRoom.maximalMoveDuration * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes
                tick(msUntilTimeout);
            }));
            it('should add time to global chrono when receiving the addGlobalTime request (Player.ONE)', fakeAsync(async() => {
                // Given an onlineGameComponent on user's turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addGlobalTime request
                await receiveAction(Player.ONE, 'AddGlobalTime');

                // Then chrono global of player one should be increased by 5 new minutes
                expect(wrapper.chronoOneGlobal.remainingMs).toBe((30 * 60 * 1000) + (5 * 60 * 1000));
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should add time to global chrono when receiving the addGlobalTime request (Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

                // When receiving addGlobalTime request
                await receiveAction(Player.ZERO, 'AddGlobalTime');

                // Then chrono global of player one should be increased by 5 new minutes
                expect(wrapper.chronoZeroGlobal.remainingMs).toBe((30 * 60 * 1000) + (5 * 60 * 1000));
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should postpone the timeout of chrono and not only change displayed time', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

                // When receiving a addTurnTime request
                await receiveAction(Player.ZERO, 'AddTurnTime');
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
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                spyOn(partService, 'addAction').and.callThrough();

                // When countDownComponent emit addGlobalTime
                await wrapper.addGlobalTime();

                // Then a request to add global time to player zero should be sent
                expect(partService.addAction).toHaveBeenCalledOnceWith('configRoomId', Player.ONE, 'AddGlobalTime');
                const msUntilTimeout: number = wrapper.configRoom.maximalMoveDuration * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes
                tick(msUntilTimeout);
            }));
        });
    });
    describe('User "handshake"', () => {
        xit(`should make opponent's name lightgrey when he is token-outdated`, fakeAsync(async() => {
            // Given a connected opponent
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

            // When the opponent token become too old
            // Creator update his last presence token
            const userService: UserService = TestBed.inject(UserService);
            await userService.updatePresenceToken(UserMocks.CREATOR_AUTH_USER.id);
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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
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
        it('should not allow player to move after resigning', fakeAsync(async() => {
            // Given a component where user has resigned
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
            await testUtils.clickElement('#resignButton');

            // When attempting a move
            spyOn(partDAO, 'update').and.callThrough();
            await doMove(SECOND_MOVE, false);

            // Then it should be refused
            expect(partDAO.update).not.toHaveBeenCalled();
            expectGameToBeOver();
        }));
        it('should display when the opponent resigned', fakeAsync(async() => {
            // Given a board where user has resign
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);
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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves(1, [SECOND_MOVE_ENCODED], 2, 1799999, 1800 * 1000);

            // When receiving opponents submission to our greatness and recognition as overlord of their land
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            await receivePartDAOUpdate({
                winner: UserMocks.CREATOR_MINIMAL_USER,
                loser: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.RESIGN.value,
                request: null,
            }, 3);

            // Then removeObservedPart should be called
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
    });
    describe('getUpdateTypes', () => {
        it('nothing changed = UpdateType.DUPLICATE', fakeAsync(async() => {
            // Given any part
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            const initialPart: Part = {
                lastUpdate: {
                    index: 3,
                    player: 0,
                },
                typeGame: 'P4',
                playerZero: UserMocks.CREATOR_MINIMAL_USER,
                turn: 3,
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
            expect(wrapper.getUpdateTypes(update)).toEqual([UpdateType.DUPLICATE]);
            tick(wrapper.configRoom.maximalMoveDuration * 1000 + 1);
        }));
    });
    describe('rematch', () => {
        it('should show propose button only when game is ended', fakeAsync(async() => {
            // Given a game that is not finished
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            testUtils.expectElementNotToExist('#proposeRematchButton');

            // When it is finished
            await testUtils.expectInterfaceClickSuccess('#resignButton', true);

            // Then it should allow to propose rematch
            testUtils.expectElementToExist('#proposeRematchButton');
        }));
        it('should send proposal request when proposing', fakeAsync(async() => {
            // Given an ended game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.expectInterfaceClickSuccess('#resignButton');

            // When the propose rematch button is clicked
            const gameService: GameService = TestBed.inject(GameService);
            spyOn(gameService, 'proposeRematch').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#proposeRematchButton');
            // For some reason the first onCurrentPartUpdate is not finished when this update arrive, so waiting 1sec
            tick(1000);

            // Then the gameService must be called
            expect(gameService.proposeRematch).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO);
        }));
        it('should show accept/refuse button when proposition has been sent', fakeAsync(async() => {
            // Given an ended game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.expectInterfaceClickSuccess('#resignButton');

            // When request is received
            testUtils.expectElementNotToExist('#acceptRematchButton');
            await receiveRequest(Player.ONE, 'Rematch');
            // For some reason the first onCurrentPartUpdate is not finished when this update arrive, so waiting 1sec
            tick(1000);

            // Then accept/refuse buttons must be shown
            testUtils.detectChanges();
            testUtils.expectElementToExist('#acceptRematchButton');
        }));
        it('should sent accepting request when user accept rematch', fakeAsync(async() => {
            // give a part with rematch request send by opponent
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.expectInterfaceClickSuccess('#resignButton');
            await receiveRequest(Player.ONE, 'Rematch');
            // For some reason the first onCurrentPartUpdate is not finished when this update arrive, so waiting 1sec
            tick(1000);

            // When accepting it
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            const gameService: GameService = TestBed.inject(GameService);
            spyOn(gameService, 'acceptRematch').and.callThrough();
            testUtils.detectChanges();
            await testUtils.expectInterfaceClickSuccess('#acceptRematchButton');

            // Then it should have called acceptRematch
            expect(gameService.acceptRematch).toHaveBeenCalledTimes(1);
        }));
        it('should redirect to new part when rematch is accepted', fakeAsync(async() => {
            // Given a part lost with rematch request send by user
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

            await testUtils.expectInterfaceClickSuccess('#resignButton');
            await testUtils.expectInterfaceClickSuccess('#proposeRematchButton');

            // When opponent accepts it
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            await receiveReply(Player.ONE, 'Accept', 'Rematch', 'nextPartId');
            // For some reason the first onCurrentPartUpdate is not finished when this update arrive, so waiting 1sec
            tick(1000);

            // Then it should redirect to new part
            expectValidRouting(router, ['/nextGameLoading'], NextGameLoadingComponent, { otherRoutes: true });
            expectValidRouting(router, ['/play', 'Quarto', 'nextPartId'], OnlineGameWrapperComponent, { otherRoutes: true });
        }));
    });
    describe('Non Player Experience', () => {
        it('should mark user as Observer when arriving', fakeAsync(async() => {
            // Given a component that is not initialized yet
            await prepareTestUtilsFor(USER_OBSERVER, false, false);

            // When component is initialized
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'updateObservedPart').and.callThrough();
            tick(2);
            testUtils.detectChanges();

            // Then updateObservedPart should have been called as Observer
            const update: Partial<FocusedPart> = {
                id: 'configRoomId',
                opponent: UserMocks.CREATOR_MINIMAL_USER,
                typeGame: 'Quarto',
                role: 'Observer',
            };
            expect(observedPartService.updateObservedPart).toHaveBeenCalledOnceWith(update);

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should remove observedPart when leaving the component', fakeAsync(async() => {
            // Given a part component where user is observer
            await prepareTestUtilsFor(USER_OBSERVER);

            // When user leaves the component (here, destroys it)
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            testUtils.fixture.destroy();

            // Then the observedPart should have been removed
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
        }));
        it('should redirect to lobby when observedPart changed to non-observer', fakeAsync(async() => {
            // Given a part component where user is observer
            await prepareTestUtilsFor(USER_OBSERVER);

            // When observedPart is updated to inform component that user is now candidate in anothergame
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            const observedPart: FocusedPart = FocusedPartMocks.OTHER_CANDIDATE;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then the observedPart should have been removed
            expectValidRouting(router, ['/lobby'], LobbyComponent);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should not removeObservedPart when destroying component after observedPart changed to non-observer', fakeAsync(async() => {
            // Given a part component where user was observer
            // then receive an update telling that user is now non-observer-elsewhere
            await prepareTestUtilsFor(USER_OBSERVER);
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            const observedPart: FocusedPart = FocusedPartMocks.OTHER_CANDIDATE;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // When destroying the component (should normally be triggered once router is triggered)
            testUtils.fixture.destroy();

            // Then the observedPart should have been removed
            expect(observedPartService.removeObservedPart).not.toHaveBeenCalled();
        }));
        it('should not be able to do anything', fakeAsync(async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            await prepareTestUtilsFor(USER_OBSERVER);
            spyOn(wrapper, 'startCountDownFor').and.callFake(() => null);

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
            await prepareTestUtilsFor(USER_OBSERVER);
            spyOn(wrapper, 'startCountDownFor').and.callFake(() => null);
            await receiveRequest(Player.ONE, 'Draw');
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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When the game is displayed
            tick(2);
            testUtils.detectChanges();

            // Then it should highlight the player's names
            testUtils.expectElementToHaveClass('#playerZeroIndicator', 'player0-bg');
            testUtils.expectElementToHaveClass('#playerOneIndicator', 'player1-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should highlight the board with the color of the player when it is their turn', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, false, false);

            // When the component initialize and it is the current player's turn
            tick(2);
            testUtils.detectChanges();

            // Then it should highlight the board with its color
            testUtils.expectElementToHaveClass('#board-tile', 'player0-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should highlight the board in grey when game is over', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

            // When the game is over
            await testUtils.clickElement('#resignButton');

            // Then it should highlight the board with its color
            testUtils.expectElementToHaveClass('#board-tile', 'endgame-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should not highlight the board when it is the turn of the opponent', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

            // When it is not the current player's turn
            await doMove(FIRST_MOVE, true);
            testUtils.detectChanges();

            // Then it should not highlight the board
            testUtils.expectElementNotToHaveClass('#board-tile', 'player1-bg');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
});

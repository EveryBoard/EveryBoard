/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { ConfigRoom } from 'src/app/domain/ConfigRoom';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { GameEventService } from 'src/app/services/GameEventService';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { UserDAO } from 'src/app/dao/UserDAO';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { Action, MGPResult, Part, Reply, RequestType } from 'src/app/domain/Part';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { FocusedPart, User } from 'src/app/domain/User';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { GameWrapperMessages } from '../GameWrapper';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { GameService } from 'src/app/services/GameService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NextGameLoadingComponent } from '../../normal-component/next-game-loading/next-game-loading.component';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
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
import { OGWCTimeManagerService } from './OGWCTimeManagerService';
import { GameStatus } from 'src/app/jscaip/GameStatus';

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

export type PreparationOptions = {
    shorterGlobalClock: boolean;
    waitForPartToStart: boolean;
    runClocks: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace PreparationOptions {
    export const def: PreparationOptions = {
        shorterGlobalClock: false,
        waitForPartToStart: true,
        runClocks: true,
    };
    export const dontWait: PreparationOptions = {
        ...def,
        waitForPartToStart: false,
    };
    export const shortGlobalClock: PreparationOptions = {
        ...def,
        shorterGlobalClock: true,
    };
    export const withoutClocks: PreparationOptions = {
        ...def,
        runClocks: false,
    };
    export const dontWaitNoClocks: PreparationOptions = {
        ...dontWait,
        runClocks: false,
    };
}

export async function prepareStartedGameFor<T extends AbstractGameComponent>(
    user: AuthUser,
    component: string,
    preparationOptions: PreparationOptions = PreparationOptions.def)
: Promise<PreparationResult<T>>
{
    const testUtils: ComponentTestUtils<T, MinimalUser> = await prepareWrapper<T>(user, component);
    testUtils.prepareFixture(OnlineGameWrapperComponent);
    if (preparationOptions.runClocks === false) {
        spyOn(TestBed.inject(OGWCTimeManagerService), 'resumeClocks').and.callFake(async() => {});
    }
    const wrapper: OnlineGameWrapperComponent = testUtils.wrapper as OnlineGameWrapperComponent;
    testUtils.detectChanges();
    tick(1);

    const partCreationId: DebugElement = testUtils.findElement('#partCreation');
    expect(partCreationId).withContext('partCreation id should be present after ngOnInit').toBeTruthy();
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
    let configRoom: ConfigRoom = ConfigRoomMocks.WITH_PROPOSED_CONFIG;
    await configRoomDAO.update('configRoomId', configRoom);
    testUtils.detectChanges();
    if (preparationOptions.shorterGlobalClock === true) {
        configRoom = { ...configRoom, totalPartDuration: 10 };
        await configRoomDAO.update('configRoomId', {
            totalPartDuration: 10,
        });
    }
    const gameService: GameService = TestBed.inject(GameService);
    await gameService.acceptConfig('configRoomId', configRoom);
    testUtils.detectChanges();
    if (preparationOptions.waitForPartToStart === true) {
        tick(2);
        testUtils.detectChanges();
        testUtils.bindGameComponent();
        testUtils.prepareSpies();
    }
    return { testUtils, role };
}

describe('OnlineGameWrapperComponent of Quarto:', () => {

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
    let gameEventService: GameEventService;
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

    let role: PlayerOrNone;

    const FIRST_MOVE: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BABB);

    const SECOND_MOVE: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);

    const THIRD_MOVE: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BABA);

    const FIRST_MOVE_ENCODED: JSONValueWithoutArray = QuartoMove.encoder.encodeMove(FIRST_MOVE);

    const SECOND_MOVE_ENCODED: JSONValueWithoutArray = QuartoMove.encoder.encodeMove(SECOND_MOVE);

    const THIRD_MOVE_ENCODED: JSONValueWithoutArray = QuartoMove.encoder.encodeMove(THIRD_MOVE);

    async function doMove(move: QuartoMove, legal: boolean): Promise<MGPValidation> {
        const state: QuartoState = wrapper.gameComponent.getState() as QuartoState;
        const result: MGPValidation = await wrapper.gameComponent.chooseMove(move, state);
        const message: string = 'move ' + move.toString() + ' should be legal but failed because: ' + result.getReasonOr('no failure');
        expect(result.isSuccess()).withContext(message).toEqual(legal);
        testUtils.detectChanges();
        tick(1);
        return result;
    }
    async function receiveRequest(player: Player, request: RequestType): Promise<void> {
        // As we are mocking the DAO, we can directly add the request ourselves
        // In practice, we should receive this from the other player.
        await gameEventService.addRequest('configRoomId', player, request);
        testUtils.detectChanges();
    }
    async function receiveReply(player: Player, reply: Reply, request: RequestType, data?: JSONValue): Promise<void> {
        // As we are mocking the DAO, we can directly add the reply ourselves
        // In practice, we should receive this from the other player.
        await gameEventService.addReply('configRoomId', player, reply, request, data);
        testUtils.detectChanges();
    }
    async function receiveAction(player: Player, action: Action): Promise<void> {
        // As we are mocking the DAO, we can directly add the action ourselves
        // In practice, we should receive this from the other player.
        await gameEventService.addAction('configRoomId', player, action);
        testUtils.detectChanges();
    }
    async function receivePartDAOUpdate(update: Partial<Part>, detectChanges: boolean = true): Promise<void> {
        // As we are mocking the DAO, we can directly change the part ourselves
        // In practice, we should receive this from the other player.
        await partDAO.update('configRoomId', update);
        if (detectChanges) {
            testUtils.detectChanges();
        }
        tick(1);
    }
    async function askTakeBack(): Promise<void> {
        return await testUtils.clickElement('#proposeTakeBack');
    }
    async function acceptTakeBack(): Promise<void> {
        return await testUtils.clickElement('#accept');
    }
    async function refuseTakeBack(): Promise<void> {
        return await testUtils.clickElement('#reject');
    }
    async function receiveNewMoves(initialTurn: number,
                                   newMoves: JSONValueWithoutArray[],
                                   detectChanges: boolean = true)
    : Promise<void>
    {
        const update: Partial<Part> = {
            turn: initialTurn + newMoves.length,
            request: null,
            lastUpdateTime: serverTimestamp(),
        };
        const gameService: GameService = TestBed.inject(GameService);
        let currentPlayer: Player = Player.of(initialTurn % 2);
        for (const move of newMoves) {
            await gameService.addMove('configRoomId', currentPlayer, move);
            currentPlayer = currentPlayer.getOpponent();
        }
        return await receivePartDAOUpdate(update, detectChanges);
    }
    async function prepareTestUtilsFor(authUser: AuthUser,
                                       options?: PreparationOptions)
    : Promise<void>
    {
        const preparationResult: PreparationResult<QuartoComponent> =
            await prepareStartedGameFor<QuartoComponent>(authUser, 'Quarto', options);
        testUtils = preparationResult.testUtils;
        role = preparationResult.role;
        partDAO = TestBed.inject(PartDAO);
        gameEventService = TestBed.inject(GameEventService);
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
        let offset: number = 0;
        let turn: number = 0;
        if (player === Player.ONE) {
            offset = 1;
            const firstMove: QuartoMove = moves[0];
            const encodedMove: JSONValueWithoutArray = QuartoMove.encoder.encodeMove(firstMove);
            await receiveNewMoves(turn, [encodedMove]);
            turn += 1;
        }
        for (let i: number = offset; i < moves.length; i+=2) {
            const move: QuartoMove = moves[i];
            await doMove(moves[i], true);
            const newMoves: JSONValueWithoutArray[] = [
                QuartoMove.encoder.encodeMove(move),
                QuartoMove.encoder.encodeMove(moves[i+1]),
            ];
            await receiveNewMoves(turn, newMoves);
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
    async function prepareStartedGameWithMoves(encodedMoves: JSONValueWithoutArray[]): Promise<void> {
        // 1. Creating the mocks and testUtils but NOT component
        // 2. Setting the db with the encodedMoves including
        // 3. Setting the component and making it start like it would

        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

        let offset: number = 0;
        let turn: number = 0;
        if (role === Player.ONE) {
            offset = 1;
            const encodedMove: JSONValueWithoutArray = encodedMoves[0];
            await receiveNewMoves(turn, [encodedMove], false);
            turn += 1;
        }
        for (let i: number = offset; i < encodedMoves.length; i++) {
            await receiveNewMoves(turn, [encodedMoves[i]], false);
            turn += 1;
        }
        wrapper = testUtils.wrapper as OnlineGameWrapperComponent;
        testUtils.detectChanges();
        tick(1);
    }
    it('should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
        expect(Utils.getNonNullable(wrapper.currentPlayer).name).toEqual('creator');
    }));
    it('should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        // Given an online game being created
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);
        const partCreationId: DebugElement = testUtils.findElement('#partCreation');
        let quartoTag: DebugElement = testUtils.findElement('app-quarto');
        expect(partCreationId)
            .withContext('partCreation id should be absent after config accepted')
            .toBeFalsy();
        expect(quartoTag)
            .withContext('quarto tag should be absent before config accepted and async ms finished')
            .toBeFalsy();

        testUtils.expectElementNotToExist('#partCreation');
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
    it('should allow sending and receiving moves (creator)', fakeAsync(async() => {
        // Given a started part
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

        // When doing a move
        await doMove(FIRST_MOVE, true);
        // Then the part should be updated
        expect(wrapper.currentPart?.data.turn).toEqual(1);

        // And when receiving a second move
        await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
        // Then the part should also be updated
        expect(wrapper.currentPart?.data.turn).toEqual(2);

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should allow sending and receiving moves (opponent)', fakeAsync(async() => {
        // Given a started part
        await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);

        // When receiving a move
        await receiveNewMoves(0, [FIRST_MOVE_ENCODED]);
        // Then the part should be updated
        expect(wrapper.currentPart?.data.turn).toEqual(1);

        // And when doing a second move
        await doMove(SECOND_MOVE, true);
        // Then the part should also be updated
        expect(wrapper.currentPart?.data.turn).toEqual(2);

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    describe('Late Arrival', () => {
        it('should allow user to arrive late on the game (on their turn)', fakeAsync(async() => {
            // Given a part that has already started (moves have been done)
            await prepareStartedGameWithMoves([FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED]);

            // When arriving and playing
            tick(1);

            // Then the new move should be done
            expect(testUtils.wrapper.gameComponent.getState().turn).toBe(2);
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should allow user to arrive late on the game (not on their turn)', fakeAsync(async() => {
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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);

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
            await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, PreparationOptions.dontWait);

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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);

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
    it('should trigger part change and send the move upon second move', fakeAsync(async() => {
        // Given a part
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        spyOn(partDAO, 'update').and.callThrough();
        spyOn(gameEventService, 'addMove').and.callThrough();
        // When playing a move
        await doMove(FIRST_MOVE, true);
        // Then it should update the part in the DB and send the move
        const expectedUpdate: Partial<Part> = {
            turn: 1,
        };
        expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', expectedUpdate);
        expect(gameEventService.addMove).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, FIRST_MOVE_ENCODED);
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
    it('should allow player to pass when gameComponent allows it', fakeAsync(async() => {
        await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
        testUtils.expectElementNotToExist('#pass');

        wrapper.gameComponent.canPass = true;
        wrapper.gameComponent.pass = async(): Promise<MGPValidation> => {
            return MGPValidation.SUCCESS;
        };
        testUtils.detectChanges();

        await testUtils.clickElement('#pass');

        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    describe('ObservedPart Change', () => {
        it('should redirect to lobby when role and partId change', fakeAsync(async() => {
            // Given a part where the user is observer
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

            // When observedPart is updated to inform component that user is now candidate in a game
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            const observedPart: FocusedPart = FocusedPartMocks.OTHER_CANDIDATE;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then a redirection to lobby should be triggered
            expectValidRouting(router, ['/lobby'], LobbyComponent);
        }));
        it('should not redirect to lobby when role stay "observer" but partId change', fakeAsync(async() => {
            // Given a part where the user is observer
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

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
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

            // When observedPart is updated to inform component that user stopped observing some part in another tab
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            ObservedPartServiceMock.setObservedPart(MGPOptional.empty());

            // Then nothing special should have happened, including no redirection
            // Though compo.observedPart should have been locally changed
            expect(router.navigate).not.toHaveBeenCalled();
            expect(wrapper['observedPart']).toEqual(MGPOptional.empty());
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
            expect(wrapper.gameComponent.node.move.get()).toEqual(FIRST_MOVE);
            expect(partDAOCalled).toBeTrue(); // Ensure the check on update has passed and succeed
            testUtils.fixture.detectChanges();
            testUtils.expectElementToExist('#youWonIndicator');
            expectGameToBeOver();
        }));
        it('should notifyVictory when active player loses', fakeAsync(async() => {
            // Given a board on which user can lose on their turn
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
            expect(wrapper.gameComponent.node.move.get()).toEqual(FIRST_MOVE);
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
            expect(wrapper.gameComponent.node.move.get()).toEqual(FIRST_MOVE);
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
            it('should send take back request when player asks to', fakeAsync(async() => {
                // Given a board where its the opponent's (first) turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);

                // When asking to take back
                spyOn(gameEventService, 'addRequest').and.callThrough();
                await askTakeBack();

                // Then a request should be sent
                expect(gameEventService.addRequest).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'TakeBack');
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should not allow to propose take back after it has been proposed', fakeAsync(async() => {
                // Given a board where a move has been made
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
                await doMove(FIRST_MOVE, true);

                // When asking to take back
                await askTakeBack();
                tick(1);
                testUtils.detectChanges();

                // Then it should not be possible to ask a second time
                testUtils.expectElementNotToExist('#askTakeBack');
            }));
            it('should not propose to Player.ONE to take back before any move', fakeAsync(async() => {
                // Given a board where nobody already played
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, PreparationOptions.withoutClocks);
                // When displaying the page
                // Then the take back button should not be there
                testUtils.expectElementNotToExist('#askTakeBack');
            }));
            it('should not propose to Player.ONE to take back before their first move', fakeAsync(async() => {
                // Given a board where nobody already played
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, PreparationOptions.withoutClocks);
                // When receiving a new move
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED]);
                // Then the take back button should not be there
                testUtils.expectElementNotToExist('#askTakeBack');
            }));
            it('should only propose to accept take back when opponent asked', fakeAsync(async() => {
                // Given a board where opponent did not ask to take back and where both player could have ask
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);

                // accepting take back should not be proposed
                testUtils.expectElementNotToExist('#acceptTakeBack');
                await receiveRequest(Player.ONE, 'TakeBack');

                // Then should allow it after proposing sent
                await acceptTakeBack();
                tick();
                testUtils.detectChanges();

                // and then again not allowing it
                testUtils.expectElementNotToExist('#acceptTakeBack');
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should remove take back rejection button after it has been rejected', fakeAsync(async() => {
                // Given a board with previous move
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
                testUtils.expectElementNotToExist('#refuseTakeBack');
                await receiveRequest(Player.ONE, 'TakeBack');
                spyOn(gameEventService, 'addReply').and.callThrough();

                // When refusing take back
                await refuseTakeBack();
                testUtils.detectChanges();

                // Then a TakeBack rejection reply should have been sent
                testUtils.expectElementNotToExist('#refuseTakeBack');
                expect(gameEventService.addReply).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'Reject', 'TakeBack');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should not allow player to play while take back request is waiting for them', fakeAsync(async() => {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
                await receiveRequest(Player.ONE, 'TakeBack');

                spyOn(partDAO, 'update').and.callThrough();
                await doMove(THIRD_MOVE, true);
                expect(partDAO.update).not.toHaveBeenCalled();

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should cancel take back request when take back requester do a move', fakeAsync(async() => {
                // Given an initial board where a take back request has been done by user
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
                await askTakeBack();

                // When doing move while waiting for answer
                spyOn(gameEventService, 'addMove').and.callThrough();
                await doMove(THIRD_MOVE, true);

                // Then the move should be sent
                expect(gameEventService.addMove).toHaveBeenCalledWith('configRoomId', Player.ZERO, THIRD_MOVE_ENCODED);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should forbid player to ask take back again after refusal', fakeAsync(async() => {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receiveReply(Player.ONE, 'Reject', 'TakeBack');

                testUtils.expectElementNotToExist('#askTakeBack');

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('opponent given take back during their turn', () => {
            it('should move board back two turn', fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER, PreparationOptions.withoutClocks);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED]);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Player.ZERO, 'TakeBack');
                expect(wrapper.gameComponent.getTurn()).toBe(2);

                // When accepting opponent's take back
                await acceptTakeBack();

                // Then turn should be changed to 0
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should preserve opponent's clocks to what it was before asking take back`, fakeAsync(async() => {
                // Given an initial board where it's opponent second turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED]);
                await doMove(SECOND_MOVE, true);
                await receiveRequest(Player.ZERO, 'TakeBack');
                const globalTimeBeforeTakeBack: number = wrapper.chronoZeroGlobal.remainingMs;
                const turnTimeBeforeTakeBack: number = wrapper.chronoZeroTurn.remainingMs;

                // When accepting opponent's take back
                await acceptTakeBack();

                // Then opponents chrono should have continued to decrease
                tick(1000); // wait a bit to ensure time is decreasing
                const globalTimeAfterTakeBack: number = wrapper.chronoZeroGlobal.remainingMs;
                const turnTimeAfterTakeBack: number = wrapper.chronoZeroTurn.remainingMs;
                expect(globalTimeAfterTakeBack).toBeLessThan(globalTimeBeforeTakeBack);
                expect(turnTimeAfterTakeBack).toBeLessThan(turnTimeBeforeTakeBack);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('opponent given take back during user turn', () => {
            it('should move board back one turn', fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED]);
                await receiveRequest(Player.ZERO, 'TakeBack');
                expect(wrapper.gameComponent.getTurn()).toBe(1);

                // When accepting opponent's take back
                await acceptTakeBack();
                testUtils.detectChanges();

                // Then turn should be changed to 0
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is creator's turn.`);
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should resumeCountDown for opponent`, fakeAsync(async() => {
                // Given an initial board where it's user's (first) turn, and opponent asked for take back
                await prepareTestUtilsFor(UserMocks.OPPONENT_AUTH_USER);
                await receiveNewMoves(0, [FIRST_MOVE_ENCODED]);
                await receiveRequest(Player.ZERO, 'TakeBack');
                testUtils.detectChanges();

                // When accepting opponent's take back
                spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
                await acceptTakeBack();
                tick(1);

                // Then count down should be resumed for opponent and user should receive his decision time back
                expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledOnceWith();

                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('User given take back during their turn', () => {
            it('should move board back two turn', fakeAsync(async() => {
                // Given an initial board where it's user (second) turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
                await askTakeBack();
                expect(wrapper.gameComponent.getTurn()).toBe(2);

                // When opponent accepts user's take back
                spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0 and resumeCountDown be called
                expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledOnceWith();
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should do alternative move afterwards without taking back move time off (during user's turn)`, fakeAsync(async() => {
                // Given an initial board where user was authorized to take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
                await askTakeBack();
                testUtils.detectChanges();
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');
                await receivePartDAOUpdate({ turn: 0 }); // go back to turn 0
                tick(1);

                // When playing an alternative move
                spyOn(partDAO, 'update').and.callThrough();
                spyOn(gameEventService, 'addMove').and.callThrough();
                const alternativeMove: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const alternativeMoveEncoded: JSONValueWithoutArray = QuartoMove.encoder.encodeMove(alternativeMove);
                await doMove(alternativeMove, true);

                // Then partDAO should be updated, and move should be sent
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', { turn: 1 });
                expect(gameEventService.addMove).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, alternativeMoveEncoded);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
        describe('User given take back during opponent turn', () => {
            it('should move board back one turn and update current turn', fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                expect(wrapper.gameComponent.getTurn()).toBe(1);

                // When opponent accept user's take back
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');
                const opponentTurnDiv: DebugElement = testUtils.findElement('#currentPlayerIndicator');
                expect(opponentTurnDiv.nativeElement.innerText).toBe(`It is your turn.`);

                // Then turn should be changed to 0
                expect(wrapper.gameComponent.getTurn()).toBe(0);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it(`should resume clock for user`, fakeAsync(async() => {
                // Given an initial board where it's opponent's [second] turn, and user just asked for take back
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                spyOn(wrapper.chronoOneGlobal, 'resume').and.callThrough();
                await askTakeBack();

                // When opponent accept user's take back
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');

                // Then count down should be resumed and update not changing time
                expect(wrapper.chronoOneGlobal.resume).toHaveBeenCalledOnceWith();
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should do alternative move afterwards without taking back move time off (during opponent turn)', fakeAsync(async() => {
                // Given an initial board where opponent just took back a move
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                await doMove(FIRST_MOVE, true);
                await askTakeBack();
                await receiveReply(Player.ONE, 'Accept', 'TakeBack');
                await receivePartDAOUpdate({ turn: 0 }); // go back to turn 0

                // When playing an alernative move
                spyOn(partDAO, 'update').and.callThrough();
                spyOn(gameEventService, 'addMove').and.callThrough();
                const alternativeMove: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBA);
                const alternativeMoveEncoded: JSONValueWithoutArray = QuartoMove.encoder.encodeMove(alternativeMove);
                await doMove(alternativeMove, true);

                // Then partDAO should be updated, and move should be sent
                expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', { turn: 1 });
                expect(gameEventService.addMove).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, alternativeMoveEncoded);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
        });
    });
    describe('Agreed Draw', () => {
        it('should send draw request when player asks to', fakeAsync(async() => {
            // Given any board
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(gameEventService, 'addRequest').and.callThrough();

            // When clicking the propose draw button
            await testUtils.clickElement('#proposeDraw');

            // Then a draw request should have been sent
            expect(gameEventService.addRequest).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'Draw');
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should forbid to propose to draw while draw request is waiting', fakeAsync(async() => {
            // Given a page where we sent a draw request
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.clickElement('#proposeDraw');

            // When displaying it
            testUtils.detectChanges();

            // Then it should not allow us to propose a second draw
            testUtils.expectElementNotToExist('#proposeDraw');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should forbid to play whiledraw request is waiting', fakeAsync(async() => {
            // Given a page where we received a draw request
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveRequest(Player.ONE, 'Draw');
            testUtils.detectChanges();
            const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
            spyOn(messageDisplayer, 'gameMessage').and.callThrough();

            // When ignoring it and trying to play
            await doMove(FIRST_MOVE, true);

            // Then it should fail
            expect(messageDisplayer.gameMessage).toHaveBeenCalledWith(GameWrapperMessages.MUST_ANSWER_REQUEST());
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should forbid to propose to draw after refusal', fakeAsync(async() => {
            // Given a page where we sent a draw request
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.clickElement('#proposeDraw');
            tick(1);

            // When it is rejected
            await receiveReply(Player.ONE, 'Reject', 'Draw');

            // Then we cannot request to draw anymore
            testUtils.expectElementNotToExist('#proposeDraw');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should finish the game after accepting a proposed draw', fakeAsync(async() => {
            // Given a part on which a draw has been proposed
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveRequest(Player.ONE, 'Draw');
            spyOn(gameService, 'acceptDraw').and.callThrough();
            testUtils.detectChanges();

            // When accepting the draw
            await testUtils.clickElement('#accept');

            // Then the draw is being accepted
            expect(gameService.acceptDraw).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO);
            tick(1);
            testUtils.detectChanges();
            testUtils.expectElementToExist('#youAgreedToDrawIndicator');
            expectGameToBeOver();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should finish the game when opponent accepts our proposed draw', fakeAsync(async() => {
            // Given a gameComponent where draw has been proposed
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.clickElement('#proposeDraw');
            tick(1);

            // When draw is accepted
            spyOn(partDAO, 'update').and.callThrough();
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
                request: null,
            });
            await receiveAction(Player.ONE, 'EndGame');

            // Then game should be over
            expectGameToBeOver();
            testUtils.expectElementToExist('#yourOpponentAgreedToDrawIndicator');
            expect(partDAO.update).toHaveBeenCalledTimes(1);
        }));
        it('should removeObservedPart when opponent accepts our proposed draw', fakeAsync(async() => {
            // Given a gameComponent where draw has been proposed
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await testUtils.clickElement('#proposeDraw');
            tick(1);

            // When draw is accepted
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
                request: null,
            });
            await receiveAction(Player.ONE, 'EndGame');

            // Then removeObservedPart should have been called
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
        it('should send refusal when player asks to', fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await receiveRequest(Player.ONE, 'Draw');

            spyOn(gameEventService, 'addReply').and.callThrough();

            await testUtils.clickElement('#reject');
            expect(gameEventService.addReply).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'Reject', 'Draw');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
        it('should only propose to accept/refuse draw when asked', fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            testUtils.expectElementNotToExist('#accept');
            testUtils.expectElementNotToExist('#reject');
            await receiveRequest(Player.ONE, 'Draw');

            testUtils.expectElementToExist('#accept');
            testUtils.expectElementToExist('#reject');

            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
    describe('End Game Time Management', () => {
        it(`should stop player's global clock when turn reaches end`, fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroGlobal, 'stop').and.callThrough();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);
            expect(wrapper.chronoZeroGlobal.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop player's turn clock when global clock reaches end`, fakeAsync(async() => {
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.shortGlobalClock);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroTurn, 'stop').and.callThrough();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ZERO);
            expect(wrapper.chronoZeroTurn.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop opponent's global clock when turn reaches end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();

            // When he reach time out
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it should be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should stop opponent's local clock when global clock reaches end`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.shortGlobalClock);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneTurn, 'stop').and.callThrough();

            // When he reach time out
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it should be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneTurn.stop).toHaveBeenCalledOnceWith();
        }));
        it(`should notifyTimeout for opponent if they are considered offline`, fakeAsync(async() => {
            // Given an online game where it's the opponent's turn and opponent is offline
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            spyOn(wrapper, 'opponentIsOffline').and.returnValue(true);
            spyOn(partDAO, 'update').and.callThrough();

            // When opponent reach time out locally
            tick(wrapper.configRoom.maximalMoveDuration * 1000);

            // Then it should be considered as a timeout
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(Player.ONE);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalledOnceWith();
            expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                winner: UserMocks.CREATOR_MINIMAL_USER,
                loser: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.TIMEOUT.value,
            });
        }));
    });
    describe('Add time feature', () => {
        describe('from creator', () => {
            async function prepareStartedGameForCreator(): Promise<void> {
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            }
            function waitTimeout(): void {
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                tick(msUntilTimeout);
            }
            it('should allow to add turn time to opponent', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(gameEventService, 'addAction').and.callThrough();

                // When creator adds turn time to the opponent
                await wrapper.addTurnTime();

                // Then an add turn time action is generated
                expect(gameEventService.addAction).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'AddTurnTime');
                waitTimeout();
            }));
            it('should resume both clocks at once when adding turn time', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareStartedGameForCreator();
                spyOn(wrapper.chronoZeroGlobal, 'resume').and.callThrough();
                spyOn(wrapper.chronoZeroTurn, 'resume').and.callThrough();

                // When receiving a request to add local time to player zero
                await receiveAction(Player.ZERO, 'AddTurnTime');

                // Then both clocks of player zero should have been resumed
                expect(wrapper.chronoZeroGlobal.resume).toHaveBeenCalledTimes(1);
                expect(wrapper.chronoZeroTurn.resume).toHaveBeenCalledTimes(1);
                waitTimeout();
            }));
            it('should add turn time when receiving AddTurnTime action from Player.ONE', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving AddTurnTime action from player one
                await receiveAction(Player.ONE, 'AddTurnTime');

                // Then the turn time of player zero should be increased
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                // it should be around 2 minutes + 30 seconds
                // (minus the drift it took to process the event, usually 1 or 2ms)
                expect(wrapper.chronoZeroTurn.remainingMs).toBeGreaterThan(msUntilTimeout - 10);
                expect(wrapper.chronoZeroTurn.remainingMs).toBeLessThanOrEqual(msUntilTimeout);
                tick(msUntilTimeout);
            }));
            it('should add turn time when receiving AddTurnTime action from Player.ZERO', fakeAsync(async() => {
                // Given an onlineGameComponent on user turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving AddTurnTime action from player zero
                await receiveAction(Player.ZERO, 'AddTurnTime');

                // Then the turn time of player one should be increased
                const msUntilTimeout: number = (wrapper.configRoom.maximalMoveDuration + 30) * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes + 30 sec
                tick(msUntilTimeout);
            }));
            it('should allow to add global time to opponent (as Player.ZERO)', fakeAsync(async() => {
                // Given an onlineGameComponent on user's turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(gameEventService, 'addAction').and.callThrough();

                // When the player adds global time to the opponent
                await wrapper.addGlobalTime();

                // Then a request to add global time to player one should be sent
                expect(gameEventService.addAction).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO, 'AddGlobalTime');
                const msUntilTimeout: number = wrapper.configRoom.maximalMoveDuration * 1000;
                expect(wrapper.chronoOneTurn.remainingMs).toBe(msUntilTimeout); // initial 2 minutes
                tick(msUntilTimeout);
            }));
            it('should add time to global clock when receiving AddGlobalTime action from Player.ONE', fakeAsync(async() => {
                // Given an onlineGameComponent on user's turn
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
                spyOn(partDAO, 'update').and.callThrough();

                // When receiving addGlobalTime request
                await receiveAction(Player.ONE, 'AddGlobalTime');

                // Then chrono global of player one should be increased by 5 new minutes
                const msUntilTimeout: number = (30 * 60 * 1000) + (5 * 60 * 1000);
                expect(wrapper.chronoZeroGlobal.remainingMs).toBeGreaterThan(msUntilTimeout - 10);
                expect(wrapper.chronoZeroGlobal.remainingMs).toBeLessThanOrEqual(msUntilTimeout);
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should add time to global clock when receiving the AddGlobalTime action from Player.ZERO', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

                // When receiving addGlobalTime request
                await receiveAction(Player.ZERO, 'AddGlobalTime');

                // Then chrono global of player one should be increased by 5 new minutes
                expect(wrapper.chronoOneGlobal.remainingMs).toBe((30 * 60 * 1000) + (5 * 60 * 1000));
                tick(wrapper.configRoom.maximalMoveDuration * 1000);
            }));
            it('should postpone the timeout of chrono and not only change displayed time', fakeAsync(async() => {
                // Given an onlineGameComponent
                await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);

                // When receiving an AddTurnTime action
                await receiveAction(Player.ONE, 'AddTurnTime');
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
                spyOn(gameEventService, 'addAction').and.callThrough();

                // When countDownComponent emit addGlobalTime
                await wrapper.addGlobalTime();

                // Then a request to add global time to player zero should be sent
                expect(gameEventService.addAction).toHaveBeenCalledOnceWith('configRoomId', Player.ONE, 'AddGlobalTime');

                const msUntilTimeout: number = wrapper.configRoom.maximalMoveDuration * 1000;
                tick(msUntilTimeout);
            }));
        });
    });
    describe('User "handshake"', () => {
        // Disabled because we don't have a way to check the connectivity status currently
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
            await testUtils.clickElement('#resign');
            tick(1);

            // Then the game should be ended
            expect(partDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                winner: UserMocks.OPPONENT_MINIMAL_USER,
                loser: UserMocks.CREATOR_MINIMAL_USER,
                result: MGPResult.RESIGN.value,
            });
            expectGameToBeOver();
        }));
        it('should not allow player to move after resigning', fakeAsync(async() => {
            // Given a component where user has resigned
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
            await testUtils.clickElement('#resign');
            tick(1);

            // When attempting a move
            spyOn(partDAO, 'update').and.callThrough();
            await doMove(SECOND_MOVE, false);

            // Then it should be refused
            expect(partDAO.update).not.toHaveBeenCalled();
            expectGameToBeOver();
        }));
        it('should display when the opponent resigned', fakeAsync(async() => {
            // Given a board where the opponent has resigned
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);
            await receivePartDAOUpdate({
                winner: UserMocks.CREATOR_MINIMAL_USER,
                loser: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.RESIGN.value,
                request: null,
            });
            await receiveAction(Player.ONE, 'EndGame');

            // When checking "victory text"
            const resignText: string = testUtils.findElement('#resignIndicator').nativeElement.innerText;

            // Then we should see "opponent has resign"
            expect(resignText).toBe(`firstCandidate has resigned.`);
            expectGameToBeOver();
        }));
        it('should removeObservedPart when the opponent resigned', fakeAsync(async() => {
            // Given a board where user has resign
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves(1, [SECOND_MOVE_ENCODED]);

            // When receiving opponents submission to our greatness and recognition as overlord of their land
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            await receivePartDAOUpdate({
                winner: UserMocks.CREATOR_MINIMAL_USER,
                loser: UserMocks.OPPONENT_MINIMAL_USER,
                result: MGPResult.RESIGN.value,
                request: null,
            });
            await receiveAction(Player.ONE, 'EndGame');

            // Then removeObservedPart should be called
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
            expectGameToBeOver();
        }));
    });
    describe('rematch', () => {
        it('should show propose button only when game is ended', fakeAsync(async() => {
            // Given a game that is not finished
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            testUtils.expectElementNotToExist('#proposeRematch');

            // When it is finished
            await testUtils.expectInterfaceClickSuccess('#resign', true);

            // Then it should allow to propose rematch
            testUtils.expectElementToExist('#proposeRematch');
        }));
        it('should send proposal request when proposing', fakeAsync(async() => {
            // Given an ended game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await testUtils.expectInterfaceClickSuccess('#resign');
            tick(1);
            testUtils.detectChanges();

            // When the propose rematch button is clicked
            const gameService: GameService = TestBed.inject(GameService);
            spyOn(gameService, 'proposeRematch').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#proposeRematch');

            // Then the gameService must be called
            expect(gameService.proposeRematch).toHaveBeenCalledOnceWith('configRoomId', Player.ZERO);
        }));
        it('should show accept/refuse button when proposition has been sent', fakeAsync(async() => {
            // Given an ended game
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await testUtils.expectInterfaceClickSuccess('#resign');
            tick(1);
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
            await testUtils.expectInterfaceClickSuccess('#resign');
            await receiveRequest(Player.ONE, 'Rematch');

            // When accepting it
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            const gameService: GameService = TestBed.inject(GameService);
            spyOn(gameService, 'acceptRematch').and.callThrough();
            tick(1);
            testUtils.detectChanges();
            await testUtils.expectInterfaceClickSuccess('#accept');

            // Then it should have called acceptRematch
            expect(gameService.acceptRematch).toHaveBeenCalledTimes(1);
        }));
        it('should redirect to new part when rematch is accepted', fakeAsync(async() => {
            // Given a part lost with rematch request send by user
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);

            await testUtils.expectInterfaceClickSuccess('#resign');
            tick(1);
            testUtils.detectChanges();
            await testUtils.expectInterfaceClickSuccess('#proposeRematch');

            // When opponent accepts it
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            await receiveReply(Player.ONE, 'Accept', 'Rematch', 'nextPartId');
            await receiveAction(Player.ONE, 'EndGame');

            // Then it should redirect to new part
            expectValidRouting(router, ['/nextGameLoading'], NextGameLoadingComponent, { otherRoutes: true });
            expectValidRouting(router, ['/play', 'Quarto', 'nextPartId'], OnlineGameWrapperComponent, { otherRoutes: true });
        }));
    });
    describe('Non Player Experience', () => {
        it('should mark user as Observer when arriving', fakeAsync(async() => {
            // Given a component that is not initialized yet
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.dontWaitNoClocks);

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
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

            // When user leaves the component (here, destroys it)
            const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
            spyOn(observedPartService, 'removeObservedPart').and.callThrough();
            testUtils.fixture.destroy();

            // Then the observedPart should have been removed
            expect(observedPartService.removeObservedPart).toHaveBeenCalledOnceWith();
        }));
        it('should redirect to lobby when observedPart changed to non-observer', fakeAsync(async() => {
            // Given a part component where user is observer
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);

            // When observedPart is updated to inform component that user is now candidate in another game
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            const observedPart: FocusedPart = FocusedPartMocks.OTHER_CANDIDATE;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));

            // Then the observedPart should have been removed
            expectValidRouting(router, ['/lobby'], LobbyComponent);
        }));
        it('should not removeObservedPart when destroying component after observedPart changed to non-observer', fakeAsync(async() => {
            // Given a part component where user was observer
            // Then receive an update telling that user is now non-observer-elsewhere
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
            // Given a part that we are observing
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
            // which has already some moves
            await receiveNewMoves(0, [FIRST_MOVE_ENCODED, SECOND_MOVE_ENCODED]);
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
        }));
        it('should display that the game is a draw', fakeAsync(async() => {
            // Given a part that the two players agreed to draw
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
            await gameEventService.addRequest('configRoomId', Player.ZERO, 'Draw');
            await receivePartDAOUpdate({
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
                request: null,
            });
            await receiveReply(Player.ONE, 'Accept', 'Draw');
            await receiveAction(Player.ONE, 'EndGame');
            testUtils.detectChanges();

            // When displaying the board
            // Then the text should indicate players have agreed to draw
            testUtils.expectElementToExist('#playersAgreedToDraw');
            expectGameToBeOver();
        }));
        it('should not notify timeout victory', fakeAsync(async() => {
            // Given a part where we are observer
            await prepareTestUtilsFor(USER_OBSERVER, PreparationOptions.withoutClocks);
            spyOn(gameService, 'notifyTimeout').and.callThrough();
            // When a player times out
            await wrapper.reachedOutOfTime(Player.ZERO);
            // Then we should not notify the timeout
            expect(gameService.notifyTimeout).not.toHaveBeenCalled();
        }));
    });
    describe('Visuals', () => {
        it('should highlight each player name in their respective color', fakeAsync(async() => {
            // Given a game that has been started
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);

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
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.dontWait);

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
            await testUtils.clickElement('#resign');
            tick(1);
            testUtils.detectChanges();

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
    describe('onCancelMove', () => {
        it('should delegate to gameComponent.showLastMove', fakeAsync(async() => {
            // Given a any component
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER, PreparationOptions.withoutClocks);
            await doMove(FIRST_MOVE, true);
            const component: QuartoComponent = testUtils.getComponent();
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            testUtils.wrapper.onCancelMove();

            // Then showLastMove should have been called
            expect(component.showLastMove).toHaveBeenCalledOnceWith(FIRST_MOVE);
        }));
        it('should not call gameComponent.showLastMove if there is no move', fakeAsync(async() => {
            // Given a component without previous move
            await prepareTestUtilsFor(UserMocks.CREATOR_AUTH_USER);
            const component: QuartoComponent = testUtils.getComponent();
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            testUtils.wrapper.onCancelMove();

            // Then showLastMove should not have been called
            expect(component.showLastMove).not.toHaveBeenCalled();
            tick(wrapper.configRoom.maximalMoveDuration * 1000);
        }));
    });
});

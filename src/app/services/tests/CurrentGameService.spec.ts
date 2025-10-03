/* eslint-disable max-lines-per-function */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription } from 'rxjs';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CurrentGame } from 'src/app/domain/User';
import { CurrentGameService } from '../CurrentGameService';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { AuthUser, ConnectedUserService, GameActionFailure } from '../ConnectedUserService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { UserService } from '../UserService';
import { prepareUnsubscribeCheck } from 'src/app/utils/tests/TestUtils.spec';
import { BackendServiceMock } from './BackendServiceMock.spec';
import { AbstractBackendService, BackendService } from '../BackendService';

describe('CurrentGameService', () => {

    let currentGameService: CurrentGameService;
    let connectedUserService: ConnectedUserService;
    let userDAO: UserDAO;
    let userService: UserService;
    let alreadyDestroyed: boolean;

    let backendService: BackendServiceMock;

    function updateCurrentGame(currentGame: CurrentGame): void {
        backendService.mockReceivedMessage('CurrentGameUpdate', { currentGame });
        tick(1);
    }

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: UserDAO, useClass: UserDAOMock },
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: BackendService, useClass: BackendServiceMock },
            ],
        }).compileComponents();

        userDAO = TestBed.inject(UserDAO);
        userService = TestBed.inject(UserService);
        connectedUserService = TestBed.inject(ConnectedUserService);
        currentGameService = TestBed.inject(CurrentGameService);
        alreadyDestroyed = false;

        backendService = TestBed.inject(BackendService) as AbstractBackendService as BackendServiceMock;

        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
    });

    describe('login/logout', () => {
        it('should forget the currentGame when user is disconnected', fakeAsync(async() => {
            // Given a registered and connected user observing a game
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            tick(0);
            let currentGame: MGPOptional<CurrentGame> = MGPOptional.empty();
            const subscription: Subscription =
                currentGameService.subscribeToCurrentGame((newValue: MGPOptional<CurrentGame>) => {
                    currentGame = newValue;
                });
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Player' });
            expect(currentGame.isPresent()).toBeTrue();

            // When connected user logs out
            ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);

            // Then the service does not have an current game anymore
            expect(currentGame.isAbsent()).toBeTrue();
            subscription.unsubscribe();
        }));

        it('should remember the currentGame when user logs in and receives it', fakeAsync(async() => {
            // Given a registered and disconnected user observing a game
            ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
            let currentGame: MGPOptional<CurrentGame> = MGPOptional.empty();
            const subscription: Subscription =
                currentGameService.subscribeToCurrentGame((newValue: MGPOptional<CurrentGame>) => {
                    currentGame = newValue;
                });
            expect(currentGame.isAbsent()).toBeTrue();

            // When disconnected user logs in and receives the current game
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Player' });
            tick(0);

            // Then the service now has current game
            expect(currentGame.isPresent()).toBeTrue();
            subscription.unsubscribe();
        }));

        it('should get the currentGame with getCurrentGame', fakeAsync(async() => {
            // Given a disconnected user
            ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);

            // When disconnected user logs in and receives their current game
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Player' });
            tick(0);

            // Then the service now has a current game
            expect((await currentGameService.getCurrentGame()).isPresent()).toBeTrue();
        }));

    });

    describe('current game', () => {
        it('should update currentGame observable when it receives an update', fakeAsync(async() => {
            // Given a connected user
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            tick(0);
            // and the currentGame observable
            let resolvePromise: () => void;
            const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
                resolvePromise = resolve;
            });
            let lastValue: MGPOptional<CurrentGame> = MGPOptional.empty();
            const subscription: Subscription =
                currentGameService.subscribeToCurrentGame((currentGame: MGPOptional<CurrentGame>) => {
                    lastValue = currentGame;
                    resolvePromise();
                });
            // When a currentGame update is received
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Player' });
            await userHasUpdated;

            // Then the observable should have updated its value
            expect(lastValue).toEqual(MGPOptional.of({ id: '1234', gameName: 'P4', role: 'Player' }));
            subscription.unsubscribe();
        }));

    });

    describe('canUserCreate', () => {
        beforeEach(() => {
            // Given a service observing a player
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
        });

        it('should return SUCCESS if user has no current game', fakeAsync(async() => {
            // Given a ConnectedUserService where user doesn't have any current game

            // When asking if you can create
            const validation: MGPValidation = currentGameService.canUserCreate();

            // Then it's should be authorized
            expect(validation.isSuccess()).toBeTrue();
        }));

        it('should refuse for a player already playing', fakeAsync(async() => {
            // Given a ConnectedUserService where user has a current game
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Player' });

            // When asking if you can create
            const validation: MGPValidation = currentGameService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_PLAYING());
        }));

        it('should refuse for a player already creator', fakeAsync(async() => {
            // Given a ConnectedUserService where user has a current game
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Creator' });

            // When asking if you can create
            const validation: MGPValidation = currentGameService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CREATING());
        }));

        it('should refuse for a player already candidate', fakeAsync(async() => {
            // Given a ConnectedUserService where user has a current game
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Candidate' });

            // When asking if you can create
            const validation: MGPValidation = currentGameService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CANDIDATE());
        }));

        it('should refuse for a player already Chosen Opponent', fakeAsync(async() => {
            // Given a ConnectedUserService where user has a current game
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'ChosenOpponent' });

            // When asking if you can create
            const validation: MGPValidation = currentGameService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT());
        }));

        it('should refuse for a player already Observer', fakeAsync(async() => {
            // Given a ConnectedUserService where user has a current game
            updateCurrentGame({ id: '1234', gameName: 'P4', role: 'Observer' });

            // When asking if you can join some game
            const validation: MGPValidation = currentGameService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_OBSERVING());
        }));

    });

    describe('canUserJoin', () => {

        async function shouldAllowToJoinGame(currentGame: CurrentGame, gameToJoin: string, gameStarted: boolean)
        : Promise<void>
        {
            updateCurrentGame(currentGame);

            // When asking if you can join that specific part again
            const validation: MGPValidation = currentGameService.canUserJoin(gameToJoin, gameStarted);

            // Then it's should be authorized
            expect(validation.isSuccess())
                .withContext('validation should be a success')
                .toBeTrue();
        }
        async function shouldForbidToJoinGame(currentGame: CurrentGame,
                                              partToJoin: string,
                                              gameStarted: boolean,
                                              reason: string)
        : Promise<void>
        {
            updateCurrentGame(currentGame);

            // When asking if you can join that specific part again
            const validation: MGPValidation = currentGameService.canUserJoin(partToJoin, gameStarted);

            // Then it's should be refused
            expect(validation.getReason()).toBe(reason);
        }
        beforeEach(() => {
            // Given a service observing a player
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
        });

        it('should allow user to join started part when user does not have a current game', fakeAsync(async() => {
            // When asking if you can join that specific part again
            const validation: MGPValidation = currentGameService.canUserJoin('some-id', true);

            // Then it's should be authorized
            expect(validation.isSuccess()).toBeTrue();
        }));

        it('should allow user to join unstarted part when user does not have a current game', fakeAsync(async() => {
            // When asking if you can join that specific part again
            const validation: MGPValidation = currentGameService.canUserJoin('some-id', false);

            // Then it's should be authorized
            expect(validation.isSuccess()).toBeTrue();
        }));

        it('should not allow user to join twice the same game', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            // When asking if you can join that specific part again
            const currentGame: CurrentGame = { id: '1234', gameName: 'P4', role: 'Player' };
            await shouldAllowToJoinGame(currentGame, '1234', true);
        }));

        it('should refuse for a player already playing', fakeAsync(async() => {
            // Given a ConnectedUserService where user plays a part
            const currentGame: CurrentGame = { id: '1234', gameName: 'P4', role: 'Player' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_PLAYING();

            // When asking if you can join some started part
            await shouldForbidToJoinGame(currentGame, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidToJoinGame(currentGame, 'some-id', false, reason);
        }));

        it('should refuse for a player already creator', fakeAsync(async() => {
            // Given a ConnectedUserService where user is creating a part
            const currentGame: CurrentGame = { id: '1234', gameName: 'P4', role: 'Creator' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CREATING();

            // When asking if you can join some started part
            await shouldForbidToJoinGame(currentGame, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidToJoinGame(currentGame, 'some-id', false, reason);
        }));

        it('should refuse for a player already candidate', fakeAsync(async() => { // Instable: last failed 2022-08-18
            // Given a ConnectedUserService where user is candidate of a part
            const currentGame: CurrentGame = { id: '1234', gameName: 'P4', role: 'Candidate' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CANDIDATE();

            // When asking if you can join some started part
            await shouldForbidToJoinGame(currentGame, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidToJoinGame(currentGame, 'some-id', false, reason);
        }));

        it('should refuse for a player already Chosen Opponent', fakeAsync(async() => {
            // Given a ConnectedUserService where user is chosen opponent in a part
            const currentGame: CurrentGame = { id: '1234', gameName: 'P4', role: 'ChosenOpponent' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();

            // When asking if you can join some started part
            await shouldForbidToJoinGame(currentGame, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidToJoinGame(currentGame, 'some-id', false, reason);
        }));

        it('should refuse for a player already Observer to join non-started part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const currentGame: CurrentGame = { id: '1234', gameName: 'P4', role: 'Observer' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_OBSERVING();

            // When asking if you can join some unstarted part
            await shouldForbidToJoinGame(currentGame, 'some-id', false, reason);
        }));

        it('should allow for a player already Observer to join a started part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const currentGame: CurrentGame = { id: '1234', gameName: 'P4', role: 'Observer' };

            // When asking if you can join some started part
            await shouldAllowToJoinGame(currentGame, 'some-id', true);
        }));

    });

    describe('unsubscriptions', () => {
        it('should unsubscribe from backend subscription when destroying service', fakeAsync(async() => {
            // TODO: unsubscribe does not seem to be called, yet it should?
            // Given a service on which user is logged in
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            console.log('preparing unsubscribe check')
            const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(backendService, 'setCallback');
            // Since the subscription is done in the constructor, we need to spy it before
            currentGameService = new CurrentGameService(backendService as AbstractBackendService as BackendService,
                                                        connectedUserService);

            // When the service is destroyed
            currentGameService.ngOnDestroy();
            alreadyDestroyed = true;

            // Then it should have unsubscribed from active users
            expectUnsubscribeToHaveBeenCalled();
        }));

        it('should unsubscribe from connectedUserService when destroying service', fakeAsync(async() => {
            // Given a service
            const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(connectedUserService, 'subscribeToUser');
            // Since the subscription is done in the constructor, we need to spy it before
            currentGameService = new CurrentGameService(backendService as AbstractBackendService as BackendService,
                                                        connectedUserService);

            // When the service is destroyed
            currentGameService.ngOnDestroy();
            alreadyDestroyed = true;

            // Then it should have unsubscribed from active users
            expectUnsubscribeToHaveBeenCalled();
        }));

    });

    afterEach(async() => {
        if (alreadyDestroyed === false) {
            currentGameService.ngOnDestroy();
        }
    });

});

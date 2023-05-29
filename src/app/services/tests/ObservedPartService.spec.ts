/* eslint-disable max-lines-per-function */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ObservedPart } from 'src/app/domain/User';
import { ObservedPartService } from '../ObservedPartService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AuthUser, ConnectedUserService, GameActionFailure } from '../ConnectedUserService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ErrorLoggerService } from '../ErrorLoggerService';
import { ErrorLoggerServiceMock } from './ErrorLoggerServiceMock.spec';
import { ObservedPartMocks } from 'src/app/domain/mocks/ObservedPartMocks.spec';
import { prepareUnsubscribeCheck } from 'src/app/utils/tests/TestUtils.spec';
import { UserService } from '../UserService';

export class ObservedPartServiceMock {

    public static setObservedPart(observedPart: MGPOptional<ObservedPart>): void {
        (TestBed.inject(ObservedPartService) as unknown as ObservedPartServiceMock)
            .setObservedPart(observedPart);
    }
    private readonly observedPartRS: ReplaySubject<MGPOptional<ObservedPart>>;

    private observedPart: MGPOptional<ObservedPart> = MGPOptional.empty();

    public constructor() {
        this.observedPartRS = new ReplaySubject<MGPOptional<ObservedPart>>(1);
    }
    public subscribeToObservedPart(callback: (optObservedPart: MGPOptional<ObservedPart>) => void): Subscription {
        return this.observedPartRS.asObservable().subscribe(callback);
    }
    public setObservedPart(observedPart: MGPOptional<ObservedPart>): void {
        this.observedPart = observedPart;
        this.observedPartRS.next(observedPart);
    }
    public async removeObservedPart(observedPart: string): Promise<void> {
        return;
    }
    public canUserCreate(): MGPValidation {
        if (this.observedPart.isAbsent()) {
            return MGPValidation.SUCCESS;
        } else {
            const message: string = ObservedPartService.roleToMessage.get(this.observedPart.get().role).get()();
            return MGPValidation.failure(message);
        }
    }
    public canUserJoin(partId: string, gameStarted: boolean): MGPValidation {
        if (this.observedPart.isAbsent() || this.observedPart.get().id === partId) {
            // Users can join game if they are not in any game
            // Or they can join a game if they are already in this specific game
            return MGPValidation.SUCCESS;
        } else {
            if (gameStarted && this.observedPart.get().role === 'Observer') {
                // User is allowed to observe two different parts
                return MGPValidation.SUCCESS;
            } else {
                // If the other-part is not-started, you cannot (join it and become candidate)
                // if the other-part is started but you are active(aka: non-observer) you cannot join it
                const message: string = ObservedPartService.roleToMessage.get(this.observedPart.get().role).get()();
                return MGPValidation.failure(message);
            }
        }
    }
    public async updateObservedPart(observedPart: ObservedPart): Promise<void> {
        this.observedPartRS.next(MGPOptional.of(observedPart));
    }
    public getObservedPart(): MGPOptional<ObservedPart> {
        return this.observedPart;
    }
}

describe('ObservedPartService', () => {

    let observedPartService: ObservedPartService;
    let connectedUserService: ConnectedUserService;
    let userDAO: UserDAO;
    let userService: UserService;
    const opponentId: string = UserMocks.OPPONENT_AUTH_USER.id;
    let alreadyDestroyed: boolean;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: UserDAO, useClass: UserDAOMock },
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();

        userDAO = TestBed.inject(UserDAO);
        userService = TestBed.inject(UserService);
        connectedUserService = TestBed.inject(ConnectedUserService);
        observedPartService = TestBed.inject(ObservedPartService) //TestBed.inject(ObservedPartService) //  new ObservedPartService(userDAO, connectedUserService);
        alreadyDestroyed = false;

        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
    });
    describe('login/logout', () => {
        it('should forget the observedPart when user is disconnected', fakeAsync(async() => {
            // Given a registered and connected user observing a game
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            tick(1);
            let observedPart: MGPOptional<ObservedPart> = MGPOptional.empty();
            const subscription: Subscription =
                observedPartService.subscribeToObservedPart((newValue: MGPOptional<ObservedPart>) => {
                    observedPart = newValue;
                });
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4' } });
            expect(observedPart.isPresent()).toBeTrue();

           // When connected user logs out
           ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);

           // // Then the service does not have an observed part anymore
           expect(observedPart.isAbsent()).toBeTrue();
           subscription.unsubscribe();
        }));
        it('should remember the observedPart when user logs in', fakeAsync(async() => {
            // Given a registered and disconnected user observing a game
            ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
            let observedPart: MGPOptional<ObservedPart> = MGPOptional.empty();
            const subscription: Subscription =
                observedPartService.subscribeToObservedPart((newValue: MGPOptional<ObservedPart>) => {
                    console.log('observing')
                    console.log(newValue)
                    observedPart = newValue;
                });
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4' } });
            expect(observedPart.isAbsent()).toBeTrue();

            // When disconnected user logs in
            console.log('logging in')
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            tick(1);

            // Then the service now has an observed part
            expect(observedPart.isPresent()).toBeTrue();
            expect(observedPartService.getObservedPart().isPresent()).toBeTrue();

            subscription.unsubscribe();
        }));
        it('should keep observing users even when they are not logged in yet', fakeAsync(async() => {
            // This caused the infamous "part creation after login" bug
            // Given an observed part service with a disconnected user
            ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
            let observedPartSeen: boolean = false;
            const subscription: Subscription =
                observedPartService.subscribeToObservedPart((value: MGPOptional<ObservedPart>) => {
                    observedPartSeen = value.isPresent();
                });

            // When the user logs in and sets an observed part
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            tick(1);
            await userDAO.update(UserMocks.CONNECTED_AUTH_USER.id, { observedPart: { id: '1234', typeGame: 'P4' } });

            // Then the service should know about it
            expect(observedPartSeen).toBeTrue();

            subscription.unsubscribe();
        }));
    });
    describe('observed part', () => {
        it('should update observedPart observable when UserDAO touches it', fakeAsync(async() => {
            // Given a connected user
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            tick(1)
            // and the observedPart observable
            let resolvePromise: () => void;
            const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
                resolvePromise = resolve;
            });
            let lastValue: MGPOptional<ObservedPart> = MGPOptional.empty();
            const subscription: Subscription =
                observedPartService.subscribeToObservedPart((observedPart: MGPOptional<ObservedPart>) => {
                    lastValue = observedPart;
                    resolvePromise();
                });
            // When the UserDAO modifies observedPart in the user document
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4' } });
            await userHasUpdated;

            // Then the observable should have updated its value
            expect(lastValue).toEqual(MGPOptional.of({ id: '1234', typeGame: 'P4' }));
            subscription.unsubscribe();
        }));
        describe('updateObservedPart', () => {
            it('should throw when called whilst no user is logged', fakeAsync(async() => {
                // Given a moment at which service is not observing any user (not even AuthUser.NOT_CONNECTED)
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: Should not call updateObservedPart when not connected';

                // When calling updateObservedPart
                // Then it should throw
                expect(() => observedPartService.updateObservedPart({ id: 'some-part-doc-id' })).toThrowError(expectedError);
            }));
            it('should delegate to userDAO', fakeAsync(async() => {
                // Given a service observing an user
                ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);

                // When asking to update observedPart
                spyOn(userDAO, 'update').and.resolveTo();
                const observedPart: ObservedPart = ObservedPartMocks.CREATOR_WITHOUT_OPPONENT;
                await observedPartService.updateObservedPart(observedPart);

                // Then the userDAO should update the connected user doc
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.CREATOR_MINIMAL_USER.id, { observedPart });
            }));
            it('should merge old observedPart to new when the old is present', fakeAsync(async() => {
                // Given a service that has an old observedPart
                ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
                tick(1);
                const oldValue: ObservedPart = {
                    id: 'old',
                    role: 'Candidate',
                    typeGame: 'old',
                };
                await observedPartService.updateObservedPart(oldValue);

                // When updating it with another value
                spyOn(userDAO, 'update').and.resolveTo();
                const newValue: Partial<ObservedPart> = {
                    id: 'new',
                };
                await observedPartService.updateObservedPart(newValue);

                // Then all value from the update should be there, and the one not mentionned should be from the old one
                const observedPart: ObservedPart = {
                    id: 'new',
                    role: 'Candidate',
                    typeGame: 'old',
                };
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.CREATOR_AUTH_USER.id, { observedPart });
            }));
            it('should throw if observedPart update is incomplete when old observed part is absent (and role missing)', fakeAsync(async() => {
                // Given a service observing an user
                ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);

                // When updating with only one field the part
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: field role should be set before updating observedPart';

                // Then the userDAO should update the connected user doc
                const updatedPart: Partial<ObservedPart> = {
                    id: 'another-id',
                    typeGame: 'whatever',
                };
                expect(() => observedPartService.updateObservedPart(updatedPart)).toThrowError(expectedError);
            }));
            it('should throw if observedPart update is incomplete when old observed part is absent (and typeGame missing)', fakeAsync(async() => {
                // Given a service observing an user
                ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);

                // When updating with only one field the part
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: field typeGame should be set before updating observedPart';

                // Then it should throw
                const updatedPart: Partial<ObservedPart> = {
                    id: 'another-id',
                    role: 'Candidate',
                };
                expect(() => observedPartService.updateObservedPart(updatedPart)).toThrowError(expectedError);
            }));
        });
        describe('removeObservedPart', () => {
            it('should throw when asking to remove whilst no user is logged', fakeAsync(async() => {
                // Given a moment at which service is not observing any user (not even AuthUser.NOT_CONNECTED)
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: Should not call removeObservedPart when not connected';

                // When calling updateObservedPart
                // Then it should throw
                expect(() => observedPartService.removeObservedPart()).toThrowError(expectedError);
            }));
            it('should delegate removal to userDAO', fakeAsync(async() => {
                // Given a service observing an user
                ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);

                // When asking to update observedPart
                spyOn(userDAO, 'update').and.resolveTo();
                await observedPartService.removeObservedPart();

                // Then the userDAO should update the connected user doc
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.CREATOR_MINIMAL_USER.id,
                                                                { observedPart: null });
            }));
        });
    });
    describe('canUserCreate', () => {
        beforeEach(() => {
            // Given a service observing a player
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
        });
        it('should return SUCCESS if user do not observe any part', fakeAsync(async() => {
            // Given a ConnectedUserService where user don't observe any part

            // When asking if you can create
            const validation: MGPValidation = observedPartService.canUserCreate();

            // Then it's should be authorised
            expect(validation.isSuccess()).toBeTrue();
        }));
        it('should refuse for a player already playing', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            console.log('userDAO.update')
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4', role: 'Player' } });

            // When asking if you can create
            console.log('checking now')
            const validation: MGPValidation = observedPartService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_PLAYING());
        }));
        it('should refuse for a player already creator', fakeAsync(async() => { // UNSTABLE: last failed 2022-08-18
            // Given a ConnectedUserService where user observe a part
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4', role: 'Creator' } });

            // When asking if you can create
            const validation: MGPValidation = observedPartService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CREATING());
        }));
        it('should refuse for a player already candidate', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4', role: 'Candidate' } });

            // When asking if you can create
            const validation: MGPValidation = observedPartService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CANDIDATE());
        }));
        it('should refuse for a player already Chosen Opponent', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4', role: 'ChosenOpponent' } });

            // When asking if you can create
            const validation: MGPValidation = observedPartService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT());
        }));
        it('should refuse for a player already Observer', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4', role: 'Observer' } });

            // When asking if you can join some part
            const validation: MGPValidation = observedPartService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_OBSERVING());
        }));
    });
    describe('canUserJoin', () => {

        async function shouldAllowJoinPart(observedPart: ObservedPart, partToJoin: string, gameStarted: boolean)
        : Promise<void>
        {
            await userDAO.update(opponentId, { observedPart });

            // When asking if you can join that specific part again
            const validation: MGPValidation = observedPartService.canUserJoin(partToJoin, gameStarted);

            // Then it's should be authorised
            expect(validation.isSuccess())
                .withContext('validation should be a success')
                .toBeTrue();
        }
        async function shouldForbidJoinPart(observedPart: ObservedPart,
                                            partToJoin: string,
                                            gameStarted: boolean,
                                            reason: string)
        : Promise<void>
        {
            await userDAO.update(opponentId, { observedPart });

            // When asking if you can join that specific part again
            const validation: MGPValidation = observedPartService.canUserJoin(partToJoin, gameStarted);

            // Then it's should be refused
            expect(validation.getReason()).toBe(reason);
        }
        beforeEach(() => {
            // Given a service observing a player
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
        });
        it('should allow user to join started part when user do not observe any part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe don't observe a part
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);

            // When asking if you can join that specific part again
            const validation: MGPValidation = observedPartService.canUserJoin('some-id', true);

            // Then it's should be authorised
            expect(validation.isSuccess()).toBeTrue();
        }));
        it('should allow user to join unstarted part when user do not observe any part', fakeAsync(async() => {
            // Given a ConnectedUserService where user don't observe a part
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);

            // When asking if you can join that specific part again
            const validation: MGPValidation = observedPartService.canUserJoin('some-id', false);

            // Then it's should be authorised
            expect(validation.isSuccess()).toBeTrue();
        }));
        it('should allow user to join twice the same part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            // When asking if you can join that specific part again
            const observedPart: ObservedPart = { id: '1234', typeGame: 'P4', role: 'Player' };
            await shouldAllowJoinPart(observedPart, '1234', true);
        }));
        it('should refuse for a player already playing', fakeAsync(async() => {
            // Given a ConnectedUserService where user plays a part
            const observedPart: ObservedPart = { id: '1234', typeGame: 'P4', role: 'Player' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_PLAYING();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already creator', fakeAsync(async() => {
            // Given a ConnectedUserService where user is creating a part
            const observedPart: ObservedPart = { id: '1234', typeGame: 'P4', role: 'Creator' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CREATING();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already candidate', fakeAsync(async() => { // Instable: last failed 2022-08-18
            // Given a ConnectedUserService where user is candidate of a part
            const observedPart: ObservedPart = { id: '1234', typeGame: 'P4', role: 'Candidate' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CANDIDATE();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already Chosen Opponent', fakeAsync(async() => {
            // Given a ConnectedUserService where user is chosen opponent in a part
            const observedPart: ObservedPart = { id: '1234', typeGame: 'P4', role: 'ChosenOpponent' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already Observer to join non-started part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const observedPart: ObservedPart = { id: '1234', typeGame: 'P4', role: 'Observer' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_OBSERVING();

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should allow for a player already Observer to join a started part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const observedPart: ObservedPart = { id: '1234', typeGame: 'P4', role: 'Observer' };

            // When asking if you can join some started part
            await shouldAllowJoinPart(observedPart, 'some-id', true);
        }));
    });
    describe('unsubscriptions', () => {
        it('should unsubscribe from userService when destroying service', fakeAsync(async() => {
            // Given a service on which user is logged in
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(userService, 'observeUserOnServer');
            // Since the subscription is done in the constructor, we need to spy it before
            observedPartService = new ObservedPartService(userDAO, userService, connectedUserService);

            // When the service is destroyed
            observedPartService.ngOnDestroy();
            alreadyDestroyed = true;

            // Then it should have unsubscribed from active users
            expectUnsubscribeToHaveBeenCalled();
        }));
        it('should unsubscribe from connectedUserService when destroying service', fakeAsync(async() => {
            // Given a service
            const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(connectedUserService, 'subscribeToUser');
            // Since the subscription is done in the constructor, we need to spy it before
            observedPartService = new ObservedPartService(userDAO, userService, connectedUserService);

            // When the service is destroyed
            observedPartService.ngOnDestroy();
            alreadyDestroyed = true;

            // Then it should have unsubscribed from active users
            expectUnsubscribeToHaveBeenCalled();
        }));
    });

    afterEach(async() => {
        if (alreadyDestroyed === false) {
            console.log('destroying')
            observedPartService.ngOnDestroy();
        }
    });
});

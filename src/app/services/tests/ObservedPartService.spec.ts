/* eslint-disable max-lines-per-function */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FocusedPart } from 'src/app/domain/User';
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
import { Part } from 'src/app/domain/Part';
import { FocusedPartMocks } from 'src/app/domain/mocks/FocusedPartMocks.spec';
import { prepareUnsubscribeCheck } from 'src/app/utils/tests/TestUtils.spec';

export class ObservedPartServiceMock {

    public static setObservedPart(observedPart: MGPOptional<FocusedPart>): void {
        (TestBed.inject(ObservedPartService) as unknown as ObservedPartServiceMock)
            .setObservedPart(observedPart);
    }
    private readonly observedPartRS: ReplaySubject<MGPOptional<FocusedPart>>;
    private observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();

    constructor() {
        this.observedPartRS = new ReplaySubject<MGPOptional<FocusedPart>>(1);
    }
    public subscribeToObservedPart(callback: (optFocusedPart: MGPOptional<FocusedPart>) => void): Subscription {
        return this.observedPartRS.asObservable().subscribe(callback);
    }
    public setObservedPart(observedPart: MGPOptional<FocusedPart>): void {
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
            // If user is in no part, he can join one
            // If he is onne part and want to join it again, he can
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
    public async updateObservedPart(observedPart: string): Promise<void> {
        return;
    }
}

describe('ObservedPartService', () => {

    let observedPartService: ObservedPartService;
    let connectedUserService: ConnectedUserService;
    let userDAO: UserDAO;
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
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        connectedUserService = TestBed.inject(ConnectedUserService);
        observedPartService = new ObservedPartService(userDAO, connectedUserService);
        alreadyDestroyed = false;
    });
    it('should remove the observedPart when user is disconnected', async() => {
        // Given a registered and connected user observing a game
        ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
        let resolvePromise: () => void;
        const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
            resolvePromise = resolve;
        });
        let observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();
        const subscription: Subscription =
            observedPartService.subscribeToObservedPart((newValue: MGPOptional<FocusedPart>) => {
                observedPart = newValue;
                console.log('setting timeout 8!')
                window.setTimeout(resolvePromise, 2000);
            });
        await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4' } });
        await userHasUpdated;
        expect(observedPart).toEqual(MGPOptional.of({ id: '1234', typeGame: 'P4' }));

        // When connected user service push "NOT_CONNECTED" throught the observable
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);

        // Then it should have removed the observedPart
        expect(observedPart.isAbsent()).toBeTrue();
        subscription.unsubscribe();
    });
    describe('observed part', () => {
        it('should update observedPart observable when UserDAO touches it', async() => {
            // Given a connected user
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            // and the observedPart observable
            let resolvePromise: () => void;
            const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
                resolvePromise = resolve;
            });
            let lastValue: MGPOptional<FocusedPart> = MGPOptional.empty();
            const subscription: Subscription =
                observedPartService.subscribeToObservedPart((observedPart: MGPOptional<FocusedPart>) => {
                    lastValue = observedPart;
                    console.log('setting timeout 9!')
                    window.setTimeout(resolvePromise, 2000);
                });
            // When the UserDAO modify observedPart in the user document
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4' } });
            await userHasUpdated;

            // Then the observable should have updated its value
            expect(lastValue).toEqual(MGPOptional.of({ id: '1234', typeGame: 'P4' }));
            subscription.unsubscribe();
        });
        describe('updateObservedPart', () => {
            it('should throw when called whilst no user is logged', async() => {
                // Given a moment at which service is not observing any user (not even AuthUser.NOT_CONNECTED)
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: Should not call updateObservedPart when not connected';

                // When calling updateObservedPart
                // Then it should throw
                expect(() => observedPartService.updateObservedPart({ id: 'some-part-doc-id' })).toThrowError(expectedError);
            });
            it('should delegate to userDAO', async() => {
                // Given a service observing an user
                ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);

                // When asking to update observedPart
                spyOn(userDAO, 'update').and.callFake(async(pid: string, u: Partial<Part>) => {});
                const observedPart: FocusedPart = FocusedPartMocks.CREATOR_WITHOUT_OPPONENT;
                await observedPartService.updateObservedPart(observedPart);

                // Then the userDAO should update the connected user doc
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.CREATOR_MINIMAL_USER.id, { observedPart });
            });
        });
        describe('removeObservedPart', () => {
            it('should throw when asking to remove whilst no user is logged', async() => {
                // Given a moment at which service is not observing any user (not even AuthUser.NOT_CONNECTED)
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: Should not call removeObservedPart when not connected';

                // When calling updateObservedPart
                // Then it should throw
                expect(() => observedPartService.removeObservedPart()).toThrowError(expectedError);
            });
            it('should delegate removal to userDAO', async() => {
                // Given a service observing an user
                ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);

                // When asking to update observedPart
                spyOn(userDAO, 'update').and.callFake(async(pid: string, u: Partial<Part>) => {});
                await observedPartService.removeObservedPart();

                // Then the userDAO should update the connected user doc
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.CREATOR_MINIMAL_USER.id,
                                                                { observedPart: null });
            });
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
            await userDAO.update(opponentId, { observedPart: { id: '1234', typeGame: 'P4', role: 'Player' } });

            // When asking if you can create
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

        async function shouldAllowJoinPart(observedPart: FocusedPart, partToJoin: string, gameStarted: boolean)
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
        async function shouldForbidJoinPart(observedPart: FocusedPart,
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
            const observedPart: FocusedPart = { id: '1234', typeGame: 'P4', role: 'Player' };
            await shouldAllowJoinPart(observedPart, '1234', true);
        }));
        it('should refuse for a player already playing', fakeAsync(async() => {
            // Given a ConnectedUserService where user plays a part
            const observedPart: FocusedPart = { id: '1234', typeGame: 'P4', role: 'Player' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_PLAYING();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already creator', fakeAsync(async() => {
            // Given a ConnectedUserService where user is creating a part
            const observedPart: FocusedPart = { id: '1234', typeGame: 'P4', role: 'Creator' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CREATING();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already candidate', fakeAsync(async() => { // Instable: last failed 2022-08-18
            // Given a ConnectedUserService where user is candidate of a part
            const observedPart: FocusedPart = { id: '1234', typeGame: 'P4', role: 'Candidate' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CANDIDATE();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already Chosen Opponent', fakeAsync(async() => {
            // Given a ConnectedUserService where user is chosen opponent in a part
            const observedPart: FocusedPart = { id: '1234', typeGame: 'P4', role: 'ChosenOpponent' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();

            // When asking if you can join some started part
            await shouldForbidJoinPart(observedPart, 'some-id', true, reason);

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should refuse for a player already Observer to join non-started part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const observedPart: FocusedPart = { id: '1234', typeGame: 'P4', role: 'Observer' };
            const reason: string = GameActionFailure.YOU_ARE_ALREADY_OBSERVING();

            // When asking if you can join some unstarted part
            await shouldForbidJoinPart(observedPart, 'some-id', false, reason);
        }));
        it('should allow for a player already Observer to join a started part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const observedPart: FocusedPart = { id: '1234', typeGame: 'P4', role: 'Observer' };

            // When asking if you can join some started part
            await shouldAllowJoinPart(observedPart, 'some-id', true);
        }));
    });
    it('should unsubscribe from userDAO when destroying service', fakeAsync(async() => {
        // Given a service on which user is logged in
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(userDAO, 'subscribeToChanges');
        // Since the subscription is done in the constructor, we need to spy it before
        observedPartService = new ObservedPartService(userDAO, connectedUserService);

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
        observedPartService = new ObservedPartService(userDAO, connectedUserService);

        // When the service is destroyed
        observedPartService.ngOnDestroy();
        alreadyDestroyed = true;

        // Then it should have unsubscribed from active users
        expectUnsubscribeToHaveBeenCalled();
    }));

    afterEach(async() => {
        if (alreadyDestroyed === false) {
            observedPartService.ngOnDestroy();
        }
    });
});

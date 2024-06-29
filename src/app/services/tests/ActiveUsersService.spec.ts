/* eslint-disable max-lines-per-function */
import { ActiveUsersService } from '../ActiveUsersService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { User, UserDocument } from 'src/app/domain/User';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FirestoreCollectionObserver } from 'src/app/dao/FirestoreCollectionObserver';
import { FirestoreCondition } from 'src/app/dao/FirestoreDAO';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';

describe('ActiveUsersService', () => {

    let activeUsersService: ActiveUsersService;

    let userDAO: UserDAO;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: UserDAO, useClass: UserDAOMock },
            ],
        }).compileComponents();
        userDAO = TestBed.inject(UserDAO);
        activeUsersService = TestBed.inject(ActiveUsersService);
    }));
    it('should create', () => {
        expect(activeUsersService).toBeTruthy();
    });
    it('should update list of users when one change', fakeAsync(async() => {
        await activeUsersService.userDAO.set('playerDocId', {
            username: 'premier',
            verified: true,
        });
        let observerCalls: number = 0;
        const subscription: Subscription = activeUsersService.subscribeToActiveUsers((users: UserDocument[]) => {
            if (observerCalls === 1) {
                expect(users).toEqual([{
                    id: 'playerDocId',
                    data: {
                        username: 'nouveau',
                        verified: true,
                    },
                }]);
            }
            observerCalls++;
        });
        await activeUsersService.userDAO.update('playerDocId', { username: 'nouveau' });
        expect(observerCalls).toBe(2);
        subscription.unsubscribe();
    }));
    it('should order', () => {
        const FIRST_USER: User = {
            username: 'first',
            verified: true,
            lastUpdateTime: new Timestamp(1, 3000000),
        };
        const SECOND_USER: User = {
            username: 'second',
            verified: true,
            lastUpdateTime: new Timestamp(2, 3000000),
        };
        const THIRD_USER: User = {
            username: 'third',
            verified: true,
            lastUpdateTime: new Timestamp(3, 3000000),
        };
        const FOURTH_USER: User = {
            username: 'fourth',
            verified: true,
            lastUpdateTime: new Timestamp(4, 3000000),
        };
        const userDocs: UserDocument[] = [
            { id: 'second', data: SECOND_USER },
            { id: 'first', data: FIRST_USER },
            { id: 'fourth', data: FOURTH_USER },
            { id: 'third', data: THIRD_USER },
        ];
        const expectedOrder: UserDocument[] = [
            { id: 'first', data: FIRST_USER },
            { id: 'second', data: SECOND_USER },
            { id: 'third', data: THIRD_USER },
            { id: 'fourth', data: FOURTH_USER },
        ];
        const orderedUserDocs: UserDocument[] = activeUsersService.sort(userDocs);
        expect(expectedOrder).toEqual(orderedUserDocs);
    });
    describe('subscribeToActiveUsers', () => {
        it('should call observingWhere with the right condition', () => {
            // Given an ActiveUsersService
            spyOn(userDAO, 'observingWhere').and.callFake(
                (query: FirestoreCondition[], callback: FirestoreCollectionObserver<User>): Subscription => {
                    const expectedParameters: FirestoreCondition[] = [
                        ['state', '==', 'online'],
                        ['verified', '==', true],
                    ];
                    expect(query).toEqual(expectedParameters);
                    return new Subscription();
                });

            // When subscribing to the active users
            const subscription: Subscription = activeUsersService.subscribeToActiveUsers(() => {});
            // Then it should call observingWhere from the DAO with the right parameters
            expect(userDAO.observingWhere).toHaveBeenCalledTimes(1);
            subscription.unsubscribe();
        });
        it('should not duplicate users when we subscribe a second time', fakeAsync(async() => {
            // Given an active users service where we subscribed in the past
            await userDAO.set('userId', {
                username: 'premier',
                verified: true,
            });
            let seenActiveUsers: UserDocument[] = [];
            let activeUsersSubscription: Subscription = activeUsersService.subscribeToActiveUsers(
                (activeUsers: UserDocument[]) => {
                    seenActiveUsers = activeUsers;
                });
            activeUsersSubscription.unsubscribe();

            // When subscribing a second time
            activeUsersSubscription = activeUsersService.subscribeToActiveUsers(
                (activeUsers: UserDocument[]) => {
                    seenActiveUsers = activeUsers;
                });

            // Then there should be exactly one part seen
            expect(seenActiveUsers.length).toBe(1);
            activeUsersSubscription.unsubscribe();
        }));
    });
});

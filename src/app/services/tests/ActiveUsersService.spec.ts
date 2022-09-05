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

    let service: ActiveUsersService;

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
        service = TestBed.inject(ActiveUsersService);
    }));
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('Should update list of users when one change', fakeAsync(async() => {
        await service.userDAO.set('playerDocId', {
            username: 'premier',
            state: 'online',
            verified: true,
        });
        let observerCalls: number = 0;
        const subscription: Subscription = service.subscribeToActiveUsers((users: UserDocument[]) => {
            if (observerCalls === 1) {
                expect(users).toEqual([{
                    id: 'playerDocId',
                    data: {
                        username: 'nouveau',
                        state: 'online',
                        verified: true,
                    },
                }]);
            }
            observerCalls++;
        });
        await service.userDAO.update('playerDocId', { username: 'nouveau' });
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
        const orderedUserDocs: UserDocument[] = service.sort(userDocs);
        expect(expectedOrder).toEqual(orderedUserDocs);
    });
    describe('observeActiveUsers', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirestoreCollectionObserver<User> = new FirestoreCollectionObserver<User>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(userDAO, 'observingWhere');
            service.observeActiveUsers(callback);
            const parameters: FirestoreCondition[] = [
                ['state', '==', 'online'],
                ['verified', '==', true],
            ];
            expect(userDAO.observingWhere).toHaveBeenCalledWith(parameters, callback);
        });
    });
});

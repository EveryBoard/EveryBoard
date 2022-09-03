/* eslint-disable max-lines-per-function */
import { ActiveUsersService } from '../ActiveUsersService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { User, UserDocument } from 'src/app/domain/User';
import { fakeAsync } from '@angular/core/testing';
import { Timestamp } from 'firebase/firestore';

describe('ActiveUsersService', () => {

    let activeUsersService: ActiveUsersService;

    beforeEach(() => {
        activeUsersService = new ActiveUsersService(new UserDAOMock() as unknown as UserDAO);
    });
    it('should create', () => {
        expect(activeUsersService).toBeTruthy();
    });
    it('Should update list of users when one change', fakeAsync(async() => {
        await activeUsersService.userDAO.set('playerDocId', {
            username: 'premier',
            state: 'online',
            verified: true,
        });
        activeUsersService.startObserving();
        let observerCalls: number = 0;
        activeUsersService.activeUsersObs.subscribe((users: UserDocument[]) => {
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
        await activeUsersService.userDAO.update('playerDocId', { username: 'nouveau' });
        expect(observerCalls).toBe(2);
        activeUsersService.stopObserving();
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
});

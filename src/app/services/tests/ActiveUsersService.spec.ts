/* eslint-disable max-lines-per-function */
import { ActiveUsersService } from '../ActiveUsersService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { User, UserDocument } from 'src/app/domain/User';
import { fakeAsync } from '@angular/core/testing';

describe('ActiveUsersService', () => {

    let service: ActiveUsersService;

    beforeEach(() => {
        service = new ActiveUsersService(new UserDAOMock() as unknown as UserDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('Should update list of users when one change', fakeAsync(async() => {
        await service.userDAO.set('playerDocId', {
            username: 'premier',
            state: 'online',
            verified: true,
        });
        service.startObserving();
        let observerCalls: number = 0;
        service.activeUsersObs.subscribe((users: UserDocument[]) => {
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
        service.stopObserving();
    }));
    it('should order', () => {
        const FIRST_USER: User = {
            username: 'first',
            verified: true,
            last_changed: { seconds: 1, nanoseconds: 3000000 },
        };
        const SECOND_USER: User = {
            username: 'second',
            verified: true,
            last_changed: { seconds: 2, nanoseconds: 3000000 },
        };
        const THIRD_USER: User = {
            username: 'third',
            verified: true,
            last_changed: { seconds: 3, nanoseconds: 3000000 },
        };
        const FOURTH_USER: User = {
            username: 'fourth',
            verified: true,
            last_changed: { seconds: 4, nanoseconds: 3000000 },
        };
        const joueurIds: UserDocument[] = [
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
        const orderedJoueursId: UserDocument[] = service.sort(joueurIds);
        expect(expectedOrder).toEqual(orderedJoueursId);
    });
});

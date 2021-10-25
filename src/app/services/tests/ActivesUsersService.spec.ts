import { ActivesUsersService } from '../ActivesUsersService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { IUser, IUserId } from 'src/app/domain/iuser';
import { fakeAsync } from '@angular/core/testing';

describe('ActivesUsersService', () => {

    let service: ActivesUsersService;

    beforeEach(() => {
        service = new ActivesUsersService(new UserDAOMock() as unknown as UserDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('Should update list of users when one change', fakeAsync(async() => {
        service.userDAO.set('playerDocId', {
            username: 'premier',
            state: 'online',
            verified: true,
        });
        service.startObserving();
        let observerCalls: number = 0;
        service.activesUsersObs.subscribe((users: IUserId[]) => {
            if (observerCalls === 1) {
                expect(users).toEqual([{
                    id: 'playerDocId',
                    doc: {
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
        const FIRST_USER: IUser = {
            username: 'first',
            verified: true,
            last_changed: { seconds: 1, nanoseconds: 3000000 },
        };
        const SECOND_USER: IUser = {
            username: 'second',
            verified: true,
            last_changed: { seconds: 2, nanoseconds: 3000000 },
        };
        const THIRD_USER: IUser = {
            username: 'third',
            verified: true,
            last_changed: { seconds: 3, nanoseconds: 3000000 },
        };
        const FOURTH_USER: IUser = {
            username: 'fourth',
            verified: true,
            last_changed: { seconds: 4, nanoseconds: 3000000 },
        };
        const joueurIds: IUserId[] = [
            { id: 'second', doc: SECOND_USER },
            { id: 'first', doc: FIRST_USER },
            { id: 'fourth', doc: FOURTH_USER },
            { id: 'third', doc: THIRD_USER },
        ];
        const expectedOrder: IUserId[] = [
            { id: 'first', doc: FIRST_USER },
            { id: 'second', doc: SECOND_USER },
            { id: 'third', doc: THIRD_USER },
            { id: 'fourth', doc: FOURTH_USER },
        ];
        const orderedJoueursId: IUserId[] = service.order(joueurIds);
        expect(expectedOrder).toEqual(orderedJoueursId);
    });
});

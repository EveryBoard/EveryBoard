import { ActivesUsersService } from '../ActivesUsersService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { IJoueurId } from 'src/app/domain/iuser';
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
        service.joueursDAO.set('playerDocId', {
            username: 'premier',
            state: 'online',
        });
        service.startObserving();
        let observerCalls: number = 0;
        service.activesUsersObs.subscribe((users: IJoueurId[]) => {
            if (observerCalls === 1) {
                expect(users).toEqual([{
                    id: 'playerDocId',
                    doc: {
                        username: 'nouveau',
                        state: 'online',
                    },
                }]);
            }
            observerCalls++;
        });
        await service.joueursDAO.update('playerDocId', { username: 'nouveau' });
        expect(observerCalls).toBe(2);
        service.stopObserving();
    }));
    it('should order', () => {
        const joueurIds: IJoueurId[] = [
            { id: 'second', doc: { username: 'second', last_changed: { seconds: 2, nanoseconds: 3000000 } } },
            { id: 'first', doc: { username: 'first', last_changed: { seconds: 1, nanoseconds: 3000000 } } },
            { id: 'fourth', doc: { username: 'fourth', last_changed: { seconds: 4, nanoseconds: 3000000 } } },
            { id: 'third', doc: { username: 'third', last_changed: { seconds: 3, nanoseconds: 3000000 } } },
        ];
        const expectedOrder: IJoueurId[] = [
            { id: 'first', doc: { username: 'first', last_changed: { seconds: 1, nanoseconds: 3000000 } } },
            { id: 'second', doc: { username: 'second', last_changed: { seconds: 2, nanoseconds: 3000000 } } },
            { id: 'third', doc: { username: 'third', last_changed: { seconds: 3, nanoseconds: 3000000 } } },
            { id: 'fourth', doc: { username: 'fourth', last_changed: { seconds: 4, nanoseconds: 3000000 } } },
        ];
        const orderedJoueursId: IJoueurId[] = service.order(joueurIds);
        expect(expectedOrder).toEqual(orderedJoueursId);
    });
});

import { ActivesUsersService } from './ActivesUsersService';
import { JoueursDAO } from 'src/app/dao/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/tests/JoueursDAOMock.spec';
import { IJoueurId } from 'src/app/domain/iuser';
import { fakeAsync } from '@angular/core/testing';

describe('ActivesUsersService', () => {
    let service: ActivesUsersService;

    beforeEach(() => {
        service = new ActivesUsersService(new JoueursDAOMock() as unknown as JoueursDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('Should update list of users when one change', fakeAsync(async() => {
        service.joueursDAO.set('playerDocId', {
            pseudo: 'premier',
            state: 'online',
        });
        service.startObserving();
        let observerCalls: number = 0;
        service.activesUsersObs.subscribe((users: IJoueurId[]) => {
            if (observerCalls === 1) {
                expect(users).toEqual([{
                    id: 'playerDocId',
                    doc: {
                        pseudo: 'nouveau',
                        state: 'online',
                    },
                }]);
            }
            observerCalls++;
        });
        await service.joueursDAO.update('playerDocId', { pseudo: 'nouveau' });
        expect(observerCalls).toBe(2);
        service.stopObserving();
    }));
    it('should order', () => {
        const joueurIds: IJoueurId[] = [
            { id: 'second', doc: { pseudo: 'second', last_changed: { seconds: 2 } } },
            { id: 'first', doc: { pseudo: 'first', last_changed: { seconds: 1 } } },
            { id: 'fourth', doc: { pseudo: 'fourth', last_changed: { seconds: 4 } } },
            { id: 'third', doc: { pseudo: 'third', last_changed: { seconds: 3 } } },
        ];
        const expectedOrder: IJoueurId[] = [
            { id: 'first', doc: { pseudo: 'first', last_changed: { seconds: 1 } } },
            { id: 'second', doc: { pseudo: 'second', last_changed: { seconds: 2 } } },
            { id: 'third', doc: { pseudo: 'third', last_changed: { seconds: 3 } } },
            { id: 'fourth', doc: { pseudo: 'fourth', last_changed: { seconds: 4 } } },
        ];
        const orderedJoueursId: IJoueurId[] = service.order(joueurIds);
        expect(expectedOrder).toEqual(orderedJoueursId);
    });
});

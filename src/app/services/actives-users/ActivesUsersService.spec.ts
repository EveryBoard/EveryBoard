import {ActivesUsersService} from './ActivesUsersService';
import {JoueursDAO} from 'src/app/dao/joueurs/JoueursDAO';
import {INCLUDE_VERBOSE_LINE_IN_TEST} from 'src/app/app.module';
import {JoueursDAOMock} from 'src/app/dao/joueurs/JoueursDAOMock';
import {IJoueurId} from 'src/app/domain/iuser';

describe('ActivesUsersService', () => {
    let service: ActivesUsersService;

    beforeAll(() => {
        ActivesUsersService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || ActivesUsersService.VERBOSE;
    });
    beforeEach(() => {
        service = new ActivesUsersService(new JoueursDAOMock() as unknown as JoueursDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
        service.startObserving();
        service.stopObserving();
    });
    it('should order', () => {
        const joueurIds: IJoueurId[] = [
            {id: 'second', doc: {pseudo: 'second', last_changed: {seconds: 2}}},
            {id: 'first', doc: {pseudo: 'first', last_changed: {seconds: 1}}},
            {id: 'fourth', doc: {pseudo: 'fourth', last_changed: {seconds: 4}}},
            {id: 'third', doc: {pseudo: 'third', last_changed: {seconds: 3}}},
        ];
        const expectedOrder: IJoueurId[] = [
            {id: 'first', doc: {pseudo: 'first', last_changed: {seconds: 1}}},
            {id: 'second', doc: {pseudo: 'second', last_changed: {seconds: 2}}},
            {id: 'third', doc: {pseudo: 'third', last_changed: {seconds: 3}}},
            {id: 'fourth', doc: {pseudo: 'fourth', last_changed: {seconds: 4}}},
        ];
        const orderedJoueursId: IJoueurId[] = service.order(joueurIds);
        expect(expectedOrder).toEqual(orderedJoueursId);
    });
});

import { async } from '@angular/core/testing';

import { ActivesUsersService } from './ActivesUsersService';
import { JoueursDAO } from 'src/app/dao/JoueursDAO';

const joueursDAOStub = {
};
describe('ActivesUsersService', () => {

    let service: ActivesUsersService;

    beforeAll(() => {
        ActivesUsersService.IN_TESTING = true;
    });
    beforeEach(() => {
        service = new ActivesUsersService(joueursDAOStub as JoueursDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    afterAll(() => {
        ActivesUsersService.IN_TESTING = false;
    });
});
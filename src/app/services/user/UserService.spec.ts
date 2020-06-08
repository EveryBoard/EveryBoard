import { async } from '@angular/core/testing';

import { UserService } from './UserService';
import { ActivesUsersService } from '../actives-users/ActivesUsersService';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { Router } from '@angular/router';

const routerStub = {
};
const activesUsersServiceStub = {
};
const userDaoStub = {
};
describe('UserService', () => {

    let service: UserService;

    beforeAll(() => {
        UserService.IN_TESTING = true;
    });
    beforeEach(() => {
        service = new UserService(routerStub as Router,
                                  activesUsersServiceStub as ActivesUsersService,
                                  userDaoStub as JoueursDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    afterAll(() => {
        UserService.IN_TESTING = false;
    });
});
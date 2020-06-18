import { async } from '@angular/core/testing';

import { UserService } from './UserService';
import { ActivesUsersService } from '../actives-users/ActivesUsersService';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { Router } from '@angular/router';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';

const routerStub = {
};
describe('UserService', () => {

    let service: UserService;

    beforeEach(() => {
        const joueursDAOMock: JoueursDAOMock = new JoueursDAOMock();
        service = new UserService(routerStub as Router,
                                  new ActivesUsersService(joueursDAOMock as unknown as JoueursDAO),
                                  joueursDAOMock as unknown as JoueursDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
});
/* eslint-disable max-lines-per-function */
import { UserService } from '../UserService';
import { ActiveUsersService } from '../ActiveUsersService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';

describe('UserService', () => {

    let service: UserService;

    beforeEach(() => {
        const joueursDAOMock: UserDAOMock = new UserDAOMock();
        service = new UserService(new ActiveUsersService(joueursDAOMock as unknown as UserDAO),
                                  joueursDAOMock as unknown as UserDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
});

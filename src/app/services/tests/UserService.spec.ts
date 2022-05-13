/* eslint-disable max-lines-per-function */
import { UserService } from '../UserService';
import { ActiveUsersService } from '../ActiveUsersService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';

describe('UserService', () => {

    let service: UserService;

    beforeEach(() => {
        const userDAOMock: UserDAOMock = new UserDAOMock();
        service = new UserService(new ActiveUsersService(userDAOMock as unknown as UserDAO),
                                  userDAOMock as unknown as UserDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
});

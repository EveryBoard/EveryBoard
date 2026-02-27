/* eslint-disable max-lines-per-function */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { serverTimestamp } from 'firebase/firestore';

import { UserDAO } from '../../dao/UserDAO';
import { UserDAOMock } from '../../dao/tests/UserDAOMock.spec';
import { UserService } from '../UserService';

describe('UserService', () => {

    let userService: UserService;

    let userDAO: UserDAO;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: UserDAO, useClass: UserDAOMock },
            ],
        }).compileComponents();
        userDAO = TestBed.inject(UserDAO);
        userService = TestBed.inject(UserService);
    }));
    it('should create', () => {
        expect(userService).toBeTruthy();
    });
    describe('setUsername', () => {
        it('should change the username of a user', async() => {
            spyOn(userDAO, 'update').and.resolveTo();

            // When the username of a user set
            await userService.setUsername('userId', 'foo');

            // Then the username is updated through the DAO
            expect(userDAO.update).toHaveBeenCalledWith('userId', { username: 'foo' });
        });
    });
    describe('updatePresenceToken', () => {
        it('should delegate to update', async() => {
            // Given any situation
            spyOn(userDAO, 'update').and.resolveTo();

            // When calling updatePresenceToken
            await userService.updatePresenceToken('userId');

            // Then update should be called
            expect(userDAO.update).toHaveBeenCalledOnceWith('userId', { lastUpdateTime: serverTimestamp() });
        });
    });

});

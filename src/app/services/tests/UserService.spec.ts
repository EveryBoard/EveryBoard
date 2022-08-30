/* eslint-disable max-lines-per-function */
import { UserService } from '../UserService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { serverTimestamp } from 'firebase/firestore';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('UserService', () => {

    let service: UserService;

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
        service = TestBed.inject(UserService);
    }));
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    describe('setUsername', () => {
        it('should change the username of a user', async() => {
            spyOn(userDAO, 'update').and.resolveTo();

            // When the username of a user set
            await service.setUsername('uid', 'foo');

            // Then the username is updated through the DAO
            expect(userDAO.update).toHaveBeenCalledWith('uid', { username: 'foo' });
        });
    });
    describe('updatePresenceToken', () => {
        it('should delegate to update', async() => {
            // Given any situation
            spyOn(userDAO, 'update').and.resolveTo();

            // When calling updatePresenceToken
            await service.updatePresenceToken('joserId');

            // Then update should be called
            expect(userDAO.update).toHaveBeenCalledOnceWith('joserId', { lastUpdateTime: serverTimestamp() });
        });
    });
});

/* eslint-disable max-lines-per-function */
import { UserService } from '../UserService';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { createConnectedGoogleUser } from 'src/app/services/tests/ConnectedUserService.spec';
import { serverTimestamp } from 'firebase/firestore';
import * as FireAuth from '@angular/fire/auth';
import { User } from 'src/app/domain/User';
import { FirestoreCollectionObserver } from 'src/app/dao/FirestoreCollectionObserver';
import { FirestoreCondition } from 'src/app/dao/FirestoreDAO';
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
    describe('observeUserByUsername', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirestoreCollectionObserver<User> = new FirestoreCollectionObserver<User>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(userDAO, 'observingWhere');
            service.observeUserByUsername('jeanjaja', callback);
            const parameters: FirestoreCondition[] = [
                ['username', '==', 'jeanjaja'],
            ];
            expect(userDAO.observingWhere).toHaveBeenCalledWith(parameters, callback);
        });
    });
    describe('setUsername', () => {
        it('should change the username of a user', async() => {
            // TODOTODO: replace with checking that update is correctly called
            // given a google user
            const user: FireAuth.User = await createConnectedGoogleUser(true);
            const uid: string = user.uid;

            // when its username is set
            await service.setUsername(uid, 'foo');

            // then its username has changed
            const userWithUsername: User = (await userDAO.read(uid)).get();
            expect(userWithUsername.username).toEqual('foo');

            await FireAuth.signOut(TestBed.inject(FireAuth.Auth));
        });
    });
    describe('updatePresenceToken', () => {
        it('should delegate to update', async() => {
            // Given any situation
            spyOn(userDAO, 'update');

            // When calling updatePresenceToken
            await service.updatePresenceToken('joserId');

            // Then update should be called
            expect(userDAO.update).toHaveBeenCalledOnceWith('joserId', { last_changed: serverTimestamp() });
        });
    });
});

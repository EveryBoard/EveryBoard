/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { User } from 'src/app/domain/User';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { UserDAO } from '../UserDAO';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { createConnectedGoogleUser } from 'src/app/services/tests/AuthenticationService.spec';
import * as FireAuth from '@angular/fire/auth';

describe('UserDAO', () => {

    let dao: UserDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('observeUserByUsername', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<User> = new FirebaseCollectionObserver<User>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeUserByUsername('jeanjaja', callback);
            expect(dao.observingWhere).toHaveBeenCalledWith([
                ['username', '==', 'jeanjaja'],
                ['verified', '==', true],
            ],
                                                            callback);
        });
    });
    describe('observeActiveUsers', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<User> = new FirebaseCollectionObserver<User>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeActiveUsers(callback);
            expect(dao.observingWhere).toHaveBeenCalledWith([
                ['state', '==', 'online'],
                ['verified', '==', true],
            ],
                                                            callback);
        });
    });
    describe('setUsername', () => {
        it('should change the username of a user', async() => {
            // given a google user
            const user: FireAuth.User = await createConnectedGoogleUser(true);
            const uid: string = user.uid;

            // when its username is set
            await dao.setUsername(uid, 'foo');

            // then its username has changed
            const userWithUsername: User = (await dao.read(uid)).get();
            expect(userWithUsername.username).toEqual('foo');

            await FireAuth.signOut(TestBed.inject(FireAuth.Auth));
        });
    });
});

/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { User } from 'src/app/domain/User';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { UserDAO } from '../UserDAO';
import { expectFirebasePermissionDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { createConnectedGoogleUser } from 'src/app/services/tests/AuthenticationService.spec';
import * as FireAuth from '@angular/fire/auth';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('UserDAO', () => {

    let dao: UserDAO;

    function signOut(): Promise<void> {
        return TestBed.inject(FireAuth.Auth).signOut();
    }

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
    describe('security', () => {
        it('should authorize connected user to read any other user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createConnectedGoogleUser(true, 'bar@bar.com', 'other-user');
            await signOut();
            await createConnectedGoogleUser(true, 'foo@bar.com', 'user');

            // When trying to read another user
            const otherUserRead: MGPOptional<User> = await dao.read(other.uid);
            // Then it should succeed
            expect(otherUserRead.isPresent()).toBeTrue();
            expect(otherUserRead.get().username).toBe('other-user');
        });
        it('should forbid disconnected user to read any user', async() => {
            // Given an existing user and a disconnected visitor
            const other: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'other-user');
            await signOut();

            // When trying to read a user
            const userRead: Promise<MGPOptional<User>> = dao.read(other.uid);
            // Then it should fail
            await expectFirebasePermissionDenied(userRead);
        });
        it('should authorize to create its own user when it does not exist', async() => {
            // Given an authenticated visitor without the corresponding user in DB
            const token: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            // When setting the user in DB
            const result: Promise<void> = dao.set(credential.user.uid, { verified: false });
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid to create a user with a different id than our own', async() => {
            // Given an existing, logged in user
            await createConnectedGoogleUser(true, 'foo@bar.com', 'user');
            // When trying to set another user in the DB
            const result: Promise<void> = dao.set('some-other-uid', { verified: false });
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should authorize updating its username when not set', async() => {
            // Given an existing, logged in user, without username
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com');
            // When trying to set the username
            const result: Promise<void> = dao.setUsername(user.uid, 'user');
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid updating its username if it is already set', async() => {
            // Given an existing, logged in user, with a username
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'user');
            // When trying to set the username
            const result: Promise<void> = dao.setUsername(user.uid, 'user!');
            // Then it should succeed
            await expectFirebasePermissionDenied(result);
        });
        it('should authorize setting the user to verified when it is', async() => {
            // Given an non-verified user, with a username
            const token: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            await dao.set(credential.user.uid, { verified: false, username: 'user' });

            // When marking the user as verified
            const result: Promise<void> = dao.markVerified(credential.user.uid);
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid setting the user to verified if it has no username', async() => {
            // Given a non-verified user, without a username
            const token: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            await dao.set(credential.user.uid, { verified: false });

            // When marking the user as verified
            const result: Promise<void> = dao.markVerified(credential.user.uid);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid setting the user to verified if it has no verified email', async() => {
            // Given a email user that has not verified its email
            const credential: FireAuth.UserCredential =
                await FireAuth.createUserWithEmailAndPassword(TestBed.inject(FireAuth.Auth),
                                                              'foo@bar.com',
                                                              'jeanjaja123');
            await dao.set(credential.user.uid, { verified: false, username: 'foo' });

            // When marking the user as verified
            const result: Promise<void> = dao.markVerified(credential.user.uid);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid to update the fields another user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createConnectedGoogleUser(true, 'bar@bar.com', 'other-user');
            await signOut();
            await createConnectedGoogleUser(true, 'foo@bar.com', 'user');
            // When trying to change a field of another user
            const result: Promise<void> = dao.update(other.uid, { username: 'jean? jaja!' });
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid to delete its own user', async() => {
            // Given a logged in user
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'user');
            // When trying to delete it
            const result: Promise<void> = dao.delete(user.uid);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid to delete another user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createConnectedGoogleUser(true, 'bar@bar.com', 'other-user');
            await signOut();
            await createConnectedGoogleUser(true, 'foo@bar.com', 'user');
            // When trying to delete the other user
            const result: Promise<void> = dao.delete(other.uid);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
    });
});

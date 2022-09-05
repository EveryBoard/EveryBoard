/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { serverTimestamp } from 'firebase/firestore';
import * as FireAuth from '@angular/fire/auth';
import { User } from 'src/app/domain/User';
import { FirestoreCollectionObserver } from '../FirestoreCollectionObserver';
import { UserDAO } from '../UserDAO';
import { expectPermissionToBeDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { createConnectedGoogleUser, createDisconnectedGoogleUser } from 'src/app/services/tests/ConnectedUserService.spec';
import { FirestoreCondition } from '../FirestoreDAO';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('UserDAO', () => {

    let userDAO: UserDAO;

    beforeEach(async() => {
        await setupEmulators();
        userDAO = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(userDAO).toBeTruthy();
    });
    describe('observeActiveUsers', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirestoreCollectionObserver<User> = new FirestoreCollectionObserver<User>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(userDAO, 'observingWhere');
            userDAO.observeActiveUsers(callback);
            const parameters: FirestoreCondition[] = [
                ['state', '==', 'online'],
                ['verified', '==', true],
            ];
            expect(userDAO.observingWhere).toHaveBeenCalledWith(parameters, callback);
        });
    });
    describe('setUsername', () => {
        it('should change the username of a user', fakeAsync(async() => {
            // given a google user
            const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com');
            const uid: string = user.uid;

            // when its username is set
            await userDAO.setUsername(uid, 'foo');

            // then its username has changed
            const userWithUsername: User = (await userDAO.read(uid)).get();
            expect(userWithUsername.username).toEqual('foo');
        }));
    });
    describe('updatePresenceToken', () => {
        it('should delegate to update', async() => {
            // Given any situation
            spyOn(userDAO, 'update').and.resolveTo();

            // When calling updatePresenceToken
            await userDAO.updatePresenceToken('joserId');

            // Then update should be called
            expect(userDAO.update).toHaveBeenCalledOnceWith('joserId', { lastUpdateTime: serverTimestamp() });
        });
    });
    describe('security', () => {
        it('should authorize connected user to read any other user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createDisconnectedGoogleUser('bar@bar.com', 'other-user');
            await createConnectedGoogleUser('foo@bar.com', 'user');

            // When trying to read another user
            const otherUserRead: MGPOptional<User> = await userDAO.read(other.uid);
            // Then it should succeed
            expect(otherUserRead.isPresent()).toBeTrue();
            expect(otherUserRead.get().username).toBe('other-user');
        });
        it('should allow disconnected user to read any user', async() => {
            // Given an existing user and a disconnected visitor
            const other: FireAuth.User = await createDisconnectedGoogleUser('foo@bar.com', 'other-user');

            // When trying to read a user
            const userRead: MGPOptional<User> = await userDAO.read(other.uid);
            // Then it should succeed
            expect(userRead.isPresent()).toBeTrue();
            expect(userRead.get().username).toBe('other-user');
        });
        it('should authorize to create its own user when it does not exist', async() => {
            // Given an authenticated visitor without the corresponding user in DB
            const token: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            // When setting the user in DB
            const result: Promise<void> = userDAO.set(credential.user.uid, { verified: false });
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid to create a user with a different id than our own', async() => {
            // Given an existing, logged in user
            await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to set another user in the DB
            const result: Promise<void> = userDAO.set('some-other-uid', { verified: false });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should authorize updating its username when not set', async() => {
            // Given an existing, logged in user, without username
            const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com');
            // When trying to set the username
            const result: Promise<void> = userDAO.setUsername(user.uid, 'user');
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid updating its username if it is already set', async() => {
            // Given an existing, logged in user, with a username
            const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to set the username
            const result: Promise<void> = userDAO.setUsername(user.uid, 'user!');
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should authorize setting the user to verified when it is', async() => {
            // Given a non-verified user, with a username
            const token: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            await userDAO.set(credential.user.uid, { verified: false, username: 'user' });

            // When marking the user as verified
            const result: Promise<void> = userDAO.markAsVerified(credential.user.uid);
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid setting the user to verified if it has no username', async() => {
            // Given a non-verified user, without a username
            const token: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            await userDAO.set(credential.user.uid, { verified: false });

            // When marking the user as verified
            const result: Promise<void> = userDAO.markAsVerified(credential.user.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid setting the user to verified if it has no verified email', async() => {
            // Given a email user that has not verified its email
            const credential: FireAuth.UserCredential =
                await FireAuth.createUserWithEmailAndPassword(TestBed.inject(FireAuth.Auth),
                                                              'foo@bar.com',
                                                              'jeanjaja123');
            await userDAO.set(credential.user.uid, { verified: false, username: 'foo' });

            // When marking the user as verified
            const result: Promise<void> = userDAO.markAsVerified(credential.user.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to update the fields another user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createDisconnectedGoogleUser('bar@bar.com', 'other-user');
            await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to change a field of another user
            const result: Promise<void> = userDAO.update(other.uid, { username: 'jean? jaja!' });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to delete its own user', async() => {
            // Given a logged in user
            const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to delete it
            const result: Promise<void> = userDAO.delete(user.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to delete another user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createDisconnectedGoogleUser('bar@bar.com', 'other-user');
            await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to delete the other user
            const result: Promise<void> = userDAO.delete(other.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
    });
});

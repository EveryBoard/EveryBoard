/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { UserDAO } from '../UserDAO';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import * as FireAuth from '@angular/fire/auth';
import { serverTimestamp } from 'firebase/firestore';
import { User } from 'src/app/domain/User';
import { FirestoreCollectionObserver } from '../FirestoreCollectionObserver';
import { UserDAO } from '../UserDAO';
import { expectPermissionToBeDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { createConnectedGoogleUser, createDisconnectedGoogleUser } from 'src/app/services/tests/ConnectedUserService.spec';
import { FirestoreCondition } from '../FirestoreDAO';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('UserDAO', () => {

    let dao: UserDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('security', () => {
        it('should authorize connected user to read any other user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createDisconnectedGoogleUser('bar@bar.com', 'other-user');
            await createConnectedGoogleUser('foo@bar.com', 'user');

            // When trying to read another user
            const otherUserRead: MGPOptional<User> = await dao.read(other.uid);
            // Then it should succeed
            expect(otherUserRead.isPresent()).toBeTrue();
            expect(otherUserRead.get().username).toBe('other-user');
        });
        it('should allow disconnected user to read any user', async() => {
            // Given an existing user and a disconnected visitor
            const other: FireAuth.User = await createDisconnectedGoogleUser('foo@bar.com', 'other-user');

            // When trying to read a user
            const userRead: MGPOptional<User> = await dao.read(other.uid);
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
            const result: Promise<void> = dao.set(credential.user.uid, { verified: false });
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid to create a user with a different id than our own', async() => {
            // Given an existing, logged in user
            await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to set another user in the DB
            const result: Promise<void> = dao.set('some-other-uid', { verified: false });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should authorize updating its username when not set', async() => {
            // Given an existing, logged in user, without username
            const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com');
            // When trying to set the username
            const result: Promise<void> = dao.setUsername(user.uid, 'user');
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid updating its username if it is already set', async() => {
            // Given an existing, logged in user, with a username
            const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to set the username
            const result: Promise<void> = dao.setUsername(user.uid, 'user!');
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should authorize setting the user to verified when it is', async() => {
            // Given a non-verified user, with a username
            const token: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            await dao.set(credential.user.uid, { verified: false, username: 'user' });

            // When marking the user as verified
            const result: Promise<void> = dao.markAsVerified(credential.user.uid);
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
            const result: Promise<void> = dao.markAsVerified(credential.user.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid setting the user to verified if it has no verified email', async() => {
            // Given a email user that has not verified its email
            const credential: FireAuth.UserCredential =
                await FireAuth.createUserWithEmailAndPassword(TestBed.inject(FireAuth.Auth),
                                                              'foo@bar.com',
                                                              'jeanjaja123');
            await dao.set(credential.user.uid, { verified: false, username: 'foo' });

            // When marking the user as verified
            const result: Promise<void> = dao.markAsVerified(credential.user.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to update the fields another user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createDisconnectedGoogleUser('bar@bar.com', 'other-user');
            await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to change a field of another user
            const result: Promise<void> = dao.update(other.uid, { username: 'jean? jaja!' });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to delete its own user', async() => {
            // Given a logged in user
            const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to delete it
            const result: Promise<void> = dao.delete(user.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to delete another user', async() => {
            // Given an existing user and a logged in user
            const other: FireAuth.User = await createDisconnectedGoogleUser('bar@bar.com', 'other-user');
            await createConnectedGoogleUser('foo@bar.com', 'user');
            // When trying to delete the other user
            const result: Promise<void> = dao.delete(other.uid);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
    });
});

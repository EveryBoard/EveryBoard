/* eslint-disable max-lines-per-function */
import { ReplaySubject, Subscription } from 'rxjs';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { FirebaseError } from '@firebase/app';
import * as FireAuth from '@firebase/auth';
import { serverTimestamp } from 'firebase/firestore';

import { Auth, ConnectedUserService, AuthUser } from '../ConnectedUserService';
import { MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { UserDAO } from 'src/app/dao/UserDAO';
import { ErrorLoggerServiceMock } from './ErrorLoggerServiceMock.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { UserService } from '../UserService';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';

@Injectable()
export class ConnectedUserServiceMock {

    public static setUser(user: AuthUser, notifyObservers: boolean = true, userId: string = 'userId'): void {
        (TestBed.inject(ConnectedUserService) as unknown as ConnectedUserServiceMock)
            .setUser(userId, user, notifyObservers);
    }
    public user: MGPOptional<AuthUser> = MGPOptional.empty();
    public uid: MGPOptional<string> = MGPOptional.empty();

    private readonly userRS: ReplaySubject<AuthUser>;

    public constructor() {
        this.userRS = new ReplaySubject<AuthUser>(1);
    }
    public setUser(userId: string, user: AuthUser, notifyObservers: boolean = true): void {
        if (user === AuthUser.NOT_CONNECTED) {
            this.user = MGPOptional.empty();
            this.uid = MGPOptional.empty();
        } else {
            this.user = MGPOptional.of(user);
            this.uid = MGPOptional.of(userId);
        }
        // In some very specific cases, changing the status of a user in firebase does not notify the observers.
        // This is the case if a user becomes verified.
        if (notifyObservers) {
            this.userRS.next(user);
        }
    }
    public subscribeToUser(callback: (user: AuthUser) => void): Subscription {
        return this.userRS.asObservable().subscribe(callback);
    }
    public async disconnect(): Promise<MGPValidation> {
        if (this.user.isPresent()) {
            this.user = MGPOptional.empty();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Cannot disconnect a non-connected user');
        }
    }
    public async doRegister(_username: string, _email: string, _password: string)
    : Promise<MGPFallible<FireAuth.User>>
    {
        throw new Error('ConnectedUserServiceMock.doRegister not implemented');
    }
    public async sendEmailVerification(): Promise<MGPValidation> {
        throw new Error('ConnectedUserServiceMock.sendEmailVerification not implemented');
    }
    public async doEmailLogin(): Promise<MGPValidation> {
        throw new Error('ConnectedUserServiceMock.doEmailLogin not implemented');
    }
    public async doGoogleLogin(): Promise<MGPValidation> {
        throw new Error('ConnectedUserServiceMock.doGoogleLogin not implemented');
    }
    public async setUsername(_username: string): Promise<MGPValidation> {
        throw new Error('ConnectedUserServiceMock.setUsername not implemented');
    }
    public async setPicture(_url: string): Promise<MGPValidation> {
        throw new Error('ConnectedUserServiceMock.setPicture not implemented');
    }
    public async reloadUser(): Promise<void> {
        if (this.user.isPresent()) {
            this.userRS.next(this.user.get());
        } else {
            throw new Error('ConnectedUserServiceMock: cannot reload user without setting a user first');
        }
    }
    public async sendPasswordResetEmail(): Promise<MGPValidation> {
        throw new Error('ConnectedUserServiceMock.sendPasswordResetEmail not implemented');
    }
    public async sendPresenceToken(): Promise<void> {
        return;
    }
    public async getIdToken(): Promise<string> {
        return 'idToken';
    }
}

function setupAuthTestModule(): Promise<unknown> {
    return setupEmulators();
}

/**
 * Creates a connected google user, which is required to do DB updates in the emulator.
 * When using it, don't forget to sign out the user when the test is done, using:
 * await firebase.auth().signOut();
 */
export async function createConnectedGoogleUser(email: string, username?: string): Promise<FireAuth.User> {
    const userDAO: UserDAO = TestBed.inject(UserDAO);
    // Sign out current user in case there is one
    await FireAuth.signOut(FireAuth.getAuth());
    // Create a new google user
    const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": true}';
    const credential: FireAuth.UserCredential =
        await FireAuth.signInWithCredential(FireAuth.getAuth(), FireAuth.GoogleAuthProvider.credential(token));
    await userDAO.set(credential.user.uid, { verified: false, currentGame: null });
    if (username != null) {
        // This needs to happen in multiple updates to match the security rules
        await userDAO.update(credential.user.uid, { username });
        await userDAO.update(credential.user.uid, { verified: true });
    }
    return credential.user;
}

export async function createConnectedUser(email: string, username: string): Promise<MinimalUser> {
    const user: FireAuth.User = await createConnectedGoogleUser(email, username);
    return { id: user.uid, name: username };
}

export async function createDisconnectedUser(email: string, username: string): Promise<MinimalUser> {
    const user: FireAuth.User = await createConnectedGoogleUser(email, username);
    await FireAuth.signOut(FireAuth.getAuth());
    return { id: user.uid, name: username };
}

export async function reconnectUser(email: string): Promise<void> {
    const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": true}';
    await FireAuth.signInWithCredential(FireAuth.getAuth(),
                                        FireAuth.GoogleAuthProvider.credential(token));
}

export async function createUnverifiedUser(email: string, username: string): Promise<MinimalUser> {
    const userDAO: UserDAO = TestBed.inject(UserDAO);
    const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": false}';
    const credential: FireAuth.UserCredential =
        await FireAuth.signInWithCredential(FireAuth.getAuth(),
                                            FireAuth.GoogleAuthProvider.credential(token));
    await userDAO.set(credential.user.uid, { verified: false, currentGame: null });
    await userDAO.update(credential.user.uid, { username });
    return { id: credential.user.uid, name: username };
}

export function signOut(): Promise<void> {
    return FireAuth.getAuth().signOut();
}

export async function createDisconnectedGoogleUser(email: string, username?: string): Promise<FireAuth.User> {
    const user: FireAuth.User = await createConnectedGoogleUser(email, username);
    await signOut();
    return user;
}

describe('ConnectedUserService', () => {

    let auth: FireAuth.Auth;
    let connectedUserService: ConnectedUserService;
    let userDAO: UserDAO;

    const username: string = 'jeanjaja';
    const email: string = 'jean@jaja.europe';
    const password: string = 'hunter2';

    let alreadyDestroyed: boolean;

    beforeEach(async() => {
        await setupAuthTestModule();
        connectedUserService = TestBed.inject(ConnectedUserService);
        auth = FireAuth.getAuth();
        userDAO = TestBed.inject(UserDAO);
        alreadyDestroyed = false;
    });

    it('should create', fakeAsync(async() => {
        expect(connectedUserService).toBeTruthy();
    }));

    it('should mark user as verified if the user finalized its account but is not yet marked as verified', async() => {
        const userService: UserService = TestBed.inject(UserService);
        spyOn(userService, 'markAsVerified').and.callThrough();

        // Given a registered user that has finalized all steps to verify its account
        const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister(username, email, password);
        expect(result.isSuccess()).toBeTrue();
        const uid: string = result.get().uid;
        await FireAuth.signOut(auth);
        spyOn(connectedUserService, 'emailVerified').and.returnValue(true);

        // When the user appears again
        let resolvePromise: () => void;
        const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
            resolvePromise = resolve;
        });
        const subscription: Subscription = connectedUserService.subscribeToUser((_user: AuthUser) => {
            // Wait 2s to ensure that the handler has the time to mark for verification
            window.setTimeout(resolvePromise, 2000);
        });
        await connectedUserService.doEmailLogin(email, password);
        await userHasUpdated;

        // Then its status is set to verified
        expect(userService.markAsVerified).toHaveBeenCalledWith(uid);

        subscription.unsubscribe();
    });

    describe('register', () => {

        it('should create user upon successful registration', async() => {
            spyOn(connectedUserService, 'createUser').and.callThrough();
            // Given an user that does not exist

            // When the user is registered
            const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister(username, email, password);

            // Then the user is successfully registered and created
            expect(result.isSuccess()).toBeTrue();
            expect(connectedUserService.createUser).toHaveBeenCalledWith(result.get().uid, username);
        });

        it('should fail when trying to register an user with an email that is already registered', async() => {
            // Given an user that already exists
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // When an user with the same email is registered
            const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister('blibli', email, password);

            // Then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This email address is already in use.');
        });

        it('should fail when trying to register an user with an username that is already registered', async() => {
            // Given an user that already exists
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // When an user with the same email is registered
            const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister(username, 'bli@blah.com', password);

            // Then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This username is already in use.');
        });

        it('should fail when trying to register an user with an invalid email', async() => {
            // Given an invalid email address
            const invalidEmail: string = 'blibli';

            // When an user registers with that email
            const result: MGPFallible<FireAuth.User> =
                await connectedUserService.doRegister(username, invalidEmail, password);

            // Then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This email address is invalid.');
        });

        it('should fail when trying to register with a weak password', async() => {
            // Given an weak password
            const weakPassword: string = '1';

            // When an user registers with that password
            const result: MGPFallible<FireAuth.User> =
                await connectedUserService.doRegister(username, email, weakPassword);

            // Then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('Your password is too weak, please use a stronger password.');
        });
    });

    describe('sendEmailVerification', () => {

        it('should send the email verification', async() => {
            // Given a user that just registered and hence is not verified
            const userRegistrationResult: MGPFallible<FireAuth.User> =
                await connectedUserService.doRegister(username, email, password);
            expect(userRegistrationResult.isSuccess()).toBeTrue();
            // and that the user is connected
            expect(await connectedUserService.doEmailLogin(email, password)).toBe(MGPValidation.SUCCESS);

            spyOn(Auth, 'sendEmailVerification').and.callThrough();

            // When the email verification is requested
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // Then the email verification has been sent
            const user: FireAuth.User = Utils.getNonNullable(auth.currentUser);
            expect(result).toBe(MGPValidation.SUCCESS);
            expect(Auth.sendEmailVerification).toHaveBeenCalledOnceWith(user);
        });

        it('should fail and log the error if there is no connected user', async() => {
            // Given nothing
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // When the email verification is requested
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // Then it fails because this is not a valid user interaction
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('ConnectedUserService: Unlogged users cannot request for email verification');
            expect(Utils.logError).toHaveBeenCalledWith('ConnectedUserService', 'Unlogged users cannot request for email verification');
        });

        it('should fail if the user already verified its email', async() => {
            // Given a connected user that is registered and verified, for example through a google account
            await createConnectedGoogleUser('foo@bar.com');
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // When the email verification is requested
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // Then it fails because this is not a valid user interaction
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('ConnectedUserService: Verified users should not ask email verification after being verified');
            expect(Utils.logError).toHaveBeenCalledWith('ConnectedUserService', 'Verified users should not ask email verification after being verified');
        });

        it('should fail if there is a genuine error in the email verification process from firebase', async() => {
            // Given a user that just registered and hence is not verified
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            // and that the user is connected
            expect(await connectedUserService.doEmailLogin(email, password)).toBe(MGPValidation.SUCCESS);

            // When the email verification is requested but fails
            const error: FirebaseError = new FirebaseError('auth/too-many-requests', 'Error');
            spyOn(Auth, 'sendEmailVerification').and.rejectWith(error);
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // Then a failure is returned
            expect(result.isFailure()).toBeTrue();
        });

    });

    describe('email login', () => {

        it('should succeed when the password is correct', async() => {
            // Given a registered user
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            await FireAuth.signOut(auth);

            // When logging in with email with the right password
            const result: MGPValidation = await connectedUserService.doEmailLogin(email, password);

            // Then the login succeeds and the current user is set
            expect(result.isSuccess()).toBeTrue();
            expect(Utils.getNonNullable(auth.currentUser).email).toBe(email);
        });

        it('should update user when successfully logging in', async() => {
            // Given a registered user and a listener waiting for user updates
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            await auth.signOut();

            let subscription!: Subscription;
            const updateSeen: Promise<void> = new Promise((resolve: () => void) => {
                subscription = connectedUserService.subscribeToUser((user: AuthUser): void => {
                    if (user.isConnected()) {
                        resolve();
                    }
                });
            });
            await expectAsync(updateSeen).toBePending();

            // When the user is logged in
            expect((await connectedUserService.doEmailLogin(email, password)).isSuccess()).toBeTrue();

            // Then the update has been seen
            await expectAsync(updateSeen).toBeResolved();
            subscription.unsubscribe();
        });

        it('should fail when the password is incorrect', async() => {
            // Given a registered user
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            await auth.signOut();

            // When logging in with email with an incorrect password,
            const result: MGPValidation = await connectedUserService.doEmailLogin(email, 'helaba');

            // Then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered invalid credentials.`);
        });

        it('should fail when the user is not registered', async() => {
            // Given that the user does not exist

            // When trying to log in
            const result: MGPValidation = await connectedUserService.doEmailLogin(email, password);

            // Then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered invalid credentials.`);
        });

    });

    describe('google login', () => {

        it('should delegate to signInPopup and create the user if it does not exist', async() => {
            // Given a non-existing google user
            spyOn(connectedUserService, 'createUser').and.callThrough();
            const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(FireAuth.getAuth(),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            const user: FireAuth.User = credential.user;
            spyOn(Auth, 'signInWithPopup').and.resolveTo(user);

            // When the user registers and connects with google
            const result: MGPValidation = await connectedUserService.doGoogleLogin();

            // Then it succeeded and created the user
            expect(result.isSuccess()).toBeTrue();
            const provider: FireAuth.GoogleAuthProvider = new FireAuth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            expect(Auth.signInWithPopup).toHaveBeenCalledWith(auth, provider);
            expect(connectedUserService.createUser).toHaveBeenCalledWith(user.uid);
        });

        it('should not create the user if it already exists', async() => {
            // Given a disconnected google user
            spyOn(connectedUserService, 'createUser').and.callThrough();
            const user: FireAuth.User = await createDisconnectedGoogleUser('foo@bar.com');
            spyOn(Auth, 'signInWithPopup').and.resolveTo(user);

            // When the user connects with google
            const result: MGPValidation = await connectedUserService.doGoogleLogin();

            // Then it should have succeeded
            expect(result.isSuccess()).toBeTrue();
            const provider: FireAuth.GoogleAuthProvider = new FireAuth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            expect(Auth.signInWithPopup).toHaveBeenCalledWith(auth, provider);
            expect(connectedUserService.createUser).not.toHaveBeenCalled();
        });

        it('should fail if google login also fails', async() => {
            // Given a google user that will fail to connect
            const error: FirebaseError = new FirebaseError('auth/invalid-credential', 'Invalid credential');
            spyOn(Auth, 'signInWithPopup').and.rejectWith(error);

            // When the user tries to connect but fails
            const result: MGPValidation = await connectedUserService.doGoogleLogin();

            // Then it failed
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('The credential is invalid or has expired, please try again.');
        });

    });

    describe('disconnect', () => {

        it('should fail if there is no user connected', async() => {
            // Given that no user is connected
            await signOut();

            // When trying to disconnect
            const result: MGPValidation = await connectedUserService.disconnect();

            // Then it fails
            expect(result).toEqual(MGPValidation.failure('Cannot disconnect a non-connected user'));
        });

        it('should succeed if a user is connected, and disconnected the user', async() => {
            // Given a registered and connected user
            const registrationResult: MGPFallible<FireAuth.User> =
                await connectedUserService.doRegister(username, email, password);
            expect(registrationResult.isSuccess()).toBeTrue();
            await connectedUserService.doEmailLogin(email, password);

            // When trying to disconnect
            const result: MGPValidation = await connectedUserService.disconnect();

            // Then it succeeds
            expect(result).toBe(MGPValidation.SUCCESS);

            // and there is no current user
            expect(auth.currentUser).toBeNull();
        });

    });

    describe('mapFirebaseError', () => {

        it('should call logError when encountering an unsupported error', async() => {
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // Given an unsupported error
            const error: FirebaseError = new FirebaseError('auth/unknown-error', 'Error message');

            // When mapping it
            connectedUserService.mapFirebaseError(error);

            // Then logError is called
            expect(Utils.logError).toHaveBeenCalledWith('ConnectedUserService', 'Unsupported firebase error', { errorCode: 'auth/unknown-error', errorMessage: 'Error message' });
        });

        it('should map the errors encountered in the wild but that we cannot reproduce in a test environment', async() => {
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const errorCodes: string[] = [
                'auth/too-many-requests',
                'auth/popup-closed-by-user',
                'auth/popup-blocked',
            ];

            for (const code of errorCodes) {
                // Given an error
                const error: FirebaseError = new FirebaseError(code, 'Error message');

                // When mapping it
                connectedUserService.mapFirebaseError(error);

                // Then it is properly handled
                expect(Utils.logError).not.toHaveBeenCalled();
            }
        });

    });

    describe('setUsername', () => {

        beforeEach(async() => {
            // Given a registered and logged in user
            await createConnectedGoogleUser('foo@bar.com');
        });

        it('should update the username', async() => {
            // When the username is set
            const newUsername: string = 'grandgaga';
            const result: MGPValidation = await connectedUserService.setUsername(newUsername);

            // Then the username is updated
            expect(result.isSuccess()).toBeTrue();
        });

        it('should not throw upon failure', async() => {
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // When the username is set but fails
            const error: FirebaseError = new FirebaseError('unknown/error', 'Error');
            spyOn(Auth, 'updateProfile').and.rejectWith(error);
            const result: MGPValidation = await connectedUserService.setUsername(username);

            // Then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('Error');
            expect(Utils.logError).toHaveBeenCalledOnceWith('ConnectedUserService', 'Unsupported firebase error', { errorCode: 'unknown/error', errorMessage: 'Error' });
        });

        it('should reject empty usernames', async() => {
            // When the username is set to an empty username
            const result: MGPValidation = await connectedUserService.setUsername('');

            // Then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual(`Your username may not be empty.`);
        });

        it('should reject existing usernames', async() => {
            const userService: UserService = TestBed.inject(UserService);
            // When the username is set to an username that is not available
            spyOn(userService, 'usernameIsAvailable').and.resolveTo(false);
            const result: MGPValidation = await connectedUserService.setUsername('not-available');

            // Then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual(`This username is already in use, please select a different one.`);
        });

    });

    describe('setPicture', () => {

        it('should update the picture', async() => {
            // Given a registered and logged in user
            await createConnectedGoogleUser('foo@bar.com');

            // When the picture is set
            const photoURL: string = 'http://my.pic/foo.png';
            const result: MGPValidation = await connectedUserService.setPicture(photoURL);

            // Then the picture is updated
            expect(result.isSuccess()).toBeTrue();
            expect(Utils.getNonNullable(auth.currentUser).photoURL).toEqual(photoURL);
        });

        it('should not throw upon failure', async() => {
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // Given a registered and logged in user
            await createConnectedGoogleUser('foo@bar.com');

            // When the picture is set but fails
            const error: FirebaseError = new FirebaseError('unknown/error', 'Error');
            spyOn(Auth, 'updateProfile').and.rejectWith(error);
            const result: MGPValidation = await connectedUserService.setPicture('http://my.pic/foo.png');

            // Then it fails and logs the error
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('Error');
            expect(Utils.logError).toHaveBeenCalledOnceWith('ConnectedUserService', 'Unsupported firebase error', { errorCode: 'unknown/error', errorMessage: 'Error' });
        });

    });

    describe('sendPasswordResetEmail', () => {

        it('should delegate to Auth.sendPasswordResetEmail', async() => {
            spyOn(Auth, 'sendPasswordResetEmail').and.callThrough();
            // Given a registered user
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // When asking for password reset
            const result: MGPValidation = await connectedUserService.sendPasswordResetEmail(email);

            // Then it should have delegated and succeeded
            expect(result.isSuccess()).toBeTrue();
            expect(Auth.sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
        });

        it('should properly map errors', async() => {
            // Given a user that doesn't exist
            const unexistingEmail: string = 'foo@jaja.com';
            const error: FirebaseError = new FirebaseError('auth/user-not-found', 'Error');
            spyOn(Auth, 'sendPasswordResetEmail').and.rejectWith(error);

            // When asking for password reset
            const result: MGPValidation = await connectedUserService.sendPasswordResetEmail(unexistingEmail);

            // Then it should fail
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('You have entered invalid credentials.');
        });

    });

    it('should unsubscribe from auth subscription upon destruction', () => {
        // eslint-disable-next-line dot-notation
        spyOn(connectedUserService['authSubscription'], 'unsubscribe').and.callThrough();

        // When the service is destroyed
        connectedUserService.ngOnDestroy();
        alreadyDestroyed = true;

        // Then it unsubscribed
        // eslint-disable-next-line dot-notation
        expect(connectedUserService['authSubscription'].unsubscribe).toHaveBeenCalledWith();
    });

    describe('sendPresenceToken', () => {

        it('should throw when asking to send presence token while no user is logged', fakeAsync(() => {
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const expectedError: string = 'Assertion failure: Should not call sendPresenceToken when not connected';
            expect(() => connectedUserService.sendPresenceToken()).toThrowError(expectedError);
        }));

        it('should delegate presence token sending to userDAO', async() => {
            // Given a service observing an user
            connectedUserService.user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

            // When asking to send presence token
            spyOn(userDAO, 'update').and.resolveTo();
            await connectedUserService.sendPresenceToken();

            // Then the userDAO should update the connected user doc
            const userDocId: string = UserMocks.CREATOR_MINIMAL_USER.id;
            expect(userDAO.update).toHaveBeenCalledOnceWith(userDocId, { lastUpdateTime: serverTimestamp() });
        });

    });

    it('should throw when encountering a non-firebase error', () => {
        // Given a non-firebase error
        const error: Error = new Error('some other error');

        // When mapping it
        // Then it should throw
        expect(() => connectedUserService['catchFirebaseError'](error)).toThrow(error);
    });

    describe('getIdToken', () => {
        it('should retrieve id token of the current user', async() => {
            // Given a user
            await connectedUserService.doRegister(username, email, password);
            const user: FireAuth.User = Utils.getNonNullable(auth.currentUser);
            spyOn(user, 'getIdToken').and.callFake(async() => 'MyIdToken');
            // When getting the id token
            const idToken: string = await connectedUserService.getIdToken();
            // Then it should fetch the one of the user
            expect(idToken).toEqual('MyIdToken');
            expect(user.getIdToken).toHaveBeenCalled();
        });
    });

    afterEach(async() => {
        if (alreadyDestroyed === false) {
            connectedUserService.ngOnDestroy();
        }
        await auth.signOut();
    });

});

import { AuthenticationService, AuthUser, RTDB } from '../AuthenticationService';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { fakeAsync, TestBed } from '@angular/core/testing';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Injectable } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Utils } from 'src/app/utils/utils';
import { UserDAO } from 'src/app/dao/UserDAO';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';

class RTDBSpec {
    public static setOfflineMock(): void {
        // We mock setOffline as it should trigger an RTDB function in practice
        spyOn(RTDB, 'setOffline').and.resolveTo();
    }
}

@Injectable()
export class AuthenticationServiceMock {
    public static CONNECTED_UNVERIFIED: AuthUser = new AuthUser('jean@jaja.europe', 'Jean Jaja', false);

    public static CONNECTED: AuthUser = new AuthUser('jean@jaja.europe', 'Jean Jaja', true);

    public static setUser(user: AuthUser): void {
        (TestBed.inject(AuthenticationService) as unknown as AuthenticationServiceMock).setUser(user);
    }

    private currentUser: AuthUser = null;

    private userRS: ReplaySubject<AuthUser>;

    constructor() {
        this.userRS = new ReplaySubject<AuthUser>(1);
    }
    public setUser(user: AuthUser): void {
        this.currentUser = user;
        this.userRS.next(user);
    }

    public getUserObs(): Observable<AuthUser> {
        return this.userRS.asObservable();
    }
    public async disconnect(): Promise<MGPValidation> {
        return MGPValidation.failure('not mocked');
    }
    public async doRegister(_username: string, _email: string, _password: string): Promise<MGPFallible<firebase.User>> {
        return MGPFallible.failure('not mocked');
    }
    public async sendEmailVerification(): Promise<MGPValidation> {
        return MGPValidation.failure('not mocked');
    }
    public async doEmailLogin(): Promise<MGPValidation> {
        return MGPValidation.failure('not mocked');
    }
    public async doGoogleLogin(): Promise<MGPValidation> {
        return MGPValidation.failure('not mocked');
    }
    public async setUsername(_username: string): Promise<MGPValidation> {
        return MGPValidation.failure('not mocked');
    }
    public async setPicture(_url: string): Promise<MGPValidation> {
        return MGPValidation.failure('not mocked');
    }
    public async reloadUser(): Promise<void> {
        this.userRS.next(this.currentUser);
    }
}

async function setupAuthTestModule(): Promise<unknown> {
    await setupEmulators();
    // Clear the rtdb data before each test
    const useFirebaseDatabase: boolean = false;
    if (useFirebaseDatabase) {
        // Here we can't clear the DB because it breaks everything, but this is how it should be done:
        await firebase.database().ref().set(null);
    }
    return Promise.resolve();
}

export class AuthenticationServiceUnderTest extends AuthenticationService {
    public updatePresence(): Promise<void> {
        return null;
    }
}

export async function createConnectedGoogleUser(): Promise<firebase.auth.UserCredential> {
    const credential: firebase.auth.UserCredential = await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential('{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'));
    await TestBed.inject(UserDAO).set(credential.user.uid, { username: null, verified: true });
    return credential;
}

async function createGoogleUser(): Promise<firebase.auth.UserCredential> {
    const credential: firebase.auth.UserCredential = await createConnectedGoogleUser();
    await firebase.auth().signOut();
    return credential;
}

describe('AuthenticationService', () => {
    let service: AuthenticationService;

    const username: string = 'jeanjaja';
    const email: string = 'jean@jaja.europe';
    const password: string = 'hunter2';

    beforeEach(async() => {
        await setupAuthTestModule();
        service = TestBed.inject(AuthenticationService);
    });

    it('should create', fakeAsync(async() => {
        expect(service).toBeTruthy();
    }));
    it('should mark user as verified if the user finalized its account but is not yet marked as verified', async() => {
        const userDAO: UserDAO = TestBed.inject(UserDAO);
        spyOn(userDAO, 'markVerified');

        // given a registered user that has finalized all steps to verify its account
        const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);
        expect(result.isSuccess()).toBeTrue();
        const uid: string = result.get().uid;
        await firebase.auth().signOut();
        spyOn(service, 'emailVerified').and.returnValue(true);

        // when the user appears again
        let resolvePromise: () => void;
        const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
            resolvePromise = resolve;
        });
        const subscription: Subscription = service.getUserObs().subscribe((_user: AuthUser) => {
            // Wait 100ms to ensure that the handler has the time to mark for verification
            setTimeout(resolvePromise, 100);
        });
        await service.doEmailLogin(email, password);
        await userHasUpdated;

        // then its status is set to verified
        expect(userDAO.markVerified).toHaveBeenCalledWith(uid);

        subscription.unsubscribe();
    });
    describe('register', () => {
        it('should create user upon successful registration', async() => {
            spyOn(service, 'createUser');

            // given an user that does not exist

            // when the user is registered
            const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);

            // then the user is successfully registered and created
            expect(result.isSuccess()).toBeTrue();
            expect(service.createUser).toHaveBeenCalledWith(result.get().uid, username);
        });
        it('should fail when trying to register an user with an email that is already registered', async() => {
            // given an user that already exists
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when an user with the same email is registered
            const result: MGPFallible<firebase.User> = await service.doRegister('blibli', email, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This email address is already in use.');
        });
        it('should fail when trying to register an user with an username that is already registered', async() => {
            // given an user that already exists
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when an user with the same email is registered
            const result: MGPFallible<firebase.User> = await service.doRegister(username, 'bli@blah.com', password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This username is already in use.');
        });
        it('should fail when trying to register an user with an invalid email', async() => {
            // given an invalid email address
            const invalidEmail: string = 'blibli';

            // when an user registers with that email
            const result: MGPFallible<firebase.User> = await service.doRegister(username, invalidEmail, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This email address is invalid.');
        });
        it('should fail when trying to register with a weak password', async() => {
            // given an weak password
            const password: string = '1';

            // when an user registers with that password
            const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('Your password is too weak, please use a stronger password.');
        });
        it('should fail when the email is missing', async() => {
            // given that the password has not been filled
            const password: string = null;

            // when an user registers with that password
            const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`There are missing fields in the registration form, please check that you filled in all fields.`);
        });
        it('should fail when the password is missing', async() => {
            // given that the password has not been filled
            const email: string = null;

            // when an user registers with that password
            const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`There are missing fields in the registration form, please check that you filled in all fields.`);
        });
        it('should fail when the username is missing', async() => {
            // given a null username (because the form has not been filled)
            const username: string = null;

            // when an user registers with that username
            const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`There are missing fields in the registration form, please check that you filled in all fields.`);
        });
    });
    describe('sendVerificationEmail', () => {
        it('should send the email verification', async() => {
            // given a user that just registered and hence is not verified
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();
            // and that the user is connected
            expect(await service.doEmailLogin(email, password)).toBe(MGPValidation.SUCCESS);

            spyOn(firebase.auth().currentUser, 'sendEmailVerification');

            // when the email verification is requested
            const result: MGPValidation = await service.sendEmailVerification();

            // then the email verification has been sent
            expect(result).toBe(MGPValidation.SUCCESS);
            expect(firebase.auth().currentUser.sendEmailVerification).toHaveBeenCalled();
        });
        it('should throw if there is no connected user', async() => {
            // given nothing

            // when the email verification is requested
            const result: Promise<MGPValidation> = service.sendEmailVerification();
            // then it throws because this is not a valid user interaction

            // then it fails
            await expectAsync(result).toBeRejectedWithError('Encountered error: Unlogged users cannot request for email verification');
        });
        it('should throw if the user already verified its email', async() => {
            // given a connected user that is registered and verified, for example through a google account
            await createConnectedGoogleUser();

            // when the email verification is requested
            const result: Promise<MGPValidation> = service.sendEmailVerification();
            // then it throws because this is not a valid user interaction
            await expectAsync(result).toBeRejectedWithError('Encountered error: Verified users should not ask email verification twice');
        });
        it('should fail if there is a genuine error in the email verification process from firebase', async() => {
            // given a user that just registered and hence is not verified
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();
            // and that the user is connected
            expect(await service.doEmailLogin(email, password)).toBe(MGPValidation.SUCCESS);

            // when the email verification is requested but fails
            const error: firebase.FirebaseError = new Error('Error') as firebase.FirebaseError;
            error.code = 'auth/too-many-requests';
            spyOn(firebase.auth().currentUser, 'sendEmailVerification').and.rejectWith(error);
            const result: MGPValidation = await service.sendEmailVerification();

            // then a failure is returned
            expect(result.isFailure()).toBeTrue();
        });
    });
    describe('email login', () => {
        it('should succeed when the password is correct', async() => {
            // given a registered user
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when logging in with email with the right password
            const result: MGPValidation = await service.doEmailLogin(email, password);

            // then the login succeeds and the current user is set
            expect(result.isSuccess()).toBeTrue();
            expect(firebase.auth().currentUser.email).toBe(email);
        });
        it('should update userObs when successfully logging in', async() => {
            // given that a listener is waiting for user updates
            const updateSeen: Promise<void> = new Promise((resolve: () => void) => {
                service.getUserObs().subscribe((_: AuthUser): void => {
                    resolve();
                });
            });
            await expectAsync(updateSeen).toBePending();

            // when a user is logged in
            await service.doEmailLogin(email, password);

            // then the update has been seen
            await expectAsync(updateSeen).toBeResolved();
        });
        it('should fail when the password is incorrect', async() => {
            // given a registered user
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when logging in with email with an incorrect password,
            const result: MGPValidation = await service.doEmailLogin(email, 'helaba');

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered an invalid email or password.`);
        });
        it('should fail when the user is not registered', async() => {
            // given that the user does not exist

            // when trying to log in
            const result: MGPValidation = await service.doEmailLogin(email, password);

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered an invalid email or password.`);
        });
    });
    describe('google login', () => {
        it('should delegate to signInPopup', async() => {
            // given a google user
            const user: firebase.auth.UserCredential = await createGoogleUser();
            spyOn(service.afAuth, 'signInWithPopup').and.resolveTo(user);

            // when the user connects with google
            const result: MGPValidation = await service.doGoogleLogin();

            // then it succeeded
            expect(result.isSuccess()).toBeTrue();
            const provider: firebase.auth.GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            expect(service.afAuth.signInWithPopup).toHaveBeenCalledWith(provider);
        });
        it('should fail if google login also fails', async() => {
            // given a google user that will fail to connect
            const error: firebase.FirebaseError = new Error('Invalid credential') as firebase.FirebaseError;
            error.code = 'auth/invalid-credential';
            spyOn(service.afAuth, 'signInWithPopup').and.rejectWith(error);

            // when the user tries to connect but fails
            const result: MGPValidation = await service.doGoogleLogin();

            // then it failed
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('The credential is invalid or has expired, please try again.');
        });
    });
    describe('disconnect', () => {
        it('should fail if there is no user connected', async() => {
            // given that no user is connected (default)

            // when trying to disconnect
            const result: MGPValidation = await service.disconnect();

            // then it fails
            expect(result).toEqual(MGPValidation.failure('Cannot disconnect a non-connected user'));
        });
        it('should succeed if a user is connected, and result in the user being disconnected', async() => {
            // given a registered and connected user
            const registrationResult: MGPFallible<firebase.User> = await service.doRegister(username, email, password);
            expect(registrationResult.isSuccess()).toBeTrue();
            await service.doEmailLogin(email, password);

            RTDBSpec.setOfflineMock();

            // when trying to disconnect
            const result: MGPValidation = await service.disconnect();

            // then it succeeds
            expect(result).toBe(MGPValidation.SUCCESS);

            // and there is no current user
            expect(firebase.auth().currentUser).toBeNull();
        });
    });
    describe('mapFirebaseError', () => {
        it('calls handleError when encountering an unsupported error', async() => {
            spyOn(Utils, 'handleError').and.returnValue(null);

            // given an unsupported error
            const error: firebase.FirebaseError = {
                name: 'FirebaseError',
                code: 'auth/unknown-error',
                message: 'Error message',
            };

            // when mapping it
            service.mapFirebaseError(error);

            // then handleError is called
            expect(Utils.handleError).toHaveBeenCalledWith('Unsupported firebase error: auth/unknown-error (Error message)');
        });
        it('should map the errors encountered in the wild but that we cannot reproduce in a test environment', async() => {
            spyOn(Utils, 'handleError').and.returnValue(null);
            const errorCodes: string[] = [
                'auth/too-many-requests',
                'auth/popup-closed-by-user',
            ];

            for (const code of errorCodes) {
                // given an error
                const error: firebase.FirebaseError = {
                    name: 'FirebaseError',
                    code,
                    message: 'Error message',
                };

                // when mapping it
                service.mapFirebaseError(error);

                // then it is properly handled
                expect(Utils.handleError).not.toHaveBeenCalled();
            }
        });
    });
    describe('updatePresence', () => {
        it('should be called and update user presence when user gets connected', async() => {
            spyOn(RTDB, 'updatePresence').and.callThrough();

            // given a registered user
            const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);
            expect(result.isSuccess()).toBeTrue();
            const user: firebase.User = result.get();

            // when the user logs in
            await service.doEmailLogin(email, password);

            // and logs out
            await firebase.auth().signOut();

            // Then updatePresence is called
            expect(RTDB.updatePresence).toHaveBeenCalledWith(user.uid);
        });
    });
    describe('setUsername', () => {
        let user: firebase.auth.UserCredential;
        beforeEach(async() => {
            // given a registered and logged in user
            user = await createConnectedGoogleUser();
        });
        it('should update the username', async() => {
            // when the username is set
            const newUsername: string = 'grandgaga';
            const result: MGPValidation = await service.setUsername(newUsername);

            // then the username is updated
            expect(result.isSuccess()).toBeTrue();
        });
        it('should not throw upon failure', async() => {
            // when the username is set but fails
            const error: firebase.FirebaseError = new Error('Error') as firebase.FirebaseError;
            error.code = 'unknown/error';
            spyOn(user.user, 'updateProfile').and.rejectWith(error);
            spyOn(Utils, 'handleError').and.returnValue(null);
            const result: MGPValidation = await service.setUsername(username);

            // then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('Error');
        });
        it('should reject empty usernames', async() => {
            // when the username is set to an empty username
            const result: MGPValidation = await service.setUsername('');

            // then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual(`Your username may not be empty.`);
        });
        it('should reject existing usernames', async() => {
            const userDAO: UserDAO = TestBed.inject(UserDAO);
            // when the username is set to an username that is not available
            spyOn(userDAO, 'usernameIsAvailable').and.resolveTo(false);
            const result: MGPValidation = await service.setUsername('not-available');

            // then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual(`This username is already in use, please select a different one.`);
        });
    });
    describe('setPicture', () => {
        it('should update the picture', async() => {
            // given a registered and logged in user
            await createConnectedGoogleUser();

            // when the picture is set
            const photoURL: string = 'http://my.pic/foo.png';
            const result: MGPValidation = await service.setPicture(photoURL);

            // then the picture is updated
            expect(result.isSuccess()).toBeTrue();
            expect(firebase.auth().currentUser.photoURL).toEqual(photoURL);
        });
        it('should not throw upon failure', async() => {
            // given a registered and logged in user
            const user: firebase.auth.UserCredential = await createConnectedGoogleUser();

            // when the picture is set but fails
            const error: firebase.FirebaseError = new Error('Error') as firebase.FirebaseError;
            error.code = 'unknown/error';
            spyOn(user.user, 'updateProfile').and.rejectWith(error);
            spyOn(Utils, 'handleError').and.returnValue(null);
            const result: MGPValidation = await service.setPicture('http://my.pic/foo.png');

            // then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('Error');
        });
    });
    it('should unsubscribe from auth subscription upon destruction', () => {
        spyOn(service.authSub, 'unsubscribe');

        // when the service is destroyed
        service.ngOnDestroy();

        // then it unsubscribed
        expect(service.authSub.unsubscribe).toHaveBeenCalledWith();
    });
    afterEach(async() => {
        await firebase.auth().signOut();
    });
});

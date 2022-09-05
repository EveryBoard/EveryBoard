/* eslint-disable max-lines-per-function */
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import * as FireAuth from '@angular/fire/auth';
import { serverTimestamp } from 'firebase/firestore';

import { Auth, ConnectedUserService, AuthUser, GameActionFailure } from '../ConnectedUserService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Utils } from 'src/app/utils/utils';
import { UserDAO } from 'src/app/dao/UserDAO';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from '../ErrorLoggerService';
import { ErrorLoggerServiceMock } from './ErrorLoggerServiceMock.spec';
import { FocusedPart } from 'src/app/domain/User';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { Part } from 'src/app/domain/Part';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { FocusedPartMocks } from 'src/app/domain/mocks/FocusedPartMocks.spec';

@Injectable()
export class ConnectedUserServiceMock {

    public static setUser(user: AuthUser, notifyObservers: boolean = true, userId: string = 'userId'): void {
        (TestBed.inject(ConnectedUserService) as unknown as ConnectedUserServiceMock)
            .setUser(userId, user, notifyObservers);
    }
    public static setObservedPart(observedPart: MGPOptional<FocusedPart>): void {
        (TestBed.inject(ConnectedUserService) as unknown as ConnectedUserServiceMock)
            .setObservedPart(observedPart);
    }
    public user: MGPOptional<AuthUser> = MGPOptional.empty();
    public uid: MGPOptional<string> = MGPOptional.empty();

    private readonly userRS: ReplaySubject<AuthUser>;

    private readonly observedPartRS: ReplaySubject<MGPOptional<FocusedPart>>;
    private observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();

    constructor() {
        this.userRS = new ReplaySubject<AuthUser>(1);
        this.observedPartRS = new ReplaySubject<MGPOptional<FocusedPart>>(1);
    }
    public setUser(userId: string, user: AuthUser, notifyObservers: boolean = true): void {
        this.user = MGPOptional.of(user);
        this.uid = MGPOptional.of(userId);
        // In some very specific cases, changing the status of a user in firebase does not notify the observers.
        // This is the case if a user becomes verified.
        if (notifyObservers) {
            this.userRS.next(user);
        }
    }
    public setObservedPart(observedPart: MGPOptional<FocusedPart>): void {
        console.log('setObservedPart')
        this.observedPart = observedPart;
        this.observedPartRS.next(observedPart);
    }
    public getUserObs(): Observable<AuthUser> {
        return this.userRS.asObservable();
    }
    public getObservedPartObs(): Observable<MGPOptional<FocusedPart>> {
        return this.observedPartRS.asObservable();
    }
    public async disconnect(): Promise<MGPValidation> {
        if (this.user.isPresent()) {
            this.observedPartRS.next(MGPOptional.empty());
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
    public async updateObservedPart(observedPart: string): Promise<void> {
        return;
    }
    public async sendPresenceToken(): Promise<void> {
        return;
    }
    public async removeObservedPart(observedPart: string): Promise<void> {
        return;
    }
    public canUserCreate(): MGPValidation {
        if (this.observedPart.isAbsent()) {
            return MGPValidation.SUCCESS;
        } else {
            const message: string = ConnectedUserService.roleToMessage.get(this.observedPart.get().role).get()();
            return MGPValidation.failure(message);
        }
    }
    public canUserJoin(partId: string): MGPValidation {
        if (this.observedPart.isAbsent() || this.observedPart.get().id === partId) {
            // User is allowed to observe one part in any way
            // or to do it twice with the same one
            return MGPValidation.SUCCESS;
        } else {
            const observedPart: FocusedPart = this.observedPart.get();
            switch (observedPart.role) {
                case 'Creator':
                    // Even if one player can be creator of one part that is started
                    // It is here only used for non started game
                    return MGPValidation.failure(GameActionFailure.YOU_ARE_ALREADY_CREATING());
                case 'Candidate':
                    return MGPValidation.failure(GameActionFailure.YOU_ARE_ALREADY_CANDIDATE());
                case 'ChosenOpponent':
                    return MGPValidation.failure(GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT());
                case 'Player':
                    return MGPValidation.failure(GameActionFailure.YOU_ARE_ALREADY_PLAYING());
                default:
                    Utils.expectToBe(observedPart.role, 'Observer');
                    return MGPValidation.SUCCESS;
                    // It is allow to observe another game
            }
        }
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
    TestBed.inject(ConnectedUserService);
    // Sign out current user in case there is one
    await FireAuth.signOut(TestBed.inject(FireAuth.Auth));
    // Create a new google user
    const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": true}';
    const credential: FireAuth.UserCredential =
        await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                            FireAuth.GoogleAuthProvider.credential(token));
    await TestBed.inject(UserDAO).set(credential.user.uid, { verified: false });
    if (username != null) {
        // This needs to happen in multiple updates to match the security rules
        await TestBed.inject(UserDAO).update(credential.user.uid, { username });
        await TestBed.inject(UserDAO).update(credential.user.uid, { verified: true });
    }
    return credential.user;
}

export async function createConnectedUser(email: string, username: string): Promise<MinimalUser> {
    const user: FireAuth.User = await createConnectedGoogleUser(email, username);
    return { id: user.uid, name: username };
}

export async function createDisconnectedUser(email: string, username: string): Promise<MinimalUser> {
    const user: FireAuth.User = await createConnectedGoogleUser(email, username);
    await FireAuth.signOut(TestBed.inject(FireAuth.Auth));
    return { id: user.uid, name: username };
}

export async function reconnectUser(email: string): Promise<void> {
    const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": true}';
    await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                        FireAuth.GoogleAuthProvider.credential(token));
}

export async function createUnverifiedUser(email: string, username: string): Promise<MinimalUser> {
    const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": false}';
    const credential: FireAuth.UserCredential =
        await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                            FireAuth.GoogleAuthProvider.credential(token));
    await TestBed.inject(UserDAO).set(credential.user.uid, { verified: false });
    await TestBed.inject(UserDAO).update(credential.user.uid, { username });
    return { id: credential.user.uid, name: username };
}

export function signOut(): Promise<void> {
    return TestBed.inject(FireAuth.Auth).signOut();
}

export async function createDisconnectedGoogleUser(email: string, username?: string): Promise<FireAuth.User> {
    const user: FireAuth.User = await createConnectedGoogleUser(email, username);
    await signOut();
    return user;
}

describe('ConnectedUserService', () => {

    let auth: FireAuth.Auth;
    let connectedUserService: ConnectedUserService;

    const username: string = 'jeanjaja';
    const email: string = 'jean@jaja.europe';
    const password: string = 'hunter2';

    let alreadyDestroyed: boolean = false;

    beforeEach(async() => {
        await setupAuthTestModule();
        connectedUserService = TestBed.inject(ConnectedUserService);
        auth = TestBed.inject(FireAuth.Auth);
    });

    it('should create', fakeAsync(async() => {
        expect(connectedUserService).toBeTruthy();
    }));
    it('should mark user as verified if the user finalized its account but is not yet marked as verified', async() => {
        const userDAO: UserDAO = TestBed.inject(UserDAO);
        spyOn(userDAO, 'markAsVerified');

        // given a registered user that has finalized all steps to verify its account
        const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister(username, email, password);
        expect(result.isSuccess()).toBeTrue();
        const uid: string = result.get().uid;
        await FireAuth.signOut(auth);
        spyOn(connectedUserService, 'emailVerified').and.returnValue(true);

        // when the user appears again
        let resolvePromise: () => void;
        const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
            resolvePromise = resolve;
        });
        const subscription: Subscription = connectedUserService.getUserObs().subscribe((_user: AuthUser) => {
            // Wait 2s to ensure that the handler has the time to mark for verification
            window.setTimeout(resolvePromise, 2000);
        });
        await connectedUserService.doEmailLogin(email, password);
        await userHasUpdated;

        // then its status is set to verified
        expect(userDAO.markAsVerified).toHaveBeenCalledWith(uid);

        subscription.unsubscribe();
    });
    describe('register', () => {
        it('should create user upon successful registration', async() => {
            spyOn(connectedUserService, 'createUser').and.callThrough();
            // given an user that does not exist

            // when the user is registered
            const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister(username, email, password);

            // then the user is successfully registered and created
            expect(result.isSuccess()).toBeTrue();
            expect(connectedUserService.createUser).toHaveBeenCalledWith(result.get().uid, username);
        });
        it('should fail when trying to register an user with an email that is already registered', async() => {
            // given an user that already exists
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when an user with the same email is registered
            const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister('blibli', email, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This email address is already in use.');
        });
        it('should fail when trying to register an user with an username that is already registered', async() => {
            // given an user that already exists
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when an user with the same email is registered
            const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister(username, 'bli@blah.com', password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This username is already in use.');
        });
        it('should fail when trying to register an user with an invalid email', async() => {
            // given an invalid email address
            const invalidEmail: string = 'blibli';

            // when an user registers with that email
            const result: MGPFallible<FireAuth.User> =
                await connectedUserService.doRegister(username, invalidEmail, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('This email address is invalid.');
        });
        it('should fail when trying to register with a weak password', async() => {
            // given an weak password
            const password: string = '1';

            // when an user registers with that password
            const result: MGPFallible<FireAuth.User> = await connectedUserService.doRegister(username, email, password);

            // then an error is thrown
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('Your password is too weak, please use a stronger password.');
        });
    });
    describe('sendEmailVerification', () => {
        it('should send the email verification', async() => {
            // given a user that just registered and hence is not verified
            const userRegistrationResult: MGPFallible<FireAuth.User> =
                await connectedUserService.doRegister(username, email, password);
            expect(userRegistrationResult.isSuccess()).toBeTrue();
            // and that the user is connected
            expect(await connectedUserService.doEmailLogin(email, password)).toBe(MGPValidation.SUCCESS);

            spyOn(Auth, 'sendEmailVerification').and.callThrough();

            // when the email verification is requested
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // then the email verification has been sent
            const user: FireAuth.User = Utils.getNonNullable(auth.currentUser);
            expect(result).toBe(MGPValidation.SUCCESS);
            expect(Auth.sendEmailVerification).toHaveBeenCalledOnceWith(user);
        });
        it('should fail and log the error if there is no connected user', async() => {
            // given nothing
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // when the email verification is requested
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // then it fails because this is not a valid user interaction
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('ConnectedUserService: Unlogged users cannot request for email verification');
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('ConnectedUserService', 'Unlogged users cannot request for email verification');
        });
        it('should fail if the user already verified its email', async() => {
            // given a connected user that is registered and verified, for example through a google account
            await createConnectedGoogleUser('foo@bar.com');
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // when the email verification is requested
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // then it fails because this is not a valid user interaction
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('ConnectedUserService: Verified users should not ask email verification after being verified');
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('ConnectedUserService', 'Verified users should not ask email verification after being verified');
        });
        it('should fail if there is a genuine error in the email verification process from firebase', async() => {
            // given a user that just registered and hence is not verified
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            // and that the user is connected
            expect(await connectedUserService.doEmailLogin(email, password)).toBe(MGPValidation.SUCCESS);

            // when the email verification is requested but fails
            const error: FirebaseError = new FirebaseError('auth/too-many-requests', 'Error');
            spyOn(Auth, 'sendEmailVerification').and.rejectWith(error);
            const result: MGPValidation = await connectedUserService.sendEmailVerification();

            // then a failure is returned
            expect(result.isFailure()).toBeTrue();
        });
    });
    describe('email login', () => {
        it('should succeed when the password is correct', async() => {
            // given a registered user
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            await FireAuth.signOut(auth);

            // when logging in with email with the right password
            const result: MGPValidation = await connectedUserService.doEmailLogin(email, password);

            // then the login succeeds and the current user is set
            expect(result.isSuccess()).toBeTrue();
            expect(Utils.getNonNullable(auth.currentUser).email).toBe(email);
        });
        it('should update user when successfully logging in', async() => {
            // given a registered user and a listener waiting for user updates
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            await auth.signOut();

            let subscription!: Subscription;
            const updateSeen: Promise<void> = new Promise((resolve: () => void) => {
                subscription = connectedUserService.getUserObs().subscribe((user: AuthUser): void => {
                    if (user.isConnected()) {
                        resolve();
                    }
                });
            });
            await expectAsync(updateSeen).toBePending();

            // when the user is logged in
            expect((await connectedUserService.doEmailLogin(email, password)).isSuccess()).toBeTrue();

            // then the update has been seen
            await expectAsync(updateSeen).toBeResolved();
            subscription.unsubscribe();
        });
        it('should fail when the password is incorrect', async() => {
            // given a registered user
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();
            await auth.signOut();

            // when logging in with email with an incorrect password,
            const result: MGPValidation = await connectedUserService.doEmailLogin(email, 'helaba');

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered invalid credentials.`);
        });
        it('should fail when the user is not registered', async() => {
            // given that the user does not exist

            // when trying to log in
            const result: MGPValidation = await connectedUserService.doEmailLogin(email, password);

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered invalid credentials.`);
        });
    });
    describe('google login', () => {
        it('should delegate to signInPopup and create the user if it does not exist', async() => {
            // given a non-existing google user
            spyOn(connectedUserService, 'createUser').and.callThrough();
            const token: string = '{"sub": "' + email + '", "email": "' + email + '", "email_verified": true}';
            const credential: FireAuth.UserCredential =
                await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                    FireAuth.GoogleAuthProvider.credential(token));
            const user: FireAuth.User = credential.user;
            spyOn(Auth, 'signInWithPopup').and.resolveTo(user);

            // when the user registers and connects with google
            const result: MGPValidation = await connectedUserService.doGoogleLogin();

            // then it succeeded and created the user
            expect(result.isSuccess()).toBeTrue();
            const provider: FireAuth.GoogleAuthProvider = new FireAuth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            expect(Auth.signInWithPopup).toHaveBeenCalledWith(auth, provider);
            expect(connectedUserService.createUser).toHaveBeenCalledWith(user.uid);
        });
        it('should not create the user if it already exists', async() => {
            // given a disconnected google user
            spyOn(connectedUserService, 'createUser');
            const user: FireAuth.User = await createDisconnectedGoogleUser('foo@bar.com');
            spyOn(Auth, 'signInWithPopup').and.resolveTo(user);

            // when the user connects with google
            const result: MGPValidation = await connectedUserService.doGoogleLogin();

            // then it should have succeeded
            expect(result.isSuccess()).toBeTrue();
            const provider: FireAuth.GoogleAuthProvider = new FireAuth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            expect(Auth.signInWithPopup).toHaveBeenCalledWith(auth, provider);
            expect(connectedUserService.createUser).not.toHaveBeenCalled();
        });
        it('should fail if google login also fails', async() => {
            // given a google user that will fail to connect
            const error: FirebaseError = new FirebaseError('auth/invalid-credential', 'Invalid credential');
            spyOn(Auth, 'signInWithPopup').and.rejectWith(error);

            // when the user tries to connect but fails
            const result: MGPValidation = await connectedUserService.doGoogleLogin();

            // then it failed
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('The credential is invalid or has expired, please try again.');
        });
    });
    describe('disconnect', () => {
        it('should fail if there is no user connected', async() => {
            // given that no user is connected (default)

            // when trying to disconnect
            const result: MGPValidation = await connectedUserService.disconnect();

            // then it fails
            expect(result).toEqual(MGPValidation.failure('Cannot disconnect a non-connected user'));
        });
        it('should succeed if a user is connected, and disconnected the user', async() => {
            // given a registered and connected user
            const registrationResult: MGPFallible<FireAuth.User> =
                await connectedUserService.doRegister(username, email, password);
            expect(registrationResult.isSuccess()).toBeTrue();
            await connectedUserService.doEmailLogin(email, password);

            // when trying to disconnect
            const result: MGPValidation = await connectedUserService.disconnect();

            // then it succeeds
            expect(result).toBe(MGPValidation.SUCCESS);

            // and there is no current user
            expect(auth.currentUser).toBeNull();
        });
        it('should remove the observedPart', async() => {
            // given a registered and connected user observing a game
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            let resolvePromise: () => void;
            const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
                resolvePromise = resolve;
            });
            let observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();
            const subscription: Subscription =
                connectedUserService.getObservedPartObs().subscribe((newValue: MGPOptional<FocusedPart>) => {
                    observedPart = newValue;
                    window.setTimeout(resolvePromise, 2000);
                });
            await connectedUserService.doEmailLogin(email, password);
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4' } });
            await userHasUpdated;
            expect(observedPart).toEqual(MGPOptional.of({ id: '1234', typeGame: 'P4' }));

            // when trying to disconnect
            await connectedUserService.disconnect();

            // then it should have removed the observedPart
            expect(observedPart.isAbsent()).toBeTrue();
            subscription.unsubscribe();
        });
    });
    describe('mapFirebaseError', () => {
        it('should call logError when encountering an unsupported error', async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // given an unsupported error
            const error: FirebaseError = new FirebaseError('auth/unknown-error', 'Error message');

            // when mapping it
            connectedUserService.mapFirebaseError(error);

            // then logError is called
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('ConnectedUserService', 'Unsupported firebase error', { errorCode: 'auth/unknown-error', errorMessage: 'Error message' });
        });
        it('should map the errors encountered in the wild but that we cannot reproduce in a test environment', async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const errorCodes: string[] = [
                'auth/too-many-requests',
                'auth/popup-closed-by-user',
                'auth/popup-blocked',
            ];

            for (const code of errorCodes) {
                // given an error
                const error: FirebaseError = new FirebaseError(code, 'Error message');

                // when mapping it
                connectedUserService.mapFirebaseError(error);

                // then it is properly handled
                expect(ErrorLoggerService.logError).not.toHaveBeenCalled();
            }
        });
    });
    describe('setUsername', () => {
        beforeEach(async() => {
            // given a registered and logged in user
            await createConnectedGoogleUser('foo@bar.com');
        });
        it('should update the username', async() => {
            // when the username is set
            const newUsername: string = 'grandgaga';
            const result: MGPValidation = await connectedUserService.setUsername(newUsername);

            // then the username is updated
            expect(result.isSuccess()).toBeTrue();
        });
        it('should not throw upon failure', async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

            // when the username is set but fails
            const error: FirebaseError = new FirebaseError('unknown/error', 'Error');
            spyOn(Auth, 'updateProfile').and.rejectWith(error);
            const result: MGPValidation = await connectedUserService.setUsername(username);

            // then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('Error');
            expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('ConnectedUserService', 'Unsupported firebase error', { errorCode: 'unknown/error', errorMessage: 'Error' });
        });
        it('should reject empty usernames', async() => {
            // when the username is set to an empty username
            const result: MGPValidation = await connectedUserService.setUsername('');

            // then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual(`Your username may not be empty.`);
        });
        it('should reject existing usernames', async() => {
            const userDAO: UserDAO = TestBed.inject(UserDAO);
            // when the username is set to an username that is not available
            spyOn(userDAO, 'usernameIsAvailable').and.resolveTo(false);
            const result: MGPValidation = await connectedUserService.setUsername('not-available');

            // then it fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual(`This username is already in use, please select a different one.`);
        });
    });
    describe('setPicture', () => {
        it('should update the picture', async() => {
            // given a registered and logged in user
            await createConnectedGoogleUser('foo@bar.com');

            // when the picture is set
            const photoURL: string = 'http://my.pic/foo.png';
            const result: MGPValidation = await connectedUserService.setPicture(photoURL);

            // then the picture is updated
            expect(result.isSuccess()).toBeTrue();
            expect(Utils.getNonNullable(auth.currentUser).photoURL).toEqual(photoURL);
        });
        it('should not throw upon failure', async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // given a registered and logged in user
            await createConnectedGoogleUser('foo@bar.com');

            // when the picture is set but fails
            const error: FirebaseError = new FirebaseError('unknown/error', 'Error');
            spyOn(Auth, 'updateProfile').and.rejectWith(error);
            const result: MGPValidation = await connectedUserService.setPicture('http://my.pic/foo.png');

            // then it fails and logs the error
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toEqual('Error');
            expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('ConnectedUserService', 'Unsupported firebase error', { errorCode: 'unknown/error', errorMessage: 'Error' });
        });
    });
    describe('sendPasswordResetEmail', () => {
        it('should delegate to Auth.sendPasswordResetEmail', async() => {
            spyOn(Auth, 'sendPasswordResetEmail').and.callThrough();
            // given a registered user
            expect((await connectedUserService.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when asking for password reset
            const result: MGPValidation = await connectedUserService.sendPasswordResetEmail(email);

            // then it should have delegated and succeeded
            expect(result.isSuccess()).toBeTrue();
            expect(Auth.sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
        });
        it('should properly map errors', async() => {
            // given a user that doesn't exist
            const email: string = 'foo@jaja.com';
            const error: FirebaseError = new FirebaseError('auth/user-not-found', 'Error');
            spyOn(Auth, 'sendPasswordResetEmail').and.rejectWith(error);
            // when asking for password reset
            const result: MGPValidation = await connectedUserService.sendPasswordResetEmail(email);
            // then it should fail
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('You have entered invalid credentials.');
        });
    });
    it('should unsubscribe from auth subscription upon destruction', () => {
        spyOn(connectedUserService, 'unsubscribeFromAuth');

        // when the service is destroyed
        connectedUserService.ngOnDestroy();
        alreadyDestroyed = true;

        // then it unsubscribed
        expect(connectedUserService.unsubscribeFromAuth).toHaveBeenCalledWith();
    });
    describe('observed part', () => {
        it('should update observedPart observable when UserDao touches it', async() => {
            // Given a connected user
            // and the observedPart observable
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            let resolvePromise: () => void;
            const userHasUpdated: Promise<void> = new Promise((resolve: () => void) => {
                resolvePromise = resolve;
            });
            let lastValue: MGPOptional<FocusedPart> = MGPOptional.empty();
            const subscription: Subscription =
                connectedUserService.getObservedPartObs().subscribe((observedPart: MGPOptional<FocusedPart>) => {
                    lastValue = observedPart;
                    window.setTimeout(resolvePromise, 2000);
                });
            // When the UserDAO modify observedPart in the user document
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4' } });
            await userHasUpdated;

            // Then the observable should have updated its value
            expect(lastValue).toEqual(MGPOptional.of({ id: '1234', typeGame: 'P4' }));
            subscription.unsubscribe();
        });
        describe('updateObservedPart', () => {
            it('should throw when called while no user is logged', async() => {
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: Should not call updateObservedPart when not connected';
                expect(() => connectedUserService.updateObservedPart({ id: 'some-part-doc-id' })).toThrowError(expectedError);
            });
            it('should delegate to userDAO', async() => {
                // Given a service observing an user
                connectedUserService.user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

                // When asking to update observedPart
                const userDAO: UserDAO = TestBed.inject(UserDAO);
                spyOn(userDAO, 'update').and.callFake(async(pid: string, u: Partial<Part>) => {});
                const observedPart: FocusedPart = FocusedPartMocks.CREATOR_WITHOUT_OPPONENT;
                await connectedUserService.updateObservedPart(observedPart);

                // Then the userDAO should update the connected user doc
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.CREATOR_MINIMAL_USER.id, { observedPart });
            });
        });
        describe('removeObservedPart', () => {
            it('should throw when asking to remove while no user is logged', async() => {
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
                const expectedError: string = 'Assertion failure: Should not call removeObservedPart when not connected';
                expect(() => connectedUserService.removeObservedPart()).toThrowError(expectedError);
            });
            it('should delegate removal to userDAO', async() => {
                // Given a service observing an user
                connectedUserService.user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

                // When asking to update observedPart
                const userDAO: UserDAO = TestBed.inject(UserDAO);
                spyOn(userDAO, 'update').and.callFake(async(pid: string, u: Partial<Part>) => {});
                await connectedUserService.removeObservedPart();

                // Then the userDAO should update the connected user doc
                expect(userDAO.update).toHaveBeenCalledOnceWith(UserMocks.CREATOR_MINIMAL_USER.id,
                                                                { observedPart: null });
            });
        });
    });
    describe('sendPresenceToken', () => {
        it('should throw when asking to send presence token while no user is logged', fakeAsync(() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const expectedError: string = 'Assertion failure: Should not call sendPresenceToken when not connected';
            expect(() => connectedUserService.sendPresenceToken()).toThrowError(expectedError);
        }));
        it('should delegate presence token sending to userDAO', async() => {
            // Given a service observing an user
            connectedUserService.user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

            // When asking to send presence token
            const userDAO: UserDAO = TestBed.inject(UserDAO);
            spyOn(userDAO, 'update').and.callFake(async(pid: string, u: Partial<Part>) => {});
            await connectedUserService.sendPresenceToken();

            // Then the userDAO should update the connected user doc
            const userDocId: string = UserMocks.CREATOR_MINIMAL_USER.id;
            expect(userDAO.update).toHaveBeenCalledOnceWith(userDocId, { lastUpdateTime: serverTimestamp() });
        });
    });
    describe('canUserCreate', () => {
        it('should return SUCCESS if user do not observe any part', fakeAsync(async() => {
            // Given a ConnectedUserService where user don't observe any part
            await createConnectedGoogleUser('foo@email.com');

            // When asking if you can create
            const validation: MGPValidation = connectedUserService.canUserCreate();

            // Then it's should be authorised
            expect(validation.isSuccess()).toBeTrue();
        }));
        it('should refuse for a player already playing', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Player' } });

            // When asking if you can create
            const validation: MGPValidation = connectedUserService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_PLAYING());
        }));
        it('should refuse for a player already creator', fakeAsync(async() => { // UNSTABLE: last failed 2022-08-18
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Creator' } });

            // When asking if you can create
            const validation: MGPValidation = connectedUserService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CREATING());
        }));
        it('should refuse for a player already candidate', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Candidate' } });

            // When asking if you can create
            const validation: MGPValidation = connectedUserService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CANDIDATE());
        }));
        it('should refuse for a player already Chosen Opponent', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'ChosenOpponent' } });

            // When asking if you can create
            const validation: MGPValidation = connectedUserService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT());
        }));
        it('should refuse for a player already Observer', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Observer' } });

            // When asking if you can join some part
            const validation: MGPValidation = connectedUserService.canUserCreate();

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_OBSERVING());
        }));
    });
    describe('canUserJoin', () => {
        it('should allow user to join when user do not observe any part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            await createConnectedGoogleUser('foo@email.com');

            // When asking if you can join that specific part again
            const validation: MGPValidation = connectedUserService.canUserJoin('some-id');

            // Then it's should be authorised
            expect(validation.isSuccess()).toBeTrue();
        }));
        it('should allow user to join twice the same part', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Player' } });

            // When asking if you can join that specific part again
            const validation: MGPValidation = connectedUserService.canUserJoin('1234');

            // Then it's should be authorised
            expect(validation.isSuccess()).toBeTrue();
        }));
        it('should refuse for a player already playing', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Player' } });

            // When asking if you can join some part
            const validation: MGPValidation = connectedUserService.canUserJoin('some-id');

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_PLAYING());
        }));
        it('should refuse for a player already creator', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Creator' } });

            // When asking if you can join some part
            const validation: MGPValidation = connectedUserService.canUserJoin('some-id');

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CREATING());
        }));
        it('should refuse for a player already candidate', fakeAsync(async() => { // Instable: last failed 2022-08-18
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Candidate' } });

            // When asking if you can join some part
            const validation: MGPValidation = connectedUserService.canUserJoin('some-id');

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CANDIDATE());
        }));
        it('should refuse for a player already Chosen Opponent', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'ChosenOpponent' } });

            // When asking if you can join some part
            const validation: MGPValidation = connectedUserService.canUserJoin('some-id');

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT());
        }));
        it('should refuse for a player already Observer', fakeAsync(async() => {
            // Given a ConnectedUserService where user observe a part
            const uid: string = (await createConnectedGoogleUser('foo@email.com')).uid;
            await TestBed.inject(UserDAO).update(uid, { observedPart: { id: '1234', typeGame: 'P4', role: 'Observer' } });

            // When asking if you can join some part
            const validation: MGPValidation = connectedUserService.canUserJoin('some-id');

            // Then it's should be refused
            expect(validation.getReason()).toBe(GameActionFailure.YOU_ARE_ALREADY_OBSERVING());
        }));
    });
    afterEach(async() => {
        if (alreadyDestroyed === false) {
            connectedUserService.ngOnDestroy();
        }
        await auth.signOut();
    });
});

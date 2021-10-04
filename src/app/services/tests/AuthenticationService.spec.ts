import { AuthenticationService, AuthUser } from '../AuthenticationService';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { fakeAsync, TestBed } from '@angular/core/testing';
import firebase from 'firebase/app';
import 'firebase/auth';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { USE_EMULATOR as USE_DATABASE_EMULATOR } from '@angular/fire/database';
import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Utils } from 'src/app/utils/utils';

@Injectable()
export class AuthenticationServiceMock {
    private static CURRENT_USER: AuthUser = null;

    public static CONNECTED: AuthUser = {
        username: 'Jean Jaja',
        verified: true,
    }
    public static setUser(user: AuthUser): void {
        AuthenticationServiceMock.CURRENT_USER = user;
    }

    public getJoueurObs(): Observable<AuthUser> {
        return of(AuthenticationServiceMock.CURRENT_USER);
    }
    public getAuthenticatedUser(): AuthUser {
        if (AuthenticationServiceMock.CURRENT_USER == null) {
            throw new Error('MOCK VALUE CURRENT_USER NOT SET BEFORE USE');
        }
        return AuthenticationServiceMock.CURRENT_USER;
    }
    public async disconnect(): Promise<void> {
        return;
    }
    public async doRegister(): Promise<firebase.auth.UserCredential> {
        return null;
    }
    public sendEmailVerification(): Promise<void> {
        return null;
    }
    public doEmailLogin(): Promise<unknown> {
        return;
    }
    public doGoogleLogin(): Promise<unknown> {
        return;
    }
}

async function setupAuthTestModule(): Promise<unknown> {
    TestBed.configureTestingModule({
        imports: [
            AngularFirestoreModule,
            HttpClientModule,
            AngularFireModule.initializeApp({ apiKey: 'unknown', authDomain: 'unknown', projectId: 'my-project', databaseURL: 'http://localhost:8080' }),
        ],
        providers: [
            { provide: USE_AUTH_EMULATOR, useValue: ['localhost', 9099] },
            { provide: USE_DATABASE_EMULATOR, useValue: ['localhost', 9000] },
            { provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080] },
            { provide: USE_FUNCTIONS_EMULATOR, useValue: ['localhost', 5001] },
            AuthenticationService,
            AngularFireAuth,
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    const http: HttpClient = TestBed.inject(HttpClient);
    // Clear the firestore data before each test
    await http.delete('http://localhost:8080/emulator/v1/projects/my-project/databases/(default)/documents').toPromise();
    // Clear the auth data before each test
    await http.delete('http://localhost:9099/emulator/v1/projects/testing/accounts').toPromise();
    // Clear the rtdb data before each test
    // TODO: disabled because it breaks everything
    //  await firebase.database().ref().set(null);
    return;
}

export class AuthenticationServiceUnderTest extends AuthenticationService {
    public updatePresence(): Promise<void> {
        return null;
    }
}

async function createConnectedGoogleUser(): Promise<firebase.auth.UserCredential> {
    return await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential('{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'));
}


async function createGoogleUser(): Promise<firebase.auth.UserCredential> {
    const credential: firebase.auth.UserCredential = await createConnectedGoogleUser();
    await firebase.auth().signOut();
    return credential;
}

fdescribe('AuthenticationService', () => {
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
    describe('register', () => {
        it('should update user data upon successful registration', async() => {
            spyOn(service, 'updateUserData');

            // given an user that does not exist

            // when the user is registered
            const result: MGPFallible<firebase.User> = await service.doRegister(username, email, password);

            // then the user is successfully registered and its data is updated
            expect(result.isSuccess()).toBeTrue();
            expect(service.updateUserData).toHaveBeenCalledWith({ ...result.get(), displayName: username });
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
        it('should fail if there is no connected user', async() => {
            // given nothing

            // when the email verification is requested
            const result: MGPValidation = await service.sendEmailVerification();

            // then it fails
            expect(result).toEqual(MGPValidation.failure('Unlogged users cannot request for email verification'));
        });
        it('should fail if the user already verified its email', async() => {
            // given a connected user that is registered and verified, for example through a google account
            await createConnectedGoogleUser();

            // when the email verification is requested
            const result: MGPValidation = await service.sendEmailVerification();

            // then it fails
            expect(result).toEqual(MGPValidation.failure('Verified users should not ask email verification twice'));
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
        it('should fail when the password is incorrect', async() => {
            // given a registered user
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when logging in with email with an incorrect password,
            const result: MGPValidation = await service.doEmailLogin(email, 'helaba');

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered an invalid username or password.`);
        });
        it('should fail when the user is not registered', async() => {
            // given that the user does not exist

            // when trying to log in
            const result: MGPValidation = await service.doEmailLogin(email, password);

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(`You have entered an invalid username or password.`);
        });
    });
    describe('google login', () => {
        it('should delegate to signInPopup', async() => {
            // given a google user
            const user: firebase.auth.UserCredential = await createGoogleUser();
            spyOn(service.afAuth, 'signInWithPopup').and.returnValue(new Promise(
                (resolve: (credentials: firebase.auth.UserCredential) => void, _reject: (error: Error) => void) => {
                    resolve(user);
                }));

            // when the user connects with google
            const result: MGPValidation = await service.doGoogleLogin();

            // then it succeeded
            expect(result.isSuccess()).toBeTrue();
        });
        it('should fail if google login also fails', async() => {
            // given a google user that will fail to connect
            const error: firebase.FirebaseError = new Error('Invalid credential') as firebase.FirebaseError;
            error.code = 'auth/invalid-credential';
            spyOn(service.afAuth, 'signInWithPopup').and.returnValue(new Promise(
                (_resolve: (credentials: firebase.auth.UserCredential) => void, reject: (error: Error) => void) => {
                    reject(error);
                }));

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
        // TODO: disabled because calls to firebase.database().ref(...).set() time out with the emulator
        xit('should succeed if a user is connected, and result in the user being disconnected', async() => {
            // given a registered and connected user
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();
            await service.doEmailLogin(email, password);

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
    });

    it('To be clear for non async use, should distinguish non-connected and disconnected', async() => {
        let first: boolean = true;
        service.getJoueurObs().subscribe((user: AuthUser) => {
            if (first) {
                expect(user).toBe(AuthenticationService.NOT_AUTHENTICATED);
                first = false;
            }
        });
        // when the user connects and disconnect
        await createConnectedGoogleUser();
        await firebase.auth().signOut();

        // then it is definitely disconnected
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user).toEqual(AuthenticationService.NOT_CONNECTED);
        });
    });
    xdescribe('updatePresence', () => {
        it('should be called and update user presence when user gets connected', async() => {
            spyOn(service, 'updatePresence');

            // given a registered user
            expect((await service.doRegister(username, email, password)).isSuccess()).toBeTrue();

            // when the user logs in
            await service.doEmailLogin(email, password);

            // Then updatePresence is called
            expect(service.updatePresence).toHaveBeenCalled();
            service.getJoueurObs().subscribe((user: AuthUser) => {
                expect(user.username).toBe(username);
            });
        });
    });
    afterEach(async() => {
        await firebase.auth().signOut();
    });
});

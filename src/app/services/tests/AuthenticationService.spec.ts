import { AuthenticationService, AuthUser } from '../AuthenticationService';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { delay } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/auth';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { MGPValidation } from 'src/app/utils/MGPValidation';

@Injectable()
export class AuthenticationServiceMock {
    private static CURRENT_USER: AuthUser = null;

    public static CONNECTED: AuthUser = {
        pseudo: 'Jean Jaja',
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
            { provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080] },
            { provide: USE_AUTH_EMULATOR, useValue: ['localhost', 9099] },
            AuthenticationService,
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    // Clear the firestore data before each test
    const http: HttpClient = TestBed.inject(HttpClient);
    return http.delete('http://localhost:8080/emulator/v1/projects/my-project/databases/(default)/documents').toPromise();
}

export class AuthenticationServiceUnderTest extends AuthenticationService {
    public updatePresence(): Promise<void> {
        return null;
    }
}

describe('AuthenticationService', () => {
    function setupService(afAuth: unknown): AuthenticationService {
        const service: AuthenticationService =
            new AuthenticationServiceUnderTest(afAuth as AngularFireAuth, {} as AngularFirestore);
        spyOn(service, 'updatePresence');
        return service;
    }
    it('should create', () => {
        const service: AuthenticationService = setupService({ authState: of({ pseudo: 'Jean Jaja' }) });
        expect(service).toBeTruthy();
    });
    it('Should update user presence on db when user gets connected', fakeAsync(() => {
        const afAuth: unknown = { authState: of({ displayName: 'JeanJaja' }).pipe(delay(1)) };
        const service: AuthenticationService = setupService(afAuth);
        tick(1);
        expect(service.updatePresence).toHaveBeenCalled();
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user.pseudo).toBe('JeanJaja');
        });
    }));
    it('should show email when user does not have a display name', fakeAsync(() => {
        const afAuth: unknown = { authState: of({ email: 'jean@jaja.europe' }).pipe(delay(1)) };
        const service: AuthenticationService = setupService(afAuth);
        tick(1);
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user.pseudo).toBe('jean@jaja.europe');
        });
    }));
    it('To be clear for non async use, should distinguish non-connected and disconnected', fakeAsync(() => {
        const afAuth: unknown = { authState: of(null).pipe(delay(10)) };
        const service: AuthenticationService = setupService(afAuth);
        let first: boolean = true;
        service.getJoueurObs().subscribe((user: AuthUser) => {
            if (first) {
                expect(user).toBe(AuthenticationService.NOT_AUTHENTICATED);
                first = false;
            }
        });
        tick(10);
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user).toEqual(AuthenticationService.NOT_CONNECTED);
        });
    }));
    fdescribe('email login', () => {
        let userToDelete: firebase.User;
        it('should succeed when the password is correct', async() => {
            await setupAuthTestModule();
            const service: AuthenticationService = TestBed.inject(AuthenticationService);

            // given a registered user
            const credential: firebase.auth.UserCredential =
                await service.doRegister('jeanjaja', 'jean@jaja.europe', 'hunter2');
            userToDelete = credential.user;

            // when logging in with email with the right password
            const result: MGPValidation = await service.doEmailLogin('jean@jaja.europe', 'hunter2');

            // then the login succeeds
            expect(result.isSuccess()).toBeTrue();
        });
        it('should fail when the password is incorrect', async() => {
            await setupAuthTestModule();
            const service: AuthenticationService = TestBed.inject(AuthenticationService);

            // given a registered user
            const credential: firebase.auth.UserCredential =
                await service.doRegister('jeanjaja', 'jean@jaja.europe', 'hunter2');
            userToDelete = credential.user;

            // when logging in with email with an incorrect password,
            const result: MGPValidation = await service.doEmailLogin('jean@jaja.europe', 'helaba');

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('The password is invalid or the user does not have a password.');
        });
        it('should fail when the user is not registered', async() => {
            await setupAuthTestModule();
            const service: AuthenticationService = TestBed.inject(AuthenticationService);

            // given that the user does not exist

            // when trying to log in
            const result: MGPValidation = await service.doEmailLogin('jean@jaja.europe', 'hunter2');

            // then the login fails
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe('There is no user record corresponding to this identifier. The user may have been deleted.');
        });
        afterEach(() => {
            // clean up: remove user
            if (userToDelete != null) {
                userToDelete.delete();
            }
        });
    });
});

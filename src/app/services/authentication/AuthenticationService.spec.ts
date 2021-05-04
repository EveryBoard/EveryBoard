import { AuthenticationService, AuthUser } from './AuthenticationService';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { delay } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Injectable } from '@angular/core';

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
        if (AuthenticationServiceMock.CURRENT_USER == null) {
            throw new Error('MOCK VALUE CURRENT_USER NOT SET BEFORE USE');
        }
        return of(AuthenticationServiceMock.CURRENT_USER);
    }
    public getAuthenticatedUser(): AuthUser {
        if (AuthenticationServiceMock.CURRENT_USER == null) {
            throw new Error('MOCK VALUE CURRENT_USER NOT SET BEFORE USE');
        }
        return AuthenticationServiceMock.CURRENT_USER;
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
    it('Should update user presence on db when he got connected', fakeAsync(() => {
        const afAuth: unknown = { authState: of({ displayName: 'JeanJaja' }).pipe(delay(1)) };
        const service: AuthenticationService = setupService(afAuth);
        tick(1);
        expect(service.updatePresence).toHaveBeenCalled();
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user.pseudo).toBe('JeanJaja');
        });
    }));
    it('should show email when user don\'t have a display name', fakeAsync(() => {
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
});

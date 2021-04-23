import { AuthenticationService, AuthUser } from './AuthenticationService';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { delay } from 'rxjs/operators';

class AuthenticationServiceUnderTest extends AuthenticationService {

    public updatePresence(): void {}
}
describe('AuthenticationService', () => {

    it('should create', () => {
        const afAuth: any = { authState: of({ pseudo: 'JeanJaja '}) };
        const afs: unknown = {};
        const service: AuthenticationServiceUnderTest =
            new AuthenticationServiceUnderTest(afAuth as AngularFireAuth, afs as AngularFirestore);
        expect(service).toBeTruthy();
    });
    it('Should update user presence on db when he got connected', fakeAsync(() => {
        const afAuth: any = { authState: of({ displayName: 'JeanJaja' }).pipe(delay(1)) };
        const service: AuthenticationServiceUnderTest =
            new AuthenticationServiceUnderTest(afAuth as AngularFireAuth, {} as AngularFirestore);
        spyOn(service, 'updatePresence').and.callThrough();
        tick(1);
        expect(service.updatePresence).toHaveBeenCalled();
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user.pseudo).toBe('JeanJaja');
        });
    }));
    it('should show email when user don\'t have a display name', fakeAsync(() => {
        const afAuth: any = { authState: of({ email: 'jean@jaja.europe' }).pipe(delay(1)) };
        const service: AuthenticationServiceUnderTest =
            new AuthenticationServiceUnderTest(afAuth as AngularFireAuth, {} as AngularFirestore);
        tick(1);
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user.pseudo).toBe('jean@jaja.europe');
        });
    }));
    it('To be clear for non async use, should distinguish non-connected and disconnected', fakeAsync(() => {
        const afAuth: any = { authState: of(null).pipe(delay(10)) };
        const service: AuthenticationServiceUnderTest =
            new AuthenticationServiceUnderTest(afAuth as AngularFireAuth, {} as AngularFirestore);
        let first: boolean = true;
        service.getJoueurObs().subscribe((user: AuthUser) => {
            if (first) {
                expect(user).toBe(AuthenticationService.NOT_CONNECTED);
                first = false;
            }
        });
        tick(10);
        service.getJoueurObs().subscribe((user: AuthUser) => {
            expect(user).toEqual(AuthenticationService.DISCONNECTED);
        });
    }));
});

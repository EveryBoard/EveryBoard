import { EmailVerified } from './EmailVerified';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { fakeAsync } from '@angular/core/testing';

class RouterMock {
    public async navigate(to: string[]): Promise<boolean> {
        return Promise.resolve(true);
    }
}
const afAuth: unknown = {
    authState: of(null),
};
const afs: unknown = {
};
describe('EmailVerified', () => {
    let guard: EmailVerified;

    let authService: AuthenticationService;

    let router: Router;

    beforeEach(() => {
        authService = new AuthenticationService(afAuth as AngularFireAuth, afs as AngularFirestore);
        router = new RouterMock() as Router;
        guard = new EmailVerified(authService, router);
    });
    it('should create', () => {
        expect(guard).toBeTruthy();
    });
    it('should move unconnected user to login page and refuse them', async() => {
        authService.getJoueurObs = () => of(AuthenticationService.NOT_CONNECTED);
        spyOn(router, 'navigate');

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
    it('should move unverified user to confirm-inscription page and refuse them', async() => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanMichelNouveau user', verified: false });
        spyOn(router, 'navigate');

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
    });
    it('should accept logged user', async() => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanJaJa Toujours là', verified: true });

        expect(await guard.canActivate()).toBeTrue();
    });
});

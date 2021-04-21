import { EmailVerified } from './EmailVerified';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

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
    it('should move unconnected user to login page and refuse them', () => {
        authService.getAuthenticatedUser = () => {
            return AuthenticationService.NOT_CONNECTED;
        };
        spyOn(router, 'navigate');

        const authorisation: boolean = guard.canActivate();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(authorisation).toBeFalse();
    });
    it('should move unverified user to confirm-inscription page and refuse them', () => {
        authService.getAuthenticatedUser = () => {
            return { pseudo: 'JeanMichelNouveau user', verified: false };
        };
        spyOn(router, 'navigate');

        const authorisation: boolean = guard.canActivate();

        expect(router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
        expect(authorisation).toBeFalse();
    });
    it('should accept logged user', () => {
        authService.getAuthenticatedUser = () => {
            return { pseudo: 'JeanJaJa Toujours là', verified: true };
        };

        const authorisation: boolean = guard.canActivate();

        expect(authorisation).toBeTrue();
    });
    it('Should take in account the fact that at first user is not yet connected');
});

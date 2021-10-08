import { EmailVerified } from '../EmailVerified';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { AuthenticationServiceUnderTest } from 'src/app/services/tests/AuthenticationService.spec';
import { fakeAsync } from '@angular/core/testing';

describe('EmailVerified', () => {

    let guard: EmailVerified;

    let authService: AuthenticationService;

    let router: Router;

    beforeEach(() => {
        authService = new AuthenticationServiceUnderTest(
            { authState: of(null) } as AngularFireAuth, {} as AngularFirestore);
        router = {
            navigate: jasmine.createSpy('navigate'),
        } as unknown as Router;
        guard = new EmailVerified(authService, router);
    });
    it('should create', () => {
        expect(guard).toBeTruthy();
    });
    it('should move unconnected user to login page and refuse them', fakeAsync(async() => {
        authService.getJoueurObs = () => of(AuthenticationService.NOT_CONNECTED);

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));
    it('should move unverified user to confirm-inscription page and refuse them', fakeAsync(async() => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanMichelNouveau user', verified: false });

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
    }));
    it('should accept logged user', fakeAsync(async() => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanJaJa Toujours là', verified: true });

        expect(await guard.canActivate()).toBeTrue();
    }));
});

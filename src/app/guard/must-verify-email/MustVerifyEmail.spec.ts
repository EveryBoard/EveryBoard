import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { MustVerifyEmail } from './MustVerifyEmail';

describe('EmailVerified', () => {
    let guard: MustVerifyEmail;

    let authService: AuthenticationService;

    let router: Router;

    beforeEach(() => {
        authService = {} as AuthenticationService;
        router = {
            navigate: jasmine.createSpy('navigate'),
        } as unknown as Router;
        guard = new MustVerifyEmail(authService, router);
    });
    it('should create', () => {
        expect(guard).toBeTruthy();
    });
    it('should move unconnected user to login page and refuse them', async() => {
        authService.getJoueurObs = () => of(AuthenticationService.NOT_CONNECTED);

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
    it('should move verified user to login page and refuse them', async() => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanMichelNouveau user', verified: true });

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
    it('should accept logged unverified user', async() => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanJaja ToujoursLà', verified: false });

        expect(await guard.canActivate()).toBeTrue();
    });
});

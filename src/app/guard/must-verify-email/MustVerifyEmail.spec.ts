import { fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { MustVerifyEmail } from './MustVerifyEmail';

class RouterMock {
    public async navigate(to: string[]): Promise<boolean> {
        return Promise.resolve(true);
    }
}
describe('EmailVerified', () => {
    let guard: MustVerifyEmail;

    let authService: AuthenticationService;

    let router: Router;

    beforeEach(() => {
        authService = {} as AuthenticationService;
        router = new RouterMock() as Router;
        guard = new MustVerifyEmail(authService, router);
    });
    it('should create', () => {
        expect(guard).toBeTruthy();
    });
    it('should move unconnected user to login page and refuse them', fakeAsync(() => {
        authService.getJoueurObs = () => of(AuthenticationService.DISCONNECTED);
        spyOn(router, 'navigate');

        let observableEnded: boolean;
        guard.canActivate().subscribe((canActivate: boolean) => {
            expect(canActivate).toBeFalse();
            observableEnded = true;
        });
        tick();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(observableEnded).toBeTrue();
    }));
    it('should move verified user to login page and refuse them', () => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanMichelNouveau user', verified: true });
        spyOn(router, 'navigate');

        let observableEnded: boolean;
        guard.canActivate().subscribe((canActivate: boolean) => {
            expect(canActivate).toBeFalse();
            observableEnded = true;
        });

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(observableEnded).toBeTrue();
    });
    it('should accept logged unverified user', () => {
        authService.getJoueurObs = () => of({ pseudo: 'JeanJaja ToujoursLà', verified: false });

        let observableEnded: boolean;
        guard.canActivate().subscribe((canActivate: boolean) => {
            expect(canActivate).toBeTrue();
            observableEnded = true;
        });

        expect(observableEnded).toBeTrue();
    });
});

import { Router } from '@angular/router';
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
    it('should move unconnected user to login page and refuse them', () => {
        authService.getAuthenticatedUser = () => {
            return { pseudo: null, verified: null };
        };
        spyOn(router, 'navigate');

        const authorisation: boolean = guard.canActivate();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(authorisation).toBeFalse();
    });
    it('should move verified user to login page and refuse them', () => {
        authService.getAuthenticatedUser = () => {
            return { pseudo: 'JeanMichelNouveau user', verified: true };
        };
        spyOn(router, 'navigate');

        const authorisation: boolean = guard.canActivate();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(authorisation).toBeFalse();
    });
    it('should accept logged unverified user', () => {
        authService.getAuthenticatedUser = () => {
            return { pseudo: 'JeanJaJa Toujours là', verified: false };
        };

        const authorisation: boolean = guard.canActivate();

        expect(authorisation).toBeTrue();
    });
});

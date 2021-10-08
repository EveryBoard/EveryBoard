import { VerifiedAccount } from '../VerifiedAccount';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { Router } from '@angular/router';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';

fdescribe('VerifiedAccount', () => {
    let guard: VerifiedAccount;

    let authService: AuthenticationService;

    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
            ],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        authService = TestBed.inject(AuthenticationService);
        guard = new VerifiedAccount(authService, router);
    });
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should move unconnected user to login page and refuse them', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));
    it('should move unverified user to must-verify-email page and refuse them', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED_UNVERIFIED);

        expect(await guard.canActivate()).toBeFalse();

        expect(router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
    }));
    it('should accept verified user', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);

        expect(await guard.canActivate()).toBeTrue();
    }));
});

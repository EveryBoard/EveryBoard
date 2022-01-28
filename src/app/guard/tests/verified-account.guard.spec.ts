/* eslint-disable max-lines-per-function */
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { Router } from '@angular/router';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { VerifiedAccountGuard } from '../verified-account.guard';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('VerifiedAccountGuard', () => {
    let guard: VerifiedAccountGuard;

    let authService: AuthenticationService;

    let router: Router;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
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
        guard = new VerifiedAccountGuard(authService, router);
    }));
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should move unconnected user to login page and refuse them', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/login'));
    }));
    it('should move unverified user to verify-account page and refuse them', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED_UNVERIFIED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/verify-account'));
    }));
    it('should move users without username to verify-account page and refuse them', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(new AuthUser(MGPOptional.of('jeanjaja@gmail.com'), MGPOptional.empty(), false));
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/verify-account'));
    }));
    it('should accept verified user', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    }));
    it('should unsubscribe from userSub upon destruction', fakeAsync(async() => {
        // Given a guard that has executed
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        await guard.canActivate();
        spyOn(guard['userSub'], 'unsubscribe');

        // When destroying the guard
        guard.ngOnDestroy();

        // Then unsubscribe is called
        expect(guard['userSub'].unsubscribe).toHaveBeenCalledWith();
    }));
});

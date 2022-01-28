/* eslint-disable max-lines-per-function */
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { Router } from '@angular/router';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { ConnectedButNotVerifiedGuard } from '../connected-but-not-verified.guard';

describe('ConnectedButNotVerifiedGuard', () => {
    let guard: ConnectedButNotVerifiedGuard;

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
        guard = new ConnectedButNotVerifiedGuard(authService, router);
    }));
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should move unconnected user to login page', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/login'));
    }));
    it('should accept unverified users', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED_UNVERIFIED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    }));
    it('should move verified user to the main page', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/'));
    }));
    it('should unsubscribe from userSub upon destruction', fakeAsync(async() => {
        // Given a guard that has resolved
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        await guard.canActivate();
        spyOn(guard['userSub'], 'unsubscribe');

        // When destroying the guard
        guard.ngOnDestroy();

        // Then unsubscribe is called
        expect(guard['userSub'].unsubscribe).toHaveBeenCalledWith();
    }));
});

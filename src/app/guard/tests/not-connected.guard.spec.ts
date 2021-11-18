import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { Router } from '@angular/router';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { NotConnectedGuard } from '../not-connected.guard';

describe('NotConnectedGuard', () => {
    let guard: NotConnectedGuard;

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
        guard = new NotConnectedGuard(authService, router);
    });
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should accept unconnected users', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    }));
    it('should move connected (but unverified) users to the main page', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED_UNVERIFIED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/'));
    }));
    it('should move verified user to the main page', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/'));
    }));
});

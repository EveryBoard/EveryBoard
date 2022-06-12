/* eslint-disable max-lines-per-function */
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { Router } from '@angular/router';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { VerifiedAccountGuard } from '../verified-account.guard';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('VerifiedAccountGuard', () => {
    let guard: VerifiedAccountGuard;

    let authService: ConnectedUserService;

    let router: Router;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
            ],
            providers: [
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        authService = TestBed.inject(ConnectedUserService);
        guard = new VerifiedAccountGuard(authService, router);
    }));
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should move unconnected user to login page and refuse them', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/login'));
    }));
    it('should move unverified user to verify-account page and refuse them', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_UNVERIFIED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/verify-account'));
    }));
    it('should move users without username to verify-account page and refuse them', fakeAsync(async() => {
        const user: AuthUser = new AuthUser('jeanjaja128k', MGPOptional.of('jeanjaja@gmail.com'), MGPOptional.empty(), false);
        ConnectedUserServiceMock.setUser(user);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/verify-account'));
    }));
    it('should accept verified user', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    }));
    it('should unsubscribe from userSub upon destruction', fakeAsync(async() => {
        // Given a guard that has executed
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        await guard.canActivate();
        // eslint-disable-next-line dot-notation
        spyOn(guard['userSub'], 'unsubscribe');

        // When destroying the guard
        guard.ngOnDestroy();

        // Then unsubscribe is called
        // eslint-disable-next-line dot-notation
        expect(guard['userSub'].unsubscribe).toHaveBeenCalledWith();
    }));
});

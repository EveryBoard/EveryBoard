/* eslint-disable max-lines-per-function */
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { provideRouter, Router } from '@angular/router';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { VerifiedAccountGuard } from '../verified-account.guard';
import { MGPOptional } from '@everyboard/lib';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('VerifiedAccountGuard', () => {
    let guard: VerifiedAccountGuard;

    let connectedUserService: ConnectedUserService;

    let router: Router;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            providers: [
                provideRouter([
                    { path: '**', component: BlankComponent },
                ]),
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        connectedUserService = TestBed.inject(ConnectedUserService);
        guard = new VerifiedAccountGuard(connectedUserService, router);
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
});

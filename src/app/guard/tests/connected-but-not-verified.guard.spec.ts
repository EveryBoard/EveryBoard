/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { UserMocks } from '../../domain/UserMocks.spec';
import { ConnectedUserService, AuthUser } from '../../services/ConnectedUserService';
import { ConnectedUserServiceMock } from '../../services/tests/ConnectedUserService.spec';
import { BlankComponent } from '../../utils/tests/TestUtils.spec';
import { ConnectedButNotVerifiedGuard } from '../connected-but-not-verified.guard';

describe('ConnectedButNotVerifiedGuard', () => {
    let guard: ConnectedButNotVerifiedGuard;

    let connectedUserService: ConnectedUserService;

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
        spyOn(router, 'navigate').and.resolveTo(true);
        connectedUserService = TestBed.inject(ConnectedUserService);
        guard = new ConnectedButNotVerifiedGuard(connectedUserService, router);
    }));
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should move unconnected user to login page', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/login'));
    }));
    it('should accept unverified users', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_UNVERIFIED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    }));
    it('should move verified user to the main page', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/'));
    }));
});

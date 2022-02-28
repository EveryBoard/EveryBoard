/* eslint-disable max-lines-per-function */
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { Router } from '@angular/router';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { NotConnectedGuard } from '../not-connected.guard';

describe('NotConnectedGuard', () => {
    let guard: NotConnectedGuard;

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
        guard = new NotConnectedGuard(authService, router);
    }));
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should accept unconnected users', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    }));
    it('should move connected (but unverified) users to the main page', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(ConnectedUserServiceMock.CONNECTED_UNVERIFIED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/'));
    }));
    it('should move verified user to the main page', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(ConnectedUserServiceMock.CONNECTED);
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/'));
    }));
    it('should unsubscribe from userSub upon destruction', fakeAsync(async() => {
        // Given a guard that has executed
        ConnectedUserServiceMock.setUser(ConnectedUserServiceMock.CONNECTED);
        await guard.canActivate();
        spyOn(guard['userSub'], 'unsubscribe');

        // When destroying the guard
        guard.ngOnDestroy();

        // Then unsubscribe is called
        expect(guard['userSub'].unsubscribe).toHaveBeenCalledWith();
    }));
});

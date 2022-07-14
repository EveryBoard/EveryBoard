/* eslint-disable max-lines-per-function */
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { Router } from '@angular/router';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { VerifiedAndNotActiveGuard } from '../verified-and-not-active.guard';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { PartDocument } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('VerifiedAndNotActiveGuard', () => {

    let guard: VerifiedAndNotActiveGuard;

    let authService: ConnectedUserService;

    let router: Router;

    const startedPartUserPlay: PartDocument = new PartDocument('I-play', PartMocks.STARTED);

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
        const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
        guard = new VerifiedAndNotActiveGuard(authService, messageDisplayer, router);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
    }));
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should delegate the first part of evaluate to mother class', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        spyOn(guard, 'evaluateUserPermission').and.callThrough();
        await guard.canActivate();
        expect('TODOTODO: check the best way to test that its indeed sharing rules with mother').toBe('donydone');
    }));
    it('should refuse to go to creation component when you have any observed part and redirect to it', fakeAsync(async() => {
        // Given a connected user service indicating user is already player
        ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
            id: startedPartUserPlay.id,
            role: 'Player',
            typeGame: 'P4',
        }));
        // When asking if user can go to this page
        // Then it should be refused
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/play/P4/I-play'));
        tick(3000);
    }));
    it('shoud allow to go to this component when you are not doing anything', async() => {
        // Given a connected user not observing any part
        ConnectedUserServiceMock.setObservedPart(MGPOptional.empty());

        // When asking if user can go to this component
        // Then it should be accepted
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    });
});

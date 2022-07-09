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
import { LobbyComponentFailure } from 'src/app/components/normal-component/lobby/lobby.component';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('VerifiedAndNotActiveGuard', () => {

    let guard: VerifiedAndNotActiveGuard;

    let authService: ConnectedUserService;

    let router: Router;

    const unstartedPartUserCreated: PartDocument = new PartDocument('I-create', PartMocks.INITIAL);
    const unstartedPartUserDidNotCreate: PartDocument = new PartDocument('I-did-not-create', PartMocks.ANOTHER_UNSTARTED);

    const startedPartUserPlay: PartDocument = new PartDocument('I-play', PartMocks.STARTED);
    const startedPartUserDoNotPlay: PartDocument = new PartDocument('I-do-not-play', PartMocks.OTHER_STARTED);

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
    it('should refuse to go to creation component when you are already player', fakeAsync(async() => {
        // Given a connected user service indicating user is already player
        ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
            id: startedPartUserPlay.id,
            role: 'Player',
            typeGame: 'P4',
        }));
        // When asking if user can go to this page
        // Then a refusal should be toasted
        const expectedError: string = LobbyComponentFailure.YOU_ARE_ALREADY_PLAYING();
        spyOn(guard.messageDisplayer, 'criticalMessage').and.callThrough();
        await expectAsync(guard.canActivate()).toBeResolvedTo(false);
        tick(3000);
        expect(guard.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(expectedError);
    }));
    it('should refuse to go to creation component when you are already creator', fakeAsync(async() => {
        // Given a connected user service indicating user is already creator
        ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
            id: unstartedPartUserCreated.id,
            role: 'Creator',
            typeGame: 'P4',
        }));
        // When asking if user can go to this page
        // Then a refusal should be toasted
        const expectedError: string = LobbyComponentFailure.YOU_ARE_ALREADY_CREATING();
        spyOn(guard.messageDisplayer, 'criticalMessage').and.callThrough();
        await expectAsync(guard.canActivate()).toBeResolvedTo(false);
        tick(3000);
        expect(guard.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(expectedError);
    }));
    it('should refuse to go to creation component when you are already observer', fakeAsync(async() => {
        // Given a connected user service indicating user is already observer
        ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
            id: startedPartUserDoNotPlay.id,
            role: 'Observer',
            typeGame: 'P4',
        }));
        // When asking if user can go to this page
        // Then a refusal should be toasted
        const expectedError: string = LobbyComponentFailure.YOU_ARE_ALREADY_OBSERVING();
        spyOn(guard.messageDisplayer, 'criticalMessage').and.callThrough();
        await expectAsync(guard.canActivate()).toBeResolvedTo(false);
        tick(3000);
        expect(guard.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(expectedError);
    }));
    it('should refuse to go to creation component when you are already candidate', fakeAsync(async() => {
        // Given a connected user service indicating user is already candidate
        ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
            id: unstartedPartUserDidNotCreate.id,
            role: 'Candidate',
            typeGame: 'P4',
        }));
        // When asking if user can go to this page
        // Then a refusal should be toasted
        const expectedError: string = LobbyComponentFailure.YOU_ARE_ALREADY_CANDIDATE();
        spyOn(guard.messageDisplayer, 'criticalMessage').and.callThrough();
        await expectAsync(guard.canActivate()).toBeResolvedTo(false);
        tick(3000);
        expect(guard.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(expectedError);
    }));
    it('should refuse to go to creation component when you are already chosen opponent', fakeAsync(async() => {
        // Given a connected user service indicating user is already chosen opponent
        ConnectedUserServiceMock.setObservedPart(MGPOptional.of({
            id: unstartedPartUserDidNotCreate.id,
            role: 'ChosenOpponent',
            typeGame: 'P4',
        }));
        // When asking if user can go to this page
        // Then a refusal should be toasted
        const expectedError: string = LobbyComponentFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();
        spyOn(guard.messageDisplayer, 'criticalMessage').and.callThrough();
        await expectAsync(guard.canActivate()).toBeResolvedTo(false);
        tick(3000);
        expect(guard.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(expectedError);
    }));
    it('shoud allow to go to this component when you are not doing anything', async() => {
        // Given a connected user not observing any part
        ConnectedUserServiceMock.setObservedPart(MGPOptional.empty());

        // When asking if user can go to this component
        // Then it should be accepted
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    });
});

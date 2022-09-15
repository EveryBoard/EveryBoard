/* eslint-disable max-lines-per-function */
import { Router } from '@angular/router';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { ExclusiveOnlineGameGuard } from '../exclusive-online-game-guard';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { PartDocument } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { ObservedPartServiceMock } from 'src/app/services/tests/ObservedPartService.spec';

describe('ExclusiveOnlineGameGuard', () => {

    let guard: ExclusiveOnlineGameGuard;

    let observedPartService: ObservedPartService;

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
                { provide: ObservedPartService, useClass: ObservedPartServiceMock },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();
        observedPartService = TestBed.inject(ObservedPartService);
        const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
        guard = new ExclusiveOnlineGameGuard(observedPartService, messageDisplayer, router);
    }));
    it('should create', () => {
        expect(guard).toBeDefined();
    });
    it('should refuse to go to creation component when you have any observed part and redirect to it', fakeAsync(async() => {
        // Given a connected user service indicating user is already player
        ObservedPartServiceMock.setObservedPart(MGPOptional.of({
            id: startedPartUserPlay.id,
            role: 'Player',
            typeGame: 'P4',
        }));
        // When asking if user can go to this page
        // Then it should be refused
        await expectAsync(guard.canActivate()).toBeResolvedTo(router.parseUrl('/play/P4/I-play'));
        tick(3000);
    }));
    it('shoud allow to activate when you are not doing anything', async() => {
        // Given a connected user not observing any part
        ObservedPartServiceMock.setObservedPart(MGPOptional.empty());

        // When asking if user can go to this component
        // Then it should be accepted
        await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    });
    it('should unsubscribe from observedPartSubscription upon destruction', fakeAsync(async() => {
        // Given a guard that has resolved
        ObservedPartServiceMock.setObservedPart(MGPOptional.empty());
        await guard.canActivate();
        // eslint-disable-next-line dot-notation
        spyOn(guard['observedPartSubscription'], 'unsubscribe').and.callThrough();

        // When destroying the guard
        guard.ngOnDestroy();

        // Then unsubscribe is called
        // eslint-disable-next-line dot-notation
        expect(guard['observedPartSubscription'].unsubscribe).toHaveBeenCalledWith();
    }));
});

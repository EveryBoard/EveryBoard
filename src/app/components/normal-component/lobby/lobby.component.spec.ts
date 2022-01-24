/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { LobbyComponent } from './lobby.component';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { BehaviorSubject } from 'rxjs';
import { PartDocument } from 'src/app/domain/Part';

describe('LobbyComponent', () => {

    let testUtils: SimpleComponentTestUtils<LobbyComponent>;
    let component: LobbyComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LobbyComponent);
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        component = testUtils.getComponent();
    }));
    it('should create', fakeAsync(async() => {
        expect(component).toBeDefined();
        component.ngOnInit();
    }));
    it('should display online-game-selection component when clicking on tab-create element', fakeAsync(async() => {
        // Given a server page
        testUtils.detectChanges();

        // When clicking on the 'create game' tab
        await testUtils.clickElement('#tab-create');
        await testUtils.whenStable();

        // Then online-game-selection component is on the page
        testUtils.expectElementToExist('#online-game-selection');
    }));

    it('Should redirect to /play when clicking a game', fakeAsync(async() => {
        // Given a server with one active part
        const activePart: PartDocument = new PartDocument('some-part-id', PartMocks.INITIAL);
        const activePartsService: ActivePartsService = TestBed.inject(ActivePartsService);
        spyOn(activePartsService, 'getActivePartsObs').and.returnValue((new BehaviorSubject([activePart])).asObservable());
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
        testUtils.detectChanges();

        // When clicking on the part
        await testUtils.clickElement('#part_0');

        // Then the component should navigate to the part
        expect(router.navigate).toHaveBeenCalledOnceWith(['/play/', 'Quarto', 'some-part-id']);
    }));
    it('should stop watching current part observable and part list when destroying component', fakeAsync(async() => {
        // Given a server page
        testUtils.detectChanges();
        spyOn(component['activePartsSub'], 'unsubscribe').and.callThrough();
        const activePartsService: ActivePartsService = TestBed.inject(ActivePartsService);
        spyOn(activePartsService, 'stopObserving').and.callThrough();

        // When destroying the component
        component.ngOnDestroy();

        // Then the router active part observer should have been unsubscribed
        expect(component['activePartsSub'].unsubscribe).toHaveBeenCalledOnceWith();
        // and ActivePartsService should have been told to stop observing
        expect(activePartsService.stopObserving).toHaveBeenCalledOnceWith();
    }));
});

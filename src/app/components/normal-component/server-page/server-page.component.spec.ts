/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { ServerPageComponent } from './server-page.component';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ActivesPartsService } from 'src/app/services/ActivesPartsService';
import { BehaviorSubject } from 'rxjs';

describe('ServerPageComponent', () => {

    let testUtils: SimpleComponentTestUtils<ServerPageComponent>;
    let component: ServerPageComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(ServerPageComponent);
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        component = testUtils.getComponent();
    }));
    it('should create', fakeAsync(async() => {
        expect(component).toBeDefined();
        component.ngOnInit();
    }));
    it('should rely on online-game-selection component to create online games', fakeAsync(async() => {
        // When the component is loaded
        testUtils.detectChanges();

        // Clicking on the 'create game' tab
        testUtils.clickElement('#tab-create');
        await testUtils.whenStable();

        // Then online-game-selection component is on the page
        testUtils.expectElementToExist('#online-game-selection');
    }));

    it('Should redirect to /play when clicking a game', fakeAsync(async() => {
        // Given a server with one active part
        const activePart: ICurrentPartId = {
            id: 'some-part-id',
            doc: PartMocks.INITIAL.doc,
        };
        const activePartsService: ActivesPartsService = TestBed.inject(ActivesPartsService);
        spyOn(activePartsService, 'getActivePartsObs').and.returnValue((new BehaviorSubject([activePart])).asObservable());
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
        testUtils.detectChanges();

        // When clicking on the part
        testUtils.clickElement('#part_0');

        // Then the component navigates to the part
        expect(router.navigate).toHaveBeenCalledOnceWith(['/play/Quarto', 'some-part-id']);
    }));
    it('should stop watching current part observable when destroying component', fakeAsync(async() => {
        // given a server page
        testUtils.detectChanges();
        spyOn(component['activePartsSub'], 'unsubscribe').and.callThrough();

        // when destroying the component
        component.ngOnDestroy();

        // then router should have navigate
        expect(component['activePartsSub'].unsubscribe).toHaveBeenCalledOnceWith();
    }));
});

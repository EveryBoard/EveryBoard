/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LobbyComponent } from './lobby.component';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { BehaviorSubject } from 'rxjs';
import { PartDocument } from 'src/app/domain/Part';
import { OnlineGameWrapperComponent } from '../../wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { User } from 'src/app/domain/User';
import { DebugElement } from '@angular/core';

describe('LobbyComponent', () => {

    let testUtils: SimpleComponentTestUtils<LobbyComponent>;
    let component: LobbyComponent;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LobbyComponent);
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
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
        expectValidRouting(router, ['/play', 'Quarto', 'some-part-id'], OnlineGameWrapperComponent);
    }));
    it('should stop watching current part observable and part list when destroying component', fakeAsync(async() => {
        // Given a server page
        testUtils.detectChanges();
        spyOn(component['activePartsSub'], 'unsubscribe').and.callThrough();
        const activePartsService: ActivePartsService = TestBed.inject(ActivePartsService);
        spyOn(activePartsService, 'stopObserving');

        // When destroying the component
        component.ngOnDestroy();

        // Then the router active part observer should have been unsubscribed
        expect(component['activePartsSub'].unsubscribe).toHaveBeenCalledOnceWith();
        // and ActivePartsService should have been told to stop observing
        expect(activePartsService.stopObserving).toHaveBeenCalledOnceWith();
    }));
    it('should display firebase time HH:mm:ss', fakeAsync(() => {
        // Given a lobby in which we observe tab chat, and where one user is here
        const HH: number = 11 * 3600;
        const mm: number = 34 * 60;
        const ss: number = 56;
        const timeStampInSecond: number = HH + mm + ss;
        const userWithLastChange: User = {
            ...UserMocks.CREATOR,
            last_changed: { seconds: timeStampInSecond, nanoseconds: 0 },
        };
        void TestBed.inject(UserDAO).set(UserMocks.CREATOR_AUTH_USER.id, userWithLastChange);
        tick();
        void testUtils.clickElement('#tab-chat');
        tick();

        // When rendering it
        testUtils.detectChanges();

        // Then the date should be written in format HH:mm:ss (with 1h added due to Locale?)
        const element: DebugElement = testUtils.findElement('#' + UserMocks.CREATOR_MINIMAL_USER.name);
        const time: string = element.nativeElement.innerText;
        expect(time).toBe(UserMocks.CREATOR_MINIMAL_USER.name + ': 11:34:56');
    }));
});

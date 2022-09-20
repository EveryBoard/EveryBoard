/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DebugElement } from '@angular/core';
import { formatDate } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectValidRouting, prepareUnsubscribeCheck, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { PartDocument } from 'src/app/domain/Part';
import { OnlineGameWrapperComponent } from '../../wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { User } from 'src/app/domain/User';
import { Timestamp } from 'firebase/firestore';
import { ActiveUsersService } from 'src/app/services/ActiveUsersService';
import { Subscription } from 'rxjs';

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
        // Given a lobby
        testUtils.detectChanges();

        // When clicking on the 'create game' tab
        await testUtils.clickElement('#tab-create');
        await testUtils.whenStable();

        // Then online-game-selection component is on the page
        testUtils.expectElementToExist('#online-game-selection');
    }));
    it('Should redirect to /play when clicking a game', fakeAsync(async() => {
        // Given a lobby with one active part
        const activePart: PartDocument = new PartDocument('some-part-id', PartMocks.INITIAL);
        const activePartsService: ActivePartsService = TestBed.inject(ActivePartsService);
        spyOn(activePartsService, 'subscribeToActiveParts').and.callFake(
            (callback: (parts: PartDocument[]) => void) => {
                callback([activePart]);
                return new Subscription();
            });
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();
        testUtils.detectChanges();

        // When clicking on the part
        await testUtils.clickElement('#part_0');

        // Then the component should navigate to the part
        expectValidRouting(router, ['/play', 'Quarto', 'some-part-id'], OnlineGameWrapperComponent);
    }));
    it('should unsubscribe from active parts when destroying component', fakeAsync(async() => {
        // Given the lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(ActivePartsService), 'subscribeToActiveParts');
        testUtils.detectChanges();

        // When it is destroyed
        component.ngOnDestroy();

        // Then it should have unsubscrbed from active parts
        expectUnsubscribeToHaveBeenCalled();
    }));
    it('should unsubscribe from active users when destroying component', fakeAsync(async() => {
        // Given an initialized lobby
        const expectUnsubscribeToHaveBeenCalled: () => void =
            prepareUnsubscribeCheck(TestBed.inject(ActiveUsersService), 'subscribeToActiveUsers');
        testUtils.detectChanges();

        // When it is destroyed
        component.ngOnDestroy();

        // Then it should have unsubscrbed from active users
        expectUnsubscribeToHaveBeenCalled();
    }));
    it('should display firebase time HH:mm:ss', fakeAsync(() => {
        // Given a lobby in which we observe tab chat, and where one user is here
        const HH: number = 11 * 3600;
        const mm: number = 34 * 60;
        const ss: number = 56;
        const timeStampInSecond: number = HH + mm + ss;
        const userWithLastUpdateTime: User = {
            ...UserMocks.CREATOR,
            lastUpdateTime: new Timestamp(timeStampInSecond, 0),
        };
        void TestBed.inject(UserDAO).set(UserMocks.CREATOR_AUTH_USER.id, userWithLastUpdateTime);
        tick();
        void testUtils.clickElement('#tab-chat');
        tick();

        // When rendering the board
        testUtils.detectChanges();

        // Then the date should be written in format HH:mm:ss
        const element: DebugElement = testUtils.findElement('#' + UserMocks.CREATOR_MINIMAL_USER.name);
        const time: string = element.nativeElement.innerText;
        const timeAsString: string = formatDate(timeStampInSecond * 1000, 'HH:mm:ss', 'en-US');
        expect(time).toBe(UserMocks.CREATOR_MINIMAL_USER.name + ': ' + timeAsString);
    }));
});

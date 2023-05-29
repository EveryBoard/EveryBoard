/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserDAO } from 'src/app/dao/UserDAO';
import { ObservedPartMocks } from 'src/app/domain/mocks/ObservedPartMocks.spec';
import { ObservedPart } from 'src/app/domain/User';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { AuthUser, ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { ObservedPartServiceMock } from 'src/app/services/tests/ObservedPartService.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { expectValidRoutingLink, prepareUnsubscribeCheck, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Utils } from 'src/app/utils/utils';
import { AccountComponent } from '../account/account.component';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {

    let testUtils: SimpleComponentTestUtils<HeaderComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(HeaderComponent);
        const userDAO: UserDAO = TestBed.inject(UserDAO);
        await userDAO.set(UserMocks.CONNECTED_AUTH_USER.id, UserMocks.CONNECTED);
    }));
    it('should create', fakeAsync(() => {
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        testUtils.detectChanges();
        expect(testUtils.getComponent()).toBeTruthy();
    }));
    it('should bring to account settings when clicking on the account button', fakeAsync(async() => {
        // Given a connected user
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        // When displaying the component
        testUtils.detectChanges();
        // Then the account link should point to the account component
        const button: DebugElement = testUtils.findElement('#account');
        expectValidRoutingLink(button, '/account', AccountComponent);
    }));
    describe('disconnection', () => {
        it('should disconnect when connected user clicks on the logout button', fakeAsync(async() => {
            // Given a connected user
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            spyOn(testUtils.getComponent().connectedUserService, 'disconnect').and.callThrough();
            await testUtils.clickElement('#logout');
            tick();
            const component: HeaderComponent = testUtils.getComponent();
            expect(component.connectedUserService.disconnect).toHaveBeenCalledTimes(1);
        }));
        it('should remove comment in header when disconnecting', fakeAsync(async() => {
            // Given a connected user that has an observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            const observedPart: ObservedPart = ObservedPartMocks.CANDIDATE;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();
            testUtils.expectElementToExist('#observedPartLink');

            // When connectedUserService informs us that user is disconnected
            ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
            ObservedPartServiceMock.setObservedPart(MGPOptional.empty());
            testUtils.detectChanges();

            // Then observedPartLink should not be displayed
            testUtils.expectElementNotToExist('#observedPartLink');
        }));
    });
    it('should have empty username when user is not connected', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.detectChanges();
        tick();
        expect(testUtils.getComponent().username).toEqual(MGPOptional.empty());
    }));
    it('should show user email if the user has not set its username yet', fakeAsync(async() => {
        const email: string = 'jean@jaja.us';
        ConnectedUserServiceMock.setUser(new AuthUser('id', MGPOptional.of(email), MGPOptional.empty(), false));
        testUtils.detectChanges();
        expect(testUtils.getComponent().username).toEqual(MGPOptional.of(email));
    }));
    it('should redirect to your current part when clicking on its reference on the header', fakeAsync(async() => {
        // Given a component where connected user is observing a part
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        const observedPart: ObservedPart = ObservedPartMocks.CREATOR_WITH_OPPONENT;
        ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));
        testUtils.detectChanges();
        tick();

        // When clicking on the info about the part
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        await testUtils.clickElement('#observedPartLink');

        // Then it should have redirect to the part
        expect(router.navigate).toHaveBeenCalledOnceWith(['/play', observedPart.typeGame, observedPart.id]);
    }));
    describe('observedPart', () => {
        it('should display "<TypeGame> (waiting for opponent)" when creator without chosenOpponent', fakeAsync(async() => {
            // Given a connected user that has no observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick();
            testUtils.expectElementNotToExist('#observedPartLink');

            // When user become linked to an observedPart
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(ObservedPartMocks.CREATOR_WITHOUT_OPPONENT));
            testUtils.detectChanges();
            tick();

            // Then "P4 (waiting for opponent)" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            expect(observedPartLink.nativeElement.innerText).toEqual('P4 (waiting for opponent)');
        }));
        it('should display "<TypeGame> againt <Opponent>" when creator with chosenOpponent', fakeAsync(async() => {
            // Given a connected user that has no observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick();
            testUtils.expectElementNotToExist('#observedPartLink');

            // When user become linked to an observedPart with an opponent set
            const observedPart: ObservedPart = ObservedPartMocks.CREATOR_WITH_OPPONENT;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // Then "<Game> against <Opponent>" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            const typeGame: string = observedPart.typeGame;
            const opponentName: string = Utils.getNonNullable(observedPart.opponent?.name);
            expect(observedPartLink.nativeElement.innerText).toEqual(typeGame + ' against ' + opponentName);
        }));
        it(`should display '<TypeGame> by <Creator>' when watching as observer`, fakeAsync(async() => {
            // Given a connected user that has no observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick();
            testUtils.expectElementNotToExist('#observedPartLink');

            // When user become linked to an observedPart
            const observedPart: ObservedPart = ObservedPartMocks.OBSERVER;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // Then "<TypeGame> by <Opponent, that should contain the creator>" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            const typeGame: string = observedPart.typeGame;
            const opponent: string = Utils.getNonNullable(observedPart.opponent?.name);
            expect(observedPartLink.nativeElement.innerText).toEqual(typeGame + ' by ' + opponent);
        }));
        it(`should display '<TypeGame> by <Creator>' when watching as candidate`, fakeAsync(async() => {
            // Given a connected user that has no observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick();
            testUtils.expectElementNotToExist('#observedPartLink');

            // When user become linked to an observedPart
            const observedPart: ObservedPart = ObservedPartMocks.CANDIDATE;
            ObservedPartServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // Then "Epaminondas by El Creatoro" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            const typeGame: string = observedPart.typeGame;
            const opponent: string = Utils.getNonNullable(observedPart.opponent?.name);
            expect(observedPartLink.nativeElement.innerText).toEqual(typeGame + ' by ' + opponent);
        }));
    });
    it('should unsubscribe from connectedUserService when destroying component', fakeAsync(async() => {
        // Given a header
        const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
        const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(connectedUserService, 'subscribeToUser');
        testUtils.detectChanges();

        // When it is destroyed
        testUtils.getComponent().ngOnDestroy();

        // Then it should have unsubscribed from connected user
        // Because well, we destroy the header a LOT!
        // By hitting it in the ... HEAD.
        expectUnsubscribeToHaveBeenCalled();
    }));
    it('should unsubscribe from observedPartService when destroying component', fakeAsync(async() => {
        // Given a header
        const observedPartService: ObservedPartService = TestBed.inject(ObservedPartService);
        const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(observedPartService, 'subscribeToObservedPart');
        testUtils.detectChanges();

        // When it is destroyed
        testUtils.getComponent().ngOnDestroy();

        // Then it should have unsubscribed from observed part
        expectUnsubscribeToHaveBeenCalled();
    }));
});

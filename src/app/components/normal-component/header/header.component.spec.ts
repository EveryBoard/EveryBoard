/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserDAO } from 'src/app/dao/UserDAO';
import { FocusedPartMocks } from 'src/app/domain/mocks/FocusedPartMocks.spec';
import { FocusedPart } from 'src/app/domain/User';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Utils } from 'src/app/utils/utils';
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
    describe('disconnection', () => {
        it('should disconnect when connected user clicks  on the logout button', fakeAsync(async() => {
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            spyOn(testUtils.getComponent().connectedUserService, 'disconnect');
            await testUtils.clickElement('#logout');
            tick();
            const component: HeaderComponent = testUtils.getComponent();
            expect(component.connectedUserService.disconnect).toHaveBeenCalledTimes(1);
        }));
        it('should remove comment in header when disconnecting', fakeAsync(async() => {
            // Given a connected user that has an observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            const observedPart: FocusedPart = FocusedPartMocks.CANDIDATE;
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();
            testUtils.expectElementToExist('#observedPartLink');

            // When user logs out
            await testUtils.clickElement('#connectedUserName');
            await testUtils.clickElement('#logout');

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
    describe('observedPart', () => {
        it('should display "<TypeGame> (waiting for opponent)" when creator without chosenOpponent', fakeAsync(async() => {
            // Given a connected user that has no observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick();
            testUtils.expectElementNotToExist('#observedPartLink');

            // When user become linked to an observedPart
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(FocusedPartMocks.CREATOR_WITHOUT_OPPONENT));
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
            const observedPart: FocusedPart = FocusedPartMocks.CREATOR_WITH_OPPONENT;
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
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
            const observedPart: FocusedPart = FocusedPartMocks.OBSERVER;
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
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
            const observedPart: FocusedPart = FocusedPartMocks.CANDIDATE;
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // Then "Epaminondas by El Creatoro" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            const typeGame: string = observedPart.typeGame;
            const opponent: string = Utils.getNonNullable(observedPart.opponent?.name);
            expect(observedPartLink.nativeElement.innerText).toEqual(typeGame + ' by ' + opponent);
        }));
    });
});

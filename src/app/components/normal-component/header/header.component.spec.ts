/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserDAO } from 'src/app/dao/UserDAO';
import { FocussedPart } from 'src/app/domain/User';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
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
            const observedPart: FocussedPart = {
                id: '123',
                opponent: { id: 'jeanjajar', name: 'Jean-Jaja' },
                typeGame: 'P4',
                role: 'Candidate',
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // When user disconnect
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
            const observedPart: FocussedPart = {
                id: '123',
                typeGame: 'P4',
                role: 'Creator',
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
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

            // When user become linked to an observedPart
            const observedPart: FocussedPart = {
                id: '123',
                opponent: { id: 'jjj', name: 'Jean-Jaja' },
                typeGame: 'P4',
                role: 'Creator',
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // Then "P4 against Jean-Jaja" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            expect(observedPartLink.nativeElement.innerText).toEqual('P4 against Jean-Jaja');
        }));
        it(`should display '<TypeGame> by <Creator>' when watching as observer`, fakeAsync(async() => {
            // Given a connected user that has no observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick();
            testUtils.expectElementNotToExist('#observedPartLink');

            // When user become linked to an observedPart
            const observedPart: FocussedPart = {
                id: '123',
                opponent: { id: '123creator', name: 'El Creatoro' },
                typeGame: 'Epaminondas',
                role: 'Observer',
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // Then "Epaminondas by El Creatoro" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            expect(observedPartLink.nativeElement.innerText).toEqual('Epaminondas by El Creatoro');
        }));
        it(`should display '<TypeGame> by <Creator>' when watching as candidate`, fakeAsync(async() => {
            // Given a connected user that has no observedPart
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick();
            testUtils.expectElementNotToExist('#observedPartLink');

            // When user become linked to an observedPart
            const observedPart: FocussedPart = {
                id: '123',
                opponent: { id: '123creator', name: 'El Creatoro' },
                typeGame: 'Epaminondas',
                role: 'Candidate',
            };
            ConnectedUserServiceMock.setObservedPart(MGPOptional.of(observedPart));
            testUtils.detectChanges();
            tick();

            // Then "Epaminondas by El Creatoro" should be displayed
            const observedPartLink: DebugElement = testUtils.findElement('#observedPartLink');
            expect(observedPartLink.nativeElement.innerText).toEqual('Epaminondas by El Creatoro');
        }));
    });
});

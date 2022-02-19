/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserDAO } from 'src/app/dao/UserDAO';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {

    let testUtils: SimpleComponentTestUtils<HeaderComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(HeaderComponent);
        const userDAO: UserDAO = TestBed.inject(UserDAO);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.userId, UserMocks.CREATOR);
    }));
    it('should create', fakeAsync(() => {
        AuthenticationServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
        testUtils.detectChanges();
        const component: HeaderComponent = testUtils.getComponent();
        expect(component).toBeTruthy();
        component.subscribeToLoggedUserDoc();
    }));
    it('should disconnect when connected user clicks  on the logout button', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
        testUtils.detectChanges();
        spyOn(testUtils.getComponent().authenticationService, 'disconnect');
        void testUtils.clickElement('#logout');
        tick();
        const component: HeaderComponent = testUtils.getComponent();
        expect(component.authenticationService.disconnect).toHaveBeenCalledTimes(1);
        component.subscribeToLoggedUserDoc();
    }));
    it('should have empty username when user is not connected', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.detectChanges();
        tick();
        expect(testUtils.getComponent().username).toEqual('');
    }));
    it('should show user email if the user has not set its username yet', fakeAsync(async() => {
        const email: string = 'jean@jaja.us';
        AuthenticationServiceMock.setUser(new AuthUser('123', MGPOptional.of(email), MGPOptional.empty(), false));
        testUtils.detectChanges();
        expect(testUtils.getComponent().username).toEqual(email);
    }));
});

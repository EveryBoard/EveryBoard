/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserDAO } from 'src/app/dao/UserDAO';
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
    it('should disconnect when connected user clicks  on the logout button', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        testUtils.detectChanges();
        spyOn(testUtils.getComponent().connectedUserService, 'disconnect');
        void testUtils.clickElement('#logout');
        tick();
        const component: HeaderComponent = testUtils.getComponent();
        expect(component.connectedUserService.disconnect).toHaveBeenCalledTimes(1);
    }));
    it('should have empty username when user is not connected', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.detectChanges();
        tick();
        expect(testUtils.getComponent().username).toEqual('');
    }));
    it('should show user email if the user has not set its username yet', fakeAsync(async() => {
        const email: string = 'jean@jaja.us';
        ConnectedUserServiceMock.setUser(new AuthUser('id', MGPOptional.of(email), MGPOptional.empty(), false));
        testUtils.detectChanges();
        expect(testUtils.getComponent().username).toEqual(email);
    }));
});

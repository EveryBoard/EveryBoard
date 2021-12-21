import { fakeAsync } from '@angular/core/testing';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {

    let testUtils: SimpleComponentTestUtils<HeaderComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(HeaderComponent);
    }));

    it('should create', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        expect(testUtils.getComponent()).toBeTruthy();
    }));
    it('should disconnect when connected user clicks  on the logout button', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        spyOn(testUtils.getComponent().authenticationService, 'disconnect');
        await testUtils.clickElement('#logout');
        expect(testUtils.getComponent().authenticationService.disconnect).toHaveBeenCalledTimes(1);
    }));
    it('should have empty username when user is not connected', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.detectChanges();
        expect(testUtils.getComponent().username).toEqual('');
    }));
    it('should show user email if the user has not set its username yet', fakeAsync(async() => {
        const email: string = 'jean@jaja.us';
        AuthenticationServiceMock.setUser(new AuthUser(MGPOptional.of(email), MGPOptional.empty(), false));
        testUtils.detectChanges();
        expect(testUtils.getComponent().username).toEqual(email);
    }));
});

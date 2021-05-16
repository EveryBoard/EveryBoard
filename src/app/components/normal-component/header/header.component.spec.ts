import { fakeAsync } from '@angular/core/testing';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
    let testUtils: SimpleComponentTestUtils<HeaderComponent>;

    it('should create', fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(HeaderComponent);
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        expect(testUtils.getComponent()).toBeTruthy();
    }));
    it('should disconnect when connected user clicks  on the logout button', fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(HeaderComponent);
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        spyOn(testUtils.getComponent().authenticationService, 'disconnect');
        await testUtils.clickElement('#logout');
        expect(testUtils.getComponent().authenticationService.disconnect).toHaveBeenCalledTimes(1);
    }));
    it('should have empty username when user is not authenticated', fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(HeaderComponent);
        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);
        testUtils.detectChanges();
        expect(testUtils.getComponent().userName).toBeNull();
    }));
});

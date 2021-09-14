import { fakeAsync } from '@angular/core/testing';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { environment } from 'src/environments/environment';
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
    it('should have empty username when user is not authenticated', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);
        testUtils.detectChanges();
        expect(testUtils.getComponent().userName).toBeNull();
    }));
    it('should use fr as the default language if navigator.language is not set', fakeAsync(async() => {
        // given that the language is not set
        Object.defineProperty(navigator, 'language', {
            get: function() {
                return null;
            },
        });

        // when the header is loaded
        testUtils.detectChanges();

        // then the default language is fr
        expect(testUtils.getComponent().currentLanguage).toBe('FR');
    }));
    it('should update localStorage and redirect when a language change is made', fakeAsync(async() => {
        spyOn(localStorage, 'setItem');
        spyOn(window, 'open').and.returnValue(null);
        // given that the header is loaded
        testUtils.detectChanges();
        // when another language is selected
        testUtils.clickElement('#language_FR');
        // then the language is changed and the page is reloaded
        expect(localStorage.setItem).toHaveBeenCalledWith('locale', 'fr');
        expect(window.open).toHaveBeenCalledWith(environment.root + '/fr', '_self');
    }));
});

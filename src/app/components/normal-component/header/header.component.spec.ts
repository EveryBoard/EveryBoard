import { fakeAsync } from '@angular/core/testing';
import { AuthUser } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { LocaleUtils } from 'src/app/utils/LocaleUtils';
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
        expect(testUtils.getComponent().username).toBeNull();
    }));
    it('should use fr as the default language if the language of the navigator is not set', fakeAsync(async() => {
        // given a navigator where the language is not set
        localStorage.clear(); // local storage is empty
        spyOn(LocaleUtils, 'getNavigatorLanguage').and.returnValue(null);

        // when the header is loaded
        testUtils.detectChanges();

        // then the default language is fr
        expect(testUtils.getComponent().currentLanguage).toBe('FR');
    }));
    it('should update localStorage and redirect when a language change is made', fakeAsync(async() => {
        // given a page in english where the header is loaded
        spyOn(LocaleUtils, 'getNavigatorLanguage').and.returnValue('en-US');
        spyOn(localStorage, 'setItem');
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();

        // when another language is selected
        testUtils.clickElement('#language_FR');

        // then the language is changed and the page is reloaded
        expect(localStorage.setItem).toHaveBeenCalledWith('locale', 'fr');
        expect(window.open).toHaveBeenCalledWith(window.location.href, '_self');

        localStorage.clear(); // clean up local storage
    }));
    it('should preserve the current route when a language change is made', fakeAsync(async() => {
        // given a page in english where the header is loaded
        spyOn(LocaleUtils, 'getNavigatorLanguage').and.returnValue('en-US');
        spyOn(window, 'open').and.returnValue(null);
        await testUtils.getComponent().router.navigate(['/server']);
        testUtils.detectChanges();

        // when another language is selected
        testUtils.clickElement('#language_FR');

        // then the current route is preserved when going to the new language
        expect(window.open).toHaveBeenCalledWith(window.location.href, '_self');

        localStorage.clear(); // clean up local storage
    }));
});

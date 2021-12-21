import { fakeAsync, TestBed } from '@angular/core/testing';
import { UserSettingsService } from 'src/app/services/UserSettingsService';
import { LocaleUtils } from 'src/app/utils/LocaleUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {

    let testUtils: SimpleComponentTestUtils<SettingsComponent>;

    let userSettingsService: UserSettingsService;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(SettingsComponent);
        userSettingsService = TestBed.inject(UserSettingsService);
    }));

    it('should be created', fakeAsync(async() => {
        testUtils.detectChanges();
        expect(testUtils.getComponent()).toBeTruthy();
    }));
    it('should update user setting and redirect when a language change is made', fakeAsync(async() => {
        // given that the language is set to english
        spyOn(LocaleUtils, 'getNavigatorLanguage').and.returnValue('en-US');
        spyOn(userSettingsService, 'changeLanguage');
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();

        // when another language is selected
        const languageSelection: HTMLSelectElement = testUtils.findElement('#language').nativeElement;
        languageSelection.value = 'fr';
        languageSelection.dispatchEvent(new Event('change'));
        testUtils.detectChanges();

        // then the language is changed and the page is reloaded
        expect(userSettingsService.changeLanguage).toHaveBeenCalledWith('fr');
        expect(window.open).toHaveBeenCalledWith(window.location.href, '_self');

        localStorage.clear(); // clean up local storage
    }));
    it('should update user setting and redirect when a theme change is made', fakeAsync(async() => {
        // given that the dark theme is selected
        spyOn(userSettingsService, 'getTheme').and.returnValue(MGPOptional.of('dark'));
        spyOn(userSettingsService, 'changeTheme');
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();

        // when another theme is selected
        const themeSelection: HTMLSelectElement = testUtils.findElement('#theme').nativeElement;
        themeSelection.value = 'light';
        themeSelection.dispatchEvent(new Event('change'));
        testUtils.detectChanges();

        // then the language is changed and the page is reloaded
        expect(userSettingsService.changeTheme).toHaveBeenCalledWith('light');
        expect(window.open).toHaveBeenCalledWith(window.location.href, '_self');

        localStorage.clear(); // clean up local storage
    }));
});

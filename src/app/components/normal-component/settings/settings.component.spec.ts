/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';

import { LocaleUtils } from '@everyboard/games';

import { Theme, ThemeService } from '../../../services/ThemeService';
import { UserSettingsService } from '../../../services/UserSettingsService';
import { SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';

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
        // Given that the language is set to english
        spyOn(LocaleUtils, 'getNavigatorLanguage').and.returnValue('en-US');
        spyOn(userSettingsService, 'changeLanguage').and.callThrough();
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();

        // When another language is selected
        await testUtils.selectChildElementOfDropDown('#language', 'language_fr');

        // Then the language is changed and the page is reloaded
        expect(userSettingsService.changeLanguage).toHaveBeenCalledWith('fr');
        expect(window.open).toHaveBeenCalledWith(window.location.href, '_self');

        localStorage.clear(); // clean up local storage
    }));

    it('should update and apply the theme without reloading', fakeAsync(async() => {
        // Given a loaded settings component
        const themeService: ThemeService = TestBed.inject(ThemeService);
        const newTheme: Theme = themeService.theme() === 'dark' ? 'light' : 'dark';
        spyOn(userSettingsService, 'changeTheme').and.callThrough();
        spyOn(themeService, 'loadTheme').and.callThrough();
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();

        // When selecting another theme
        await testUtils.selectChildElementOfDropDown('#theme', 'theme_' + newTheme);

        // Then the theme is persisted and applied without reloading
        expect(userSettingsService.changeTheme).toHaveBeenCalledOnceWith(newTheme);
        expect(localStorage.getItem('theme')).toBe(newTheme);
        expect(themeService.loadTheme).toHaveBeenCalledOnceWith(newTheme);
        expect(themeService.theme()).toBe(newTheme);
        expect(testUtils.getComponent().currentTheme()).toBe(newTheme);
        expect(window.open).not.toHaveBeenCalled();

        localStorage.clear(); // clean up local storage
    }));

});

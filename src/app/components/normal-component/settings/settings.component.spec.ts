/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';

import { Theme, ThemeService } from '../../../services/ThemeService';
import { Language, UserSettingsService } from '../../../services/UserSettingsService';
import { SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {

    let testUtils: SimpleComponentTestUtils<SettingsComponent>;

    let userSettingsService: UserSettingsService;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(SettingsComponent);
        userSettingsService = TestBed.inject(UserSettingsService);
    }));
    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', fakeAsync(async() => {
        testUtils.detectChanges();
        expect(testUtils.getComponent()).toBeTruthy();
    }));

    it('should warn before changing language', fakeAsync(async() => {
        // Given loaded settings and no pending language change
        spyOn(userSettingsService, 'activateLanguage').and.callThrough();
        spyOn(userSettingsService, 'scheduleLanguageChange').and.callThrough();
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();
        const component: SettingsComponent = testUtils.getComponent();
        const candidateLanguage: Language = component.currentLanguage === 'en' ? 'fr' : 'en';

        // When selecting another language
        await testUtils.selectChildElementOfDropDown('#language', 'language_' + candidateLanguage);

        // Then a warning is shown without persisting or reloading anything
        expect(component.candidateLanguage()).toBe(candidateLanguage);
        testUtils.expectElementToExist('#language-change-warning');
        expect(userSettingsService.activateLanguage).not.toHaveBeenCalled();
        expect(userSettingsService.scheduleLanguageChange).not.toHaveBeenCalled();
        expect(window.open).not.toHaveBeenCalled();
    }));

    it('should activate the candidate language and reload now', fakeAsync(async() => {
        // Given another language has been selected
        spyOn(userSettingsService, 'activateLanguage').and.callThrough();
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();
        const component: SettingsComponent = testUtils.getComponent();
        const candidateLanguage: Language = component.currentLanguage === 'en' ? 'fr' : 'en';
        localStorage.setItem('pendingLocale', component.currentLanguage);
        await testUtils.selectChildElementOfDropDown('#language', 'language_' + candidateLanguage);

        // When choosing to reload now
        await testUtils.clickElement('#reload-with-language');

        // Then the candidate is activated, any deferred value is cleared, and the current page reloads once
        expect(userSettingsService.activateLanguage).toHaveBeenCalledOnceWith(candidateLanguage);
        expect(localStorage.getItem('locale')).toBe(candidateLanguage);
        expect(localStorage.getItem('pendingLocale')).toBeNull();
        expect(window.open).toHaveBeenCalledOnceWith(window.location.href, '_self');
    }));

    it('should defer the candidate language without reloading and close settings', fakeAsync(async() => {
        // Given another language has been selected
        spyOn(userSettingsService, 'scheduleLanguageChange').and.callThrough();
        spyOn(window, 'open').and.returnValue(null);
        testUtils.detectChanges();
        const component: SettingsComponent = testUtils.getComponent();
        const candidateLanguage: Language = component.currentLanguage === 'en' ? 'fr' : 'en';
        const activeLocale: string | null = localStorage.getItem('locale');
        let settingsClosed: boolean = false;
        component.settingsClosed.subscribe(() => settingsClosed = true);
        await testUtils.selectChildElementOfDropDown('#language', 'language_' + candidateLanguage);

        // When choosing to apply the language next time
        await testUtils.clickElement('#apply-language-next-time');

        // Then only the deferred locale is stored and settings request to close
        expect(userSettingsService.scheduleLanguageChange).toHaveBeenCalledOnceWith(candidateLanguage);
        expect(localStorage.getItem('locale')).toBe(activeLocale);
        expect(localStorage.getItem('pendingLocale')).toBe(candidateLanguage);
        expect(window.open).not.toHaveBeenCalled();
        expect(settingsClosed).toBeTrue();
    }));

    it('should cancel a candidate language without persisting it', fakeAsync(async() => {
        // Given another language has been selected
        spyOn(userSettingsService, 'activateLanguage').and.callThrough();
        spyOn(userSettingsService, 'scheduleLanguageChange').and.callThrough();
        testUtils.detectChanges();
        const component: SettingsComponent = testUtils.getComponent();
        const candidateLanguage: Language = component.currentLanguage === 'en' ? 'fr' : 'en';
        await testUtils.selectChildElementOfDropDown('#language', 'language_' + candidateLanguage);

        // When cancelling the language change
        await testUtils.clickElement('#cancel-language-change');

        // Then the warning closes, the active selection is restored, and nothing is persisted
        expect(component.candidateLanguage()).toBeNull();
        testUtils.expectElementNotToExist('#language-change-warning');
        expect(testUtils.findElement('#language').nativeElement.value).toBe(component.currentLanguage);
        expect(userSettingsService.activateLanguage).not.toHaveBeenCalled();
        expect(userSettingsService.scheduleLanguageChange).not.toHaveBeenCalled();
        expect(localStorage.getItem('pendingLocale')).toBeNull();
    }));

    it('should do nothing when selecting the active language', fakeAsync(async() => {
        // Given loaded settings
        spyOn(userSettingsService, 'activateLanguage').and.callThrough();
        spyOn(userSettingsService, 'scheduleLanguageChange').and.callThrough();
        testUtils.detectChanges();
        const component: SettingsComponent = testUtils.getComponent();

        // When selecting the active language
        await testUtils.selectChildElementOfDropDown('#language', 'language_' + component.currentLanguage);

        // Then no warning is shown and nothing is persisted
        expect(component.candidateLanguage()).toBeNull();
        testUtils.expectElementNotToExist('#language-change-warning');
        expect(userSettingsService.activateLanguage).not.toHaveBeenCalled();
        expect(userSettingsService.scheduleLanguageChange).not.toHaveBeenCalled();
    }));

    it('should expose an accessible language warning and actions', fakeAsync(async() => {
        // Given another language has been selected
        testUtils.detectChanges();
        const component: SettingsComponent = testUtils.getComponent();
        const candidateLanguage: Language = component.currentLanguage === 'en' ? 'fr' : 'en';
        await testUtils.selectChildElementOfDropDown('#language', 'language_' + candidateLanguage);

        // When inspecting the warning
        const warning: HTMLElement = testUtils.findElement('#language-change-warning').nativeElement;

        // Then it has dialog semantics and every action has visible text
        expect(warning.getAttribute('role')).toBe('alertdialog');
        expect(warning.getAttribute('aria-modal')).toBe('true');
        expect(warning.getAttribute('aria-labelledby')).toBe('language-change-title');
        expect(warning.getAttribute('aria-describedby')).toBe('language-change-description');
        expect(testUtils.findElement('#reload-with-language').nativeElement.innerText).toContain('RELOAD NOW');
        expect(testUtils.findElement('#apply-language-next-time').nativeElement.innerText).toContain('APPLY NEXT TIME');
        expect(testUtils.findElement('#cancel-language-change').nativeElement.innerText).toContain('CANCEL');

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
    }));

});

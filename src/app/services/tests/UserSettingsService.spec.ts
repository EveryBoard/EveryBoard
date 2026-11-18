/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { UserSettingsService } from '../UserSettingsService';

describe('UserSettingsService', () => {

    let userSettingsService: UserSettingsService;

    beforeEach(() => {
        userSettingsService = new UserSettingsService();
    });
    afterEach(() => {
        localStorage.clear();
    });

    describe('theme', () => {
        it('should update local storage on theme change', () => {
            // Given no theme preference (empty local storage)
            localStorage.clear();

            // When changing the theme
            userSettingsService.changeTheme('light');

            // Then localStorage is updated to reflect preference
            expect(localStorage.getItem('theme')).toEqual('light');
        });

        it('should rely on local storage to know the theme', () => {
            // Given that the stored theme is 'light'
            localStorage.setItem('theme', 'light');

            // When getting the theme
            const theme: MGPOptional<string> = userSettingsService.getTheme();

            // Then the theme is 'light'
            expect(theme.isPresent()).toBeTrue();
            expect(theme.get()).toBe('light');
        });
    });

    describe('language', () => {
        it('should activate a language and clear a deferred language', () => {
            // Given another language deferred until the next reload
            localStorage.setItem('pendingLocale', 'en');

            // When activating a language now
            userSettingsService.activateLanguage('fr');

            // Then the active language is updated and the deferred language is cleared
            expect(localStorage.getItem('locale')).toEqual('fr');
            expect(localStorage.getItem('pendingLocale')).toBeNull();
        });

        it('should defer a language without changing the active language', () => {
            // Given English is the active language
            localStorage.setItem('locale', 'en');

            // When deferring French until the next reload
            userSettingsService.scheduleLanguageChange('fr');

            // Then only the deferred language is stored and the current session remains English
            expect(localStorage.getItem('locale')).toBe('en');
            expect(localStorage.getItem('pendingLocale')).toBe('fr');
            expect(userSettingsService.getLanguage()).toBe('en');
        });

        it('should promote a valid deferred language', () => {
            // Given English is active and French is deferred
            localStorage.setItem('locale', 'en');
            localStorage.setItem('pendingLocale', 'fr');

            // When applying the deferred language
            UserSettingsService.applyPendingLanguageChange();

            // Then French becomes active and is no longer deferred
            expect(localStorage.getItem('locale')).toBe('fr');
            expect(localStorage.getItem('pendingLocale')).toBeNull();
        });

        it('should discard an invalid deferred language', () => {
            // Given English is active and an unsupported language is deferred
            localStorage.setItem('locale', 'en');
            localStorage.setItem('pendingLocale', 'invalid');

            // When applying the deferred language
            UserSettingsService.applyPendingLanguageChange();

            // Then English remains active and the invalid deferred value is cleared
            expect(localStorage.getItem('locale')).toBe('en');
            expect(localStorage.getItem('pendingLocale')).toBeNull();
        });

        it('should preserve the active language when no language is deferred', () => {
            // Given English is active with no deferred language
            localStorage.setItem('locale', 'en');

            // When applying a deferred language
            UserSettingsService.applyPendingLanguageChange();

            // Then English remains active
            expect(localStorage.getItem('locale')).toBe('en');
            expect(localStorage.getItem('pendingLocale')).toBeNull();
        });

        it('should rely on local storage to know the language', () => {
            // Given that the stored language is 'fr'
            localStorage.setItem('locale', 'fr');

            // When getting the language
            const language: string = userSettingsService.getLanguage();

            // Then the language is 'fr'
            expect(language).toBe('fr');
        });
    });

});

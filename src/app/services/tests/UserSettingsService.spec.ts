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
        it('should update local storage on language change', () => {
            // Given no language preference
            localStorage.clear();

            // When changing the language
            userSettingsService.changeLanguage('fr');

            // Then localStorage is updated to reflect preference
            expect(localStorage.getItem('locale')).toEqual('fr');
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

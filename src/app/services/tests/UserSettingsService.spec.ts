import { MGPOptional } from 'src/app/utils/MGPOptional';
import { UserSettingsService } from '../UserSettingsService';

describe('UserSettingsService', () => {
    let service: UserSettingsService;

    beforeEach(() => {
        service = new UserSettingsService();
    });

    describe('theme', () => {
        it('should update local storage on theme change', () => {
            spyOn(localStorage, 'setItem');
            // when changing the theme
            service.changeTheme('light');
            // then localStorage is updated
            expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');

            localStorage.clear();
        });
        it('should rely on local storage to know the theme', () => {
            // given that the stored theme is 'light'
            spyOn(localStorage, 'getItem').and.returnValue('light');
            // when getting the theme
            const theme: MGPOptional<string> = service.getTheme();
            // then the theme is 'light'
            expect(theme.isPresent()).toBeTrue();
            expect(theme.get()).toBe('light');
        });
    });
    describe('language', () => {
        it('should update local storage on language change', () => {
            spyOn(localStorage, 'setItem');
            // when changing the language
            service.changeLanguage('fr');
            // then localStorage is updated
            expect(localStorage.setItem).toHaveBeenCalledWith('locale', 'fr');

            localStorage.clear();
        });
        it('should rely on local storage to know the language', () => {
            // given that the stored theme is 'light'
            spyOn(localStorage, 'getItem').and.returnValue('fr');
            // when getting the language
            const language: string = service.getLanguage();
            // then the theme is 'light'
            expect(language).toBe('fr');
        });
    });
});

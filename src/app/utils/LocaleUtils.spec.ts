import { LocaleUtils } from './LocaleUtils';

describe('LocaleUtils', () => {
    describe('getLocale', () => {
        it('should use locale stored in localStorage', () => {
            // given a localStage that defines a locale
            spyOn(localStorage, 'getItem').and.returnValue('en');
            localStorage.setItem('locale', 'en');

            // when the locale is computed
            const locale: string = LocaleUtils.getLocale();

            // then it should use the one from localStorage
            expect(locale).toEqual('en');
            expect(localStorage.getItem).toHaveBeenCalledWith('locale');
        });
        it('should use navigator language if nothing is in localStorage', () => {
            // given that the localStorage is empty and that the navigator language is set
            localStorage.clear();
            spyOn(LocaleUtils, 'getNavigatorLanguage').and.returnValue('en-US');

            // when the locale is computed
            const locale: string = LocaleUtils.getLocale();

            // then it should use the one from the navigator
            expect(locale).toEqual('en');
            expect(LocaleUtils.getNavigatorLanguage).toHaveBeenCalled();
        });
        it('should default to the fr locale', () => {
            // given that the localStorage is empty and that the navigator language is not set
            localStorage.clear();
            spyOn(LocaleUtils, 'getNavigatorLanguage').and.returnValue(null);

            // when the locale is computed
            const locale: string = LocaleUtils.getLocale();

            // then it should default to fr
            expect(locale).toEqual('fr');
        });
        it('should use fr if an unknown locale is used', () => {
            // given that the locale is unknown
            localStorage.setItem('locale', 'gr');

            // when the locale is computed
            const locale: string = LocaleUtils.getLocale();

            // then it should default to fr
            expect(locale).toEqual('fr');

            localStorage.clear(); // clear local storage
        });
    });
});

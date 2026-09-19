export type Localized = () => string

export class LocaleUtils {
    public static getNavigatorLanguage(): string | null {
        // In a separate function so that it can be mocked
        return navigator.language;
    }

    public static getStoredLocale(): string | null {
        return localStorage.getItem('locale');
    }

    public static getLocale(): string {
        const defaultLocale: string = 'fr';
        const validLocales: string[] = ['en', 'fr'];
        const foundLocale: string =
            LocaleUtils.getStoredLocale() ?? LocaleUtils.getNavigatorLanguage() ?? defaultLocale;
        const locale: string = foundLocale.slice(0, 2).toLowerCase(); // from en-US or fr-BE, we only want en or fr
        if (validLocales.some((validLocale: string): boolean => validLocale === locale)) {
            return locale;
        } else {
            return defaultLocale;
        }
    }
}

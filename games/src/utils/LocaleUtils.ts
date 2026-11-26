export type Localized = () => string
export type Locale = 'en' | 'fr'

export class LocaleUtils {
    public static getNavigatorLanguage(): string | null {
        // In a separate function so that it can be mocked
        return navigator.language;
    }

    public static getStoredLocale(): string | null {
        return localStorage.getItem('locale');
    }

    public static getLocale(): Locale {
        const defaultLocale: Locale = 'fr';
        const validLocales: Locale[] = ['en', 'fr'];
        const foundLocale: string =
            LocaleUtils.getStoredLocale() ?? LocaleUtils.getNavigatorLanguage() ?? defaultLocale;
        const locale: string = foundLocale.slice(0, 2).toLowerCase(); // from en-US or fr-BE, we only want en or fr
        const validLocale: Locale | undefined =
            validLocales.find((candidate: Locale): boolean => candidate === locale);
        if (validLocale != null) {
            return validLocale;
        } else {
            return defaultLocale;
        }
    }
}

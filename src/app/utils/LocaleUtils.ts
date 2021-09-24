export function getLocale(): string {
    const validLocales: string[] = ['en', 'fr'];
    const foundLocale: string = localStorage.getItem('locale') || navigator.language || 'fr';
    const locale: string = foundLocale.slice(0, 2).toLowerCase(); // from en-US or fr-BE, we only want en or fr
    if (validLocales.some((validLocale: string): boolean => validLocale === locale)) {
        return locale;
    } else {
        return 'fr'; // default locale
    }
}

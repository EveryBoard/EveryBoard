import { LocaleBootstrapConfiguration, prepareLocaleBootstrap } from './LocaleBootstrap';

describe('LocaleBootstrap', () => {

    afterEach(() => {
        localStorage.clear();
    });

    it('should promote a deferred locale before preparing bootstrap', () => {
        // Given English is active and French is deferred until the next reload
        localStorage.setItem('locale', 'en');
        localStorage.setItem('pendingLocale', 'fr');

        // When preparing the locale used for translations and Angular bootstrap
        const configuration: LocaleBootstrapConfiguration = prepareLocaleBootstrap('/root/', true);

        // Then French is active and provides the translation URL and locale identifier
        expect(configuration.locale).toBe('fr');
        expect(configuration.translationUrl).toBe('/root/assets/fr.json');
        expect(localStorage.getItem('locale')).toBe('fr');
        expect(localStorage.getItem('pendingLocale')).toBeNull();
    });

    it('should not fetch translations when deferred English becomes active', () => {
        // Given French is active and English is deferred until the next reload
        localStorage.setItem('locale', 'fr');
        localStorage.setItem('pendingLocale', 'en');

        // When preparing the locale used for translations and Angular bootstrap
        const configuration: LocaleBootstrapConfiguration = prepareLocaleBootstrap('/root/', true);

        // Then English is active without a runtime translation request
        expect(configuration.locale).toBe('en');
        expect(configuration.translationUrl).toBeNull();
        expect(localStorage.getItem('locale')).toBe('en');
        expect(localStorage.getItem('pendingLocale')).toBeNull();
    });

    it('should preserve the active locale when none is deferred', () => {
        // Given French is active with no deferred locale
        localStorage.setItem('locale', 'fr');

        // When preparing the locale used for translations and Angular bootstrap
        const configuration: LocaleBootstrapConfiguration = prepareLocaleBootstrap('/root/', true);

        // Then bootstrap keeps using French as before
        expect(configuration.locale).toBe('fr');
        expect(configuration.translationUrl).toBe('/root/assets/fr.json');
        expect(localStorage.getItem('locale')).toBe('fr');
        expect(localStorage.getItem('pendingLocale')).toBeNull();
    });
});

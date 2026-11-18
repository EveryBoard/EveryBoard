import { Locale, LocaleUtils } from '@everyboard/games';

import { UserSettingsService } from './services/UserSettingsService';

export type LocaleBootstrapConfiguration = {
    locale: Locale;
    translationUrl: string | null;
}

export function prepareLocaleBootstrap(
    root: string,
    runtimeTranslations: boolean,
): LocaleBootstrapConfiguration {
    UserSettingsService.applyPendingLanguageChange();
    const locale: Locale = LocaleUtils.getLocale();
    const translationUrl: string | null = runtimeTranslations && locale !== 'en' ?
        root + 'assets/' + locale + '.json' :
        null;
    return { locale, translationUrl };
}

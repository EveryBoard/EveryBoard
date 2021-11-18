import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { loadTranslations } from '@angular/localize';
import { LocaleUtils } from './app/utils/LocaleUtils';

function bootstrapApp(): void {
    if (environment.production) {
        enableProdMode();
    }
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err: unknown) => console.error(err));
}

const runtimeTranslations: boolean = true;

const locale: string = LocaleUtils.getLocale();
if (runtimeTranslations && locale !== 'en') {
    fetch(environment.root + 'assets/' + locale + '.json')
        .then((response: Response) => {
            if (response.ok) {
                return response.json();
            } else {
                return { 'locale': 'en', 'translations': {} };
            }
        })
        .then((json: { locale: string, translations: Record<string, string> }) => {
            loadTranslations(json.translations);
            $localize.locale = json.locale;

            bootstrapApp();
        })
        .catch(function(err: Error) {
            console.log(err);
        });
} else {
    bootstrapApp();
}

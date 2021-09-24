import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { loadTranslations } from '@angular/localize';
import { getLocale } from './app/utils/LocaleUtils';

function bootstrapApp(): void {
    if (environment.production) {
        enableProdMode();
    }
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err: unknown) => console.error(err));
}

// Set to false && until we can enable runtime translations
const runtimeTranslations: boolean = false;

const locale: string = getLocale();
if (runtimeTranslations && locale !== 'en') {
    fetch(environment.root + 'assets/' + locale + '.json')
        .then((response: Response) => {
            if (response.ok) {
                return response.json();
            } else {
                return { 'locale': 'en', 'translations': {} };
            }
        })
        .then((json: any) => {
            loadTranslations(json.translations);
            $localize.locale = json.locale;

            bootstrapApp();
        })
        .catch(function(err) {
            console.log(err);
        });
} else {
    bootstrapApp();
}

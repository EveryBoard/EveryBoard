import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { loadTranslations } from '@angular/localize';

const validLocales: string[] = ['en', 'fr'];
const foundLocale: string = localStorage.getItem('locale') || navigator.language || 'fr';
const locale: string = foundLocale.slice(0, 2); // from en-US or fr-BE, we only want en or fr

function bootstrapApp(): void {
    if (environment.production) {
        enableProdMode();
    }
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err: unknown) => console.error(err));
}

if (locale !== 'en' && validLocales.some((validLocale: string): boolean => validLocale === locale) ) {
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
            console.log({err});
        });
} else {
    bootstrapApp();
}

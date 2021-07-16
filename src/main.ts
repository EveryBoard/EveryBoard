
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { loadTranslations } from '@angular/localize';

const validLocales: string[] = ['en', 'fr'];
const foundLocale: string = localStorage.getItem('locale') || navigator.language || 'fr';
const locale: string = foundLocale.slice(0, 2); // from en-US or fr-BE, we only want en or fr
console.log('found locale: ' + locale);

function bootstrapApp(): void {
    if (environment.production) {
        enableProdMode();
    }
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err: unknown) => console.error(err));
}

if (locale !== 'en' && validLocales.some((validLocale: string): boolean => validLocale === locale) ) {
    fetch('/assets/' + locale + '.json')
        .then((response: Response) => {
            if (!response.ok) {
                return { 'locale': 'en', 'translations': {} };
            } else {
                console.log('found translations');
                return response.json();
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
    // Bootstrap app
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err: unknown) => console.error(err));
}

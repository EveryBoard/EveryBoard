import { enableProdMode, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { loadTranslations } from '@angular/localize';

import { LocaleUtils } from './app/utils/LocaleUtils';
import { environment } from './environments/environment';
import { ConnectedUserService } from './app/services/ConnectedUserService';
import { GameService } from './app/services/GameService';
import { ConfigRoomService } from './app/services/ConfigRoomService';
import { UserService } from './app/services/UserService';
import { ChatService } from './app/services/ChatService';
import { ThemeService } from './app/services/ThemeService';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app/app.component';
import { initializeFirebase, routes } from './app/app.routes';

import localeFr from '@angular/common/locales/fr';

import * as Firebase from '@firebase/app';
import * as Auth from '@firebase/auth';
import * as Firestore from '@firebase/firestore';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeFr);

function bootstrapApp(): void {
    if (environment.production) {
        enableProdMode();
    }
    initializeFirebase();
    bootstrapApplication(AppComponent, {
        providers: [
            importProvidersFrom(BrowserModule, ReactiveFormsModule, FormsModule, FontAwesomeModule),
            ConnectedUserService,
            GameService,
            ConfigRoomService,
            UserService,
            ChatService,
            ThemeService,
            { provide: LOCALE_ID, useValue: LocaleUtils.getLocale() },
            provideRouter(routes),
            provideAnimations(),
        ],
    })
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

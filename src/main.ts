import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { enableProdMode, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { loadTranslations } from '@angular/localize';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { Locale } from '@everyboard/games';

import { LocaleBootstrapConfiguration, prepareLocaleBootstrap } from './app/LocaleBootstrap';
import { AppComponent } from './app/app.component';
import { initializeFirebase, routes } from './app/app.routes';
import { ChatService } from './app/services/ChatService';
import { ConfigRoomService } from './app/services/ConfigRoomService';
import { ConnectedUserService } from './app/services/ConnectedUserService';
import { GameService } from './app/services/GameService';
import { ThemeService } from './app/services/ThemeService';
import { UserService } from './app/services/UserService';
import { environment } from './environments/environment';

registerLocaleData(localeFr);

function bootstrapApp(locale: Locale): void {
    if (environment.production) {
        enableProdMode();
    }
    initializeFirebase();
    bootstrapApplication(AppComponent, {
        providers: [
            provideZoneChangeDetection(),
            ConnectedUserService,
            GameService,
            ConfigRoomService,
            UserService,
            ChatService,
            ThemeService,
            { provide: LOCALE_ID, useValue: locale },
            provideRouter(routes),
        ],
    })
        .catch((err: unknown) => console.error(err));
}

const runtimeTranslations: boolean = true;
const localeBootstrap: LocaleBootstrapConfiguration = prepareLocaleBootstrap(environment.root, runtimeTranslations);

async function bootstrap(): Promise<void> {
    try {
        if (localeBootstrap.translationUrl != null) {
            const response: Response = await fetch(localeBootstrap.translationUrl);
            const json: { locale: string; translations: Record<string, string> } = response.ok ?
                await response.json() :
                { 'locale': 'en', 'translations': {} };

            loadTranslations(json.translations);
            $localize.locale = json.locale;
        }

        bootstrapApp(localeBootstrap.locale);
    } catch (err: unknown) {
        console.log(err);
    }
}

void bootstrap();

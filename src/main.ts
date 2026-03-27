import { enableProdMode, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { loadTranslations } from '@angular/localize';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule, routes } from './app/app.module';
import { LocaleUtils } from './app/utils/LocaleUtils';
import { environment } from './environments/environment';
import { ConnectedUserService } from './app/services/ConnectedUserService';
import { GameService } from './app/services/GameService';
import { ConfigRoomService } from './app/services/ConfigRoomService';
import { UserService } from './app/services/UserService';
import { ChatService } from './app/services/ChatService';
import { ThemeService } from './app/services/ThemeService';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { VerifiedAccountGuard } from './app/guard/verified-account.guard';
import { NotConnectedGuard } from './app/guard/not-connected.guard';
import { ConnectedButNotVerifiedGuard } from './app/guard/connected-but-not-verified.guard';
import { ExclusiveOnlineGameGuard } from './app/guard/exclusive-online-game-guard';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app/app.component';

function bootstrapApp(): void {
    if (environment.production) {
        enableProdMode();
    }
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
    ]
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

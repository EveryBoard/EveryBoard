
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Route } from '@angular/router';
import * as Firebase from '@firebase/app';
import * as Auth from '@firebase/auth';
import * as Firestore from '@firebase/firestore';

import { environment } from '../environments/environment';

import { ConnectedButNotVerifiedGuard } from './guard/connected-but-not-verified.guard';
import { ExclusiveOnlineGameGuard } from './guard/exclusive-online-game-guard';
import { NotConnectedGuard } from './guard/not-connected.guard';
import { VerifiedAccountGuard } from './guard/verified-account.guard';



/* eslint-disable @typescript-eslint/typedef */
export const routes: Route[] = [
    { path: 'login', loadComponent: () => import('./components/normal-component/login/login.component').then((m) => m.LoginComponent) },
    { path: 'lobby', loadComponent: () => import('./components/normal-component/lobby/lobby.component').then((m) => m.LobbyComponent), canActivate: [VerifiedAccountGuard] },
    { path: 'account', loadComponent: () => import('./components/normal-component/account/account.component').then((m) => m.AccountComponent), canActivate: [VerifiedAccountGuard] },
    { path: 'settings', loadComponent: () => import('./components/normal-component/settings/settings.component').then((m) => m.SettingsComponent) },
    { path: 'register', loadComponent: () => import('./components/normal-component/register/register.component').then((m) => m.RegisterComponent), canActivate: [NotConnectedGuard] },
    { path: 'reset-password', loadComponent: () => import('./components/normal-component/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent) },
    { path: 'notFound/:message', loadComponent: () => import('./components/normal-component/not-found/not-found.component').then((m) => m.NotFoundComponent) },
    { path: 'nextGameLoading', loadComponent: () => import('./components/normal-component/next-game-loading/next-game-loading.component').then((m) => m.NextGameLoadingComponent), canActivate: [VerifiedAccountGuard] },
    { path: 'verify-account', loadComponent: () => import('./components/normal-component/verify-account/verify-account.component').then((m) => m.VerifyAccountComponent), canActivate: [ConnectedButNotVerifiedGuard] },
    { path: 'play', loadComponent: () => import('./components/normal-component/online-game-selection/online-game-selection.component').then((m) => m.OnlineGameSelectionComponent), canActivate: [ExclusiveOnlineGameGuard, VerifiedAccountGuard] },
    { path: 'play/:game', loadComponent: () => import('./components/normal-component/online-game-creation/online-game-creation.component').then((m) => m.OnlineGameCreationComponent), canActivate: [ExclusiveOnlineGameGuard, VerifiedAccountGuard] },
    { path: 'play/:game/:id', loadComponent: () => import('./components/wrapper-components/online-game-wrapper/online-game-wrapper.component').then((m) => m.OnlineGameWrapperComponent), canActivate: [ExclusiveOnlineGameGuard, VerifiedAccountGuard] },
    { path: 'local', loadComponent: () => import('./components/normal-component/local-game-creation/local-game-creation.component').then((m) => m.LocalGameCreationComponent) },
    { path: 'local/:game/config', loadComponent: () => import('./components/wrapper-components/local-game-configuration/local-game-configuration.component').then((m) => m.LocalGameConfigurationComponent) },
    { path: 'local/:game', loadComponent: () => import('./components/wrapper-components/local-game-wrapper/local-game-wrapper.component').then((m) => m.LocalGameWrapperComponent) },
    { path: 'tutorial', loadComponent: () => import('./components/normal-component/tutorial-game-creation/tutorial-game-creation.component').then((m) => m.TutorialGameCreationComponent) },
    { path: 'tutorial/:game', loadComponent: () => import('./components/wrapper-components/tutorial-game-wrapper/tutorial-game-wrapper.component').then((m) => m.TutorialGameWrapperComponent) },
    { path: '', loadComponent: () => import('./components/normal-component/welcome/welcome.component').then((m) => m.WelcomeComponent) },
    { path: 'demo', loadComponent: () => import('./components/normal-component/demo-page/demo-page.component').then((m) => m.DemoPageComponent) },
    { path: '**', loadComponent: () => import('./components/normal-component/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
/* eslint-enable @typescript-eslint/typedef */

export function initializeFirebase(): void {
    Firebase.initializeApp(environment.firebaseConfig);
    const firestore: Firestore.Firestore = Firestore.getFirestore();
    const host: string = firestore.toJSON()['settings'].host;
    if (environment.useEmulators && host !== 'localhost:8080') {
        Firestore.connectFirestoreEmulator(firestore, 'localhost', 8080);
    }

    const fireauth: Auth.Auth = Auth.getAuth();
    if (environment.useEmulators && fireauth.config['emulator'] == null) {
        Auth.connectAuthEmulator(fireauth, 'http://localhost:9099', { disableWarnings: true });
    }
}

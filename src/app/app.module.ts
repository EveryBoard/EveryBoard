import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID, NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Route } from '@angular/router';
import * as Firebase from '@firebase/app';
import * as Auth from '@firebase/auth';
import * as Firestore from '@firebase/firestore';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { DirArrowComponent } from './components/game-components/arrow-component/dir-arrow.component';
import { HexArrowComponent } from './components/game-components/arrow-component/hex-arrow.component';
import { BlankGobanComponent } from './components/game-components/goban-game-component/blank-goban/blank-goban.component';

import { ChatComponent } from './components/normal-component/chat/chat.component';

import { HeaderComponent } from './components/normal-component/header/header.component';







import { PickGameComponent } from './components/normal-component/pick-game/pick-game.component';



import { TimerComponent } from './components/normal-component/timer/timer.component';


import { ViewConfigComponent } from './components/normal-component/view-config/view-config.component';

import { DemoCardWrapperComponent } from './components/wrapper-components/demo-card-wrapper/demo-card-wrapper.component';
import { GameCreationComponent } from './components/wrapper-components/game-creation/game-creation.component';



import { RulesConfigurationComponent } from './components/wrapper-components/rules-configuration/rules-configuration.component';

import { AbaloneComponent } from './games/abalone/abalone.component';
import { ApagosComponent } from './games/apagos/apagos.component';
import { InternationalCheckersComponent } from './games/checkers/international-checkers/international-checkers.component';
import { LascaComponent } from './games/checkers/lasca/lasca.component';
import { CoerceoComponent } from './games/coerceo/coerceo.component';
import { ConnectSixComponent } from './games/connect-six/connect-six.component';
import { ConspirateursComponent } from './games/conspirateurs/conspirateurs.component';
import { DiaballikComponent } from './games/diaballik/diaballik.component';
import { DiamComponent } from './games/diam/diam.component';
import { DvonnComponent } from './games/dvonn/dvonn.component';
import { EncapsuleComponent } from './games/encapsule/encapsule.component';
import { EpaminondasComponent } from './games/epaminondas/epaminondas.component';
import { GipfComponent } from './games/gipf/gipf.component';
import { GoComponent } from './games/gos/go/go.component';
import { TrigoComponent } from './games/gos/trigo/trigo.component';
import { HexodiaComponent } from './games/hexodia/hexodia.component';
import { HivePieceComponent } from './games/hive/hive-piece.component';
import { HiveComponent } from './games/hive/hive.component';
import { KamisadoComponent } from './games/kamisado/kamisado.component';
import { LinesOfActionComponent } from './games/lines-of-action/lines-of-action.component';
import { LodestoneLodestoneComponent } from './games/lodestone/lodestone-lodestone.component';
import { LodestoneComponent } from './games/lodestone/lodestone.component';
import { AwaleComponent } from './games/mancala/awale/awale.component';
import { BaAwaComponent } from './games/mancala/ba-awa/ba-awa.component';
import { NumberedCircleComponent } from './games/mancala/common/numbered-circle.component';
import { KalahComponent } from './games/mancala/kalah/kalah.component';
import { MartianChessDroneComponent } from './games/martian-chess/martian-chess-drone.component';
import { MartianChessPawnComponent } from './games/martian-chess/martian-chess-pawn.component';
import { MartianChessQueenComponent } from './games/martian-chess/martian-chess-queen.component';
import { MartianChessComponent } from './games/martian-chess/martian-chess.component';
import { P4Component } from './games/p4/p4.component';
import { PentagoComponent } from './games/pentago/pentago.component';
import { PenteComponent } from './games/pente/pente.component';
import { PylosComponent } from './games/pylos/pylos.component';
import { QuartoComponent } from './games/quarto/quarto.component';
import { QuebecCastlesComponent } from './games/quebec-castles/quebec-castles.component';
import { QuixoComponent } from './games/quixo/quixo.component';
import { ReversiComponent } from './games/reversi/reversi.component';
import { SaharaComponent } from './games/sahara/sahara.component';
import { SiamOrientationArrowComponent } from './games/siam/siam-orientation-arrow.component';
import { SiamComponent } from './games/siam/siam.component';
import { SixComponent } from './games/six/six.component';
import { SquarzComponent } from './games/squarz/squarz.component';
import { BrandhubComponent } from './games/tafl/brandhub/brandhub.component';
import { HnefataflComponent } from './games/tafl/hnefatafl/hnefatafl.component';
import { TablutComponent } from './games/tafl/tablut/tablut.component';
import { TeekoComponent } from './games/teeko/teeko.component';
import { TrexoHalfPieceComponent } from './games/trexo/trexo-half-piece.component';
import { TrexoComponent } from './games/trexo/trexo.component';
import { YinshComponent } from './games/yinsh/yinsh.component';
import { ConnectedButNotVerifiedGuard } from './guard/connected-but-not-verified.guard';
import { ExclusiveOnlineGameGuard } from './guard/exclusive-online-game-guard';
import { NotConnectedGuard } from './guard/not-connected.guard';
import { VerifiedAccountGuard } from './guard/verified-account.guard';
import { AutofocusDirective } from './pipes-and-directives/autofocus.directive';
import { HumanDurationPipe } from './pipes-and-directives/human-duration.pipe';
import { ToggleVisibilityDirective } from './pipes-and-directives/toggle-visibility.directive';
import { ChatService } from './services/ChatService';
import { ConfigRoomService } from './services/ConfigRoomService';
import { ConnectedUserService } from './services/ConnectedUserService';
import { GameService } from './services/GameService';
import { ThemeService } from './services/ThemeService';
import { UserService } from './services/UserService';
import { LocaleUtils } from './utils/LocaleUtils';
import { WelcomeComponent } from './components/normal-component/welcome/welcome.component';
import { LoginComponent } from './components/normal-component/login/login.component';
import { LobbyComponent } from './components/normal-component/lobby/lobby.component';
import { RegisterComponent } from './components/normal-component/register/register.component';
import { NotFoundComponent } from './components/normal-component/not-found/not-found.component';
import { NextGameLoadingComponent } from './components/normal-component/next-game-loading/next-game-loading.component';
import { OnlineGameWrapperComponent } from './components/wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { LocalGameWrapperComponent } from './components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { TutorialGameWrapperComponent } from './components/wrapper-components/tutorial-game-wrapper/tutorial-game-wrapper.component';
import { LocalGameConfigurationComponent } from './components/wrapper-components/local-game-configuration/local-game-configuration.component';
import { LocalGameCreationComponent } from './components/normal-component/local-game-creation/local-game-creation.component';
import { OnlineGameSelectionComponent } from './components/normal-component/online-game-selection/online-game-selection.component';
import { TutorialGameCreationComponent } from './components/normal-component/tutorial-game-creation/tutorial-game-creation.component';
import { VerifyAccountComponent } from './components/normal-component/verify-account/verify-account.component';
import { ResetPasswordComponent } from './components/normal-component/reset-password/reset-password.component';
import { SettingsComponent } from './components/normal-component/settings/settings.component';
import { AccountComponent } from './components/normal-component/account/account.component';
import { DemoPageComponent } from './components/normal-component/demo-page/demo-page.component';

registerLocaleData(localeFr);

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

export class AppModule {

    public constructor() {
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

}

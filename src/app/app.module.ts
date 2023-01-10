import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, ModuleWithProviders, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Route } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import localeFr from '@angular/common/locales/fr';

import { ChatService } from './services/ChatService';
import { UserService } from './services/UserService';
import { ConnectedUserService } from './services/ConnectedUserService';
import { GameService } from './services/GameService';
import { ConfigRoomService } from './services/ConfigRoomService';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/normal-component/header/header.component';
import { WelcomeComponent } from './components/normal-component/welcome/welcome.component';
import { DemoPageComponent } from './components/normal-component/demo-page/demo-page.component';
import { LoginComponent } from './components/normal-component/login/login.component';
import { LobbyComponent } from './components/normal-component/lobby/lobby.component';
import { PickGameComponent } from './components/normal-component/pick-game/pick-game.component';
import { PartCreationComponent } from './components/wrapper-components/part-creation/part-creation.component';
import { NotFoundComponent } from './components/normal-component/not-found/not-found.component';
import { ChatComponent } from './components/normal-component/chat/chat.component';
import { CountDownComponent } from './components/normal-component/count-down/count-down.component';
import { OnlineGameWrapperComponent }
    from './components/wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { TutorialGameWrapperComponent }
    from './components/wrapper-components/tutorial-game-wrapper/tutorial-game-wrapper.component';
import { RegisterComponent } from './components/normal-component/register/register.component';
import { LocalGameCreationComponent }
    from './components/normal-component/local-game-creation/local-game-creation.component';
import { OnlineGameSelectionComponent }
    from './components/normal-component/online-game-selection/online-game-selection.component';
import { TutorialGameCreationComponent }
    from './components/normal-component/tutorial-game-creation/tutorial-game-creation.component';
import { NextGameLoadingComponent } from './components/normal-component/next-game-loading/next-game-loading.component';

import { AbaloneComponent } from './games/abalone/abalone.component';
import { ApagosComponent } from './games/apagos/apagos.component';
import { AwaleComponent } from './games/awale/awale.component';
import { BrandhubComponent } from './games/tafl/brandhub/brandhub.component';
import { CoerceoComponent } from './games/coerceo/coerceo.component';
import { ConspirateursComponent } from './games/conspirateurs/conspirateurs.component';
import { DiamComponent } from './games/diam/diam.component';
import { DvonnComponent } from './games/dvonn/dvonn.component';
import { EncapsuleComponent } from './games/encapsule/encapsule.component';
import { EpaminondasComponent } from './games/epaminondas/epaminondas.component';
import { GipfComponent } from './games/gipf/gipf.component';
import { GoComponent } from './games/go/go.component';
import { HnefataflComponent } from './games/tafl/hnefatafl/hnefatafl.component';
import { KamisadoComponent } from './games/kamisado/kamisado.component';
import { LinesOfActionComponent } from './games/lines-of-action/lines-of-action.component';
import { LodestoneComponent } from './games/lodestone/lodestone.component';
import { MartianChessComponent } from './games/martian-chess/martian-chess.component';
import { MartianChessQueenComponent } from './games/martian-chess/martian-chess-queen.component';
import { MartianChessDroneComponent } from './games/martian-chess/martian-chess-drone.component';
import { MartianChessPawnComponent } from './games/martian-chess/martian-chess-pawn.component';
import { P4Component } from './games/p4/p4.component';
import { PentagoComponent } from './games/pentago/pentago.component';
import { PylosComponent } from './games/pylos/pylos.component';
import { QuartoComponent } from './games/quarto/quarto.component';
import { QuixoComponent } from './games/quixo/quixo.component';
import { ReversiComponent } from './games/reversi/reversi.component';
import { SaharaComponent } from './games/sahara/sahara.component';
import { SiamComponent } from './games/siam/siam.component';
import { SixComponent } from './games/six/six.component';
import { TablutComponent } from './games/tafl/tablut/tablut.component';
import { TrexoComponent } from './games/trexo/trexo.component';
import { YinshComponent } from './games/yinsh/yinsh.component';

import { environment } from 'src/environments/environment';
import { LocaleUtils } from './utils/LocaleUtils';

import { VerifiedAccountGuard } from './guard/verified-account.guard';
import { ExclusiveOnlineGameGuard } from './guard/exclusive-online-game-guard';
import { ConnectedButNotVerifiedGuard } from './guard/connected-but-not-verified.guard';
import { NotConnectedGuard } from './guard/not-connected.guard';

import { VerifyAccountComponent } from './components/normal-component/verify-account/verify-account.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ResetPasswordComponent } from './components/normal-component/reset-password/reset-password.component';
import { SettingsComponent } from './components/normal-component/settings/settings.component';
import { OnlineGameCreationComponent } from './components/normal-component/online-game-creation/online-game-creation.component';

import * as Firebase from '@angular/fire/app';
import * as Firestore from '@angular/fire/firestore';
import * as Auth from '@angular/fire/auth';
import { ThemeService } from './services/ThemeService';
import { HumanDurationPipe } from './pipes-and-directives/human-duration.pipe';
import { AutofocusDirective } from './pipes-and-directives/autofocus.directive';
import { ToggleVisibilityDirective } from './pipes-and-directives/toggle-visibility.directive';
import { FirestoreTimePipe } from './pipes-and-directives/firestore-time.pipe';
import { DemoCardWrapperComponent } from './components/wrapper-components/demo-card-wrapper/demo-card-wrapper.component';
import { ThreeDIsoSquareComponent } from './games/trexo/three-d-iso-square.component';

registerLocaleData(localeFr);

export const routes: Route[] = [
    { path: 'login', component: LoginComponent },
    { path: 'lobby', component: LobbyComponent, canActivate: [VerifiedAccountGuard] },
    { path: 'settings', component: SettingsComponent },
    { path: 'register', component: RegisterComponent, canActivate: [NotConnectedGuard] },
    { path: 'reset-password', component: ResetPasswordComponent, canActivate: [NotConnectedGuard] },
    { path: 'notFound/:message', component: NotFoundComponent },
    { path: 'nextGameLoading', component: NextGameLoadingComponent, canActivate: [VerifiedAccountGuard] },
    { path: 'verify-account', component: VerifyAccountComponent, canActivate: [ConnectedButNotVerifiedGuard] },
    { path: 'play', component: OnlineGameSelectionComponent, canActivate: [VerifiedAccountGuard, ExclusiveOnlineGameGuard] },
    { path: 'play/:compo', component: OnlineGameCreationComponent, canActivate: [VerifiedAccountGuard, ExclusiveOnlineGameGuard] },
    { path: 'play/:compo/:id', component: OnlineGameWrapperComponent, canActivate: [VerifiedAccountGuard, ExclusiveOnlineGameGuard] },
    { path: 'local', component: LocalGameCreationComponent },
    { path: 'local/:compo', component: LocalGameWrapperComponent },
    { path: 'tutorial', component: TutorialGameCreationComponent },
    { path: 'tutorial/:compo', component: TutorialGameWrapperComponent },
    { path: '', component: WelcomeComponent },
    { path: 'demo', component: DemoPageComponent },
    { path: '**', component: NotFoundComponent },
];

export class FirebaseProviders {
    public static app(): ModuleWithProviders<Firebase.FirebaseAppModule> {
        return Firebase.provideFirebaseApp(() => {
            return Firebase.initializeApp(environment.firebaseConfig);
        });
    }
    public static firestore(): ModuleWithProviders<Firestore.FirestoreModule> {
        return Firestore.provideFirestore(() => {
            const firestore: Firestore.Firestore = Firestore.getFirestore();
            // eslint-disable-next-line dot-notation
            const host: string = firestore.toJSON()['settings'].host;
            if (environment.useEmulators && host !== 'localhost:8080') {
                Firestore.connectFirestoreEmulator(firestore, 'localhost', 8080);
            }
            return firestore;
        });
    }
    public static auth(): ModuleWithProviders<Auth.AuthModule> {
        return Auth.provideAuth(() => {
            const fireauth: Auth.Auth = Auth.getAuth();
            // eslint-disable-next-line dot-notation
            if (environment.useEmulators && fireauth.config['emulator'] == null) {
                Auth.connectAuthEmulator(fireauth, 'http://localhost:9099', { disableWarnings: true });
            }
            return fireauth;
        });
    }
}

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        WelcomeComponent,
        LoginComponent,
        LobbyComponent,
        PickGameComponent,
        ChatComponent,
        PartCreationComponent,
        RegisterComponent,
        NotFoundComponent,
        NextGameLoadingComponent,
        CountDownComponent,
        OnlineGameWrapperComponent,
        LocalGameWrapperComponent,
        TutorialGameWrapperComponent,
        LocalGameCreationComponent,
        OnlineGameSelectionComponent,
        TutorialGameCreationComponent,
        VerifyAccountComponent,
        ResetPasswordComponent,
        SettingsComponent,
        DemoCardWrapperComponent,
        DemoPageComponent,

        AbaloneComponent,
        ApagosComponent,
        AwaleComponent,
        BrandhubComponent,
        CoerceoComponent,
        ConspirateursComponent,
        DiamComponent,
        DvonnComponent,
        EncapsuleComponent,
        EpaminondasComponent,
        GipfComponent,
        GoComponent,
        HnefataflComponent,
        KamisadoComponent,
        LinesOfActionComponent,
        LodestoneComponent,
        MartianChessComponent, MartianChessQueenComponent, MartianChessDroneComponent, MartianChessPawnComponent,
        P4Component,
        PentagoComponent,
        PylosComponent,
        QuartoComponent,
        QuixoComponent,
        ReversiComponent,
        SaharaComponent,
        SiamComponent,
        SixComponent,
        TablutComponent,
        TrexoComponent, ThreeDIsoSquareComponent,
        YinshComponent,

        HumanDurationPipe,
        FirestoreTimePipe,
        AutofocusDirective,
        ToggleVisibilityDirective,
    ],
    imports: [
        FirebaseProviders.app(),
        FirebaseProviders.firestore(),
        FirebaseProviders.auth(),
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(routes, { useHash: false }),
        ReactiveFormsModule,
        FormsModule,
        BrowserAnimationsModule,
        FontAwesomeModule,
    ],
    providers: [
        ConnectedUserService,
        GameService,
        ConfigRoomService,
        UserService,
        ChatService,
        ThemeService,
        { provide: LOCALE_ID, useValue: LocaleUtils.getLocale() },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }

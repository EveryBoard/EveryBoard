import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Route } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import localeFr from '@angular/common/locales/fr';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { PartDAO } from './dao/PartDAO';

import { ChatService } from './services/ChatService';
import { UserService } from './services/UserService';
import { AuthenticationService } from './services/AuthenticationService';
import { GameService } from './services/GameService';
import { JoinerService } from './services/JoinerService';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/normal-component/header/header.component';
import { WelcomeComponent } from './components/normal-component/welcome/welcome.component';
import { LoginComponent } from './components/normal-component/login/login.component';
import { ServerPageComponent } from './components/normal-component/server-page/server-page.component';
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
import { GameIncluderComponent } from './components/game-components/game-includer/game-includer.component';
import { RegisterComponent } from './components/normal-component/register/register.component';
import { LocalGameCreationComponent }
    from './components/normal-component/local-game-creation/local-game-creation.component';
import { OnlineGameCreationComponent }
    from './components/normal-component/online-game-creation/online-game-creation.component';
import { TutorialGameCreationComponent }
    from './components/normal-component/tutorial-game-creation/tutorial-game-creation.component';
import { HumanDuration } from './utils/TimeUtils';
import { NextGameLoadingComponent } from './components/normal-component/next-game-loading/next-game-loading.component';

import { AbaloneComponent } from './games/abalone/abalone.component';
import { ApagosComponent } from './games/apagos/apagos.component';
import { AwaleComponent } from './games/awale/awale.component';
import { BrandhubComponent } from './games/tafl/brandhub/brandhub.component';
import { CoerceoComponent } from './games/coerceo/coerceo.component';
import { DiamComponent } from './games/diam/diam.component';
import { DvonnComponent } from './games/dvonn/dvonn.component';
import { EncapsuleComponent } from './games/encapsule/encapsule.component';
import { EpaminondasComponent } from './games/epaminondas/epaminondas.component';
import { GipfComponent } from './games/gipf/gipf.component';
import { GoComponent } from './games/go/go.component';
import { KamisadoComponent } from './games/kamisado/kamisado.component';
import { LinesOfActionComponent } from './games/lines-of-action/lines-of-action.component';
import { MinimaxTestingComponent } from './games/minimax-testing/minimax-testing.component';
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
import { YinshComponent } from './games/yinsh/yinsh.component';

import { environment } from 'src/environments/environment';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { USE_EMULATOR as USE_DATABASE_EMULATOR } from '@angular/fire/database';
import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { LocaleUtils } from './utils/LocaleUtils';

import { VerifiedAccountGuard } from './guard/verified-account.guard';
import { VerifyAccountComponent } from './components/normal-component/verify-account/verify-account.component';
import { ConnectedButNotVerifiedGuard } from './guard/connected-but-not-verified.guard';
import { NotConnectedGuard } from './guard/not-connected.guard';
import { AutofocusDirective } from './directives/autofocus.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToggleVisibilityDirective } from './directives/toggle-visibility.directive';
import { ResetPasswordComponent } from './components/normal-component/reset-password/reset-password.component';
import { ThemeService } from './services/ThemeService';
import { SettingsComponent } from './components/normal-component/settings/settings.component';

registerLocaleData(localeFr);

const routes: Route [] = [
    { path: 'login', component: LoginComponent },
    { path: 'server', component: ServerPageComponent, canActivate: [VerifiedAccountGuard] },
    { path: 'settings', component: SettingsComponent },
    { path: 'register', component: RegisterComponent, canActivate: [NotConnectedGuard] },
    { path: 'reset-password', component: ResetPasswordComponent, canActivate: [NotConnectedGuard] },
    { path: 'notFound', component: NotFoundComponent, canActivate: [VerifiedAccountGuard] },
    { path: 'nextGameLoading', component: NextGameLoadingComponent, canActivate: [VerifiedAccountGuard] },
    { path: 'verify-account', component: VerifyAccountComponent, canActivate: [ConnectedButNotVerifiedGuard] },

    { path: 'play', component: OnlineGameCreationComponent, canActivate: [VerifiedAccountGuard] },
    { path: 'play/:compo/:id', component: OnlineGameWrapperComponent, canActivate: [VerifiedAccountGuard] },
    { path: 'local', component: LocalGameCreationComponent },
    { path: 'local/:compo', component: LocalGameWrapperComponent },
    { path: 'tutorial', component: TutorialGameCreationComponent },
    { path: 'tutorial/:compo', component: TutorialGameWrapperComponent },
    { path: '', component: WelcomeComponent },
    { path: '**', component: WelcomeComponent },
];

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        WelcomeComponent,
        LoginComponent,
        ServerPageComponent,
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
        GameIncluderComponent,
        LocalGameCreationComponent,
        OnlineGameCreationComponent,
        TutorialGameCreationComponent,
        VerifyAccountComponent,
        ResetPasswordComponent,
        SettingsComponent,

        AbaloneComponent,
        ApagosComponent,
        AwaleComponent,
        BrandhubComponent,
        CoerceoComponent,
        DiamComponent,
        DvonnComponent,
        EncapsuleComponent,
        EpaminondasComponent,
        GipfComponent,
        GoComponent,
        KamisadoComponent,
        LinesOfActionComponent,
        MinimaxTestingComponent,
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
        YinshComponent,

        HumanDuration,
        AutofocusDirective,
        ToggleVisibilityDirective,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(routes, { useHash: false }),
        ReactiveFormsModule,
        FormsModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        BrowserAnimationsModule,
        FontAwesomeModule,
    ],
    providers: [
        { provide: USE_AUTH_EMULATOR, useValue: environment.emulatorConfig.auth },
        { provide: USE_DATABASE_EMULATOR, useValue: environment.emulatorConfig.database },
        { provide: USE_FIRESTORE_EMULATOR, useValue: environment.emulatorConfig.firestore },
        { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.emulatorConfig.functions },
        AuthenticationService,
        GameService,
        JoinerService,
        UserService,
        ChatService,
        PartDAO,
        AngularFireAuth,
        ThemeService,
        { provide: LOCALE_ID, useValue: LocaleUtils.getLocale() },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }

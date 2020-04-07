import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule, Route} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from '../material-modules';

import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule, AngularFirestore} from '@angular/fire/firestore';

import {GameIncluderDirective} from './directives/game-includer.directive';

import {ChatService} from './services/chat/ChatService';
import {UserService} from './services/user/UserService';
import {AuthenticationService} from './services/authentication/AuthenticationService';
import {GameService} from './services/game/GameService';
import {JoinerService} from './services/joiner/JoinerService';

import {AppComponent} from './app.component';

import {HeaderComponent} from './components/normal-component/header/header.component';
import {LoginComponent} from './components/normal-component/login-page/login.component';
import {ServerPageComponent} from './components/normal-component/server-page/server-page.component';

import {firebaseConfig} from './firebaseConfig';

import {PartCreationComponent} from './components/normal-component/part-creation/part-creation.component';
import {ChatComponent} from './components/normal-component/chat/chat.component';
import {CountDownComponent} from './components/normal-component/count-down/count-down.component';
import {OnlineGameWrapperComponent} from './components/game-components/online-game-wrapper/online-game-wrapper.component';
import {LocalGameWrapperComponent} from './components/game-components/local-game-wrapper/local-game-wrapper.component';
import {GameIncluderComponent} from './components/game-components/game-includer/game-includer.component';

import {AwaleComponent} from './components/game-components/awale/awale.component';
import {EncapsuleComponent} from './components/game-components/encapsule/encapsule.component';
import {GoComponent} from './components/game-components/go/go.component';
import {P4Component} from './components/game-components/p4/p4.component';
import {QuartoComponent} from './components/game-components/quarto/quarto.component';
import {ReversiComponent} from './components/game-components/reversi/reversi.component';
import {TablutComponent} from './components/game-components/tablut/tablut.component';
import { MinimaxTestingComponent } from './components/game-components/minimax-testing/minimax-testing.component';
import { SiamComponent } from './components/game-components/siam/siam.component';
import { PartDAO } from './dao/PartDAO';
import { AngularFireAuth } from '@angular/fire/auth';
import { InscriptionComponent } from './components/normal-component/inscription/inscription.component';
import { ConfirmInscriptionComponent } from './components/normal-component/confirm-inscription/confirm-inscription.component';
import { EmailVerified } from './guard/EmailVerified';
import { SaharaComponent } from './components/game-components/sahara/sahara.component';

export const INCLUDE_VERBOSE_LINE_IN_TEST = false;

const routes: Route [] = [
    {path: 'login',               component: LoginComponent},
    {path: 'server',              component: ServerPageComponent, canActivate: [EmailVerified]},
    {path: 'inscription',         component: InscriptionComponent},
    {path: 'confirm-inscription', component: ConfirmInscriptionComponent},

    {path: 'play/:compo/:id',     component: OnlineGameWrapperComponent, canActivate: [EmailVerified]},
    {path: 'local/:compo',        component: LocalGameWrapperComponent},
    {path: '', redirectTo: 'server', pathMatch: 'full'},
    {path: '**',                  component: ServerPageComponent}
];

@NgModule({
    declarations: [
        GameIncluderDirective, // TODO: check use

        AppComponent,
        HeaderComponent,
        LoginComponent,
        ServerPageComponent,
        ChatComponent,
        PartCreationComponent,
        InscriptionComponent,

        CountDownComponent,
        OnlineGameWrapperComponent,
        GameIncluderComponent,
        LocalGameWrapperComponent,

        AwaleComponent,
        EncapsuleComponent,
        GoComponent,
        MinimaxTestingComponent,
        P4Component,
        QuartoComponent,
        ReversiComponent,
        SiamComponent,
        TablutComponent,
        ConfirmInscriptionComponent,
        SaharaComponent,
    ],
    entryComponents: [
        AwaleComponent,
        EncapsuleComponent,
        GoComponent,
        MinimaxTestingComponent,
        P4Component,
        QuartoComponent,
        ReversiComponent,
        SaharaComponent,
        SiamComponent,
        TablutComponent,

        CountDownComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(routes, {useHash: true}),
        ReactiveFormsModule,
        FormsModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule,
        BrowserAnimationsModule,
        MaterialModule,
    ],
    providers: [
        AuthenticationService,
        GameService,
        JoinerService,
        UserService,
        ChatService,
        PartDAO,
        AngularFirestore,
        AngularFireAuth
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
import {BrowserModule} from '@angular/platform-browser';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule, Route} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from '../material-modules';

import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';

import {GameIncluderDirective} from './directives/game-includer.directive';

import {UserService} from './services/UserService';
import {AuthenticationService} from './services/AuthenticationService';
import {GameService} from './services/GameService';
import {JoinerService} from './services/JoinerService';

import {AppComponent} from './app.component';

import {CreateAccountComponent} from './components/normal-component/create-account/create-account.component';
import {FooterComponent} from './components/normal-component/footer/footer.component';
import {HeaderComponent} from './components/normal-component/header/header.component';
import {LoginComponent} from './components/normal-component/login-page/login.component';
import {ServerPageComponent} from './components/normal-component/server-page/server-page.component';
import {StatisticPageComponent} from './components/normal-component/statistic-page/statistic-page.component';

import {firebaseConfig} from './firebaseConfig';

import {ChatService} from './services/ChatService';
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

const routes: Route [] = [
    {path: 'login',             component: LoginComponent},
    {path: 'server',            component: ServerPageComponent},
    {path: 'statistic',         component: StatisticPageComponent},
    {path: 'createAccount',     component: CreateAccountComponent},

    {path: 'play/:compo/:id',   component: OnlineGameWrapperComponent},
    {path: 'local/:compo',      component: LocalGameWrapperComponent},
    {path: '', redirectTo: 'server', pathMatch: 'full'},
    {path: '**',                component: ServerPageComponent}
];

@NgModule({
    declarations: [
        GameIncluderDirective,

        AppComponent,
        HeaderComponent,
        FooterComponent,
        LoginComponent,
        ServerPageComponent,
        ChatComponent,
        StatisticPageComponent,
        CreateAccountComponent,
        PartCreationComponent,

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
        TablutComponent,
    ],
    entryComponents: [
        AwaleComponent,
        EncapsuleComponent,
        GoComponent,
        MinimaxTestingComponent,
        P4Component,
        QuartoComponent,
        ReversiComponent,
        TablutComponent,

        CountDownComponent, // TODO: figure out if needed
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        //HttpModule,
        RouterModule.forRoot(routes, {useHash: true}),
        ReactiveFormsModule,
        FormsModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule,
        BrowserAnimationsModule,
        MaterialModule
    ],
    providers: [AuthenticationService, GameService, JoinerService, UserService, ChatService],
    bootstrap: [AppComponent]
})
export class AppModule {

}
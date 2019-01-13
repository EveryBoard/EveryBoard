import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {HttpModule} from '@angular/http';
import {RouterModule, Route} from '@angular/router';

import {AngularFireModule} from 'angularfire2';
import {AngularFirestoreModule} from 'angularfire2/firestore';

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

import {P4OfflineComponent} from './components/offline-components/p4-offline/p4-offline.component';
import {AwaleOfflineComponent} from './components/offline-components/awale-offline/awale-offline.component';

import {firebaseConfig} from './firebaseConfig';

import {QuartoComponent} from './components/game-components/quarto/quarto.component';
import {P4Component} from './components/game-components/p4/p4.component';
import {AwaleComponent} from './components/game-components/awale/awale.component';
import {TablutComponent} from './components/game-components/tablut/tablut.component';
import {QuartoOfflineComponent} from './components/offline-components/quarto-offline/quarto-offline.component';
import {TablutOfflineComponent} from './components/offline-components/tablut-offline/tablut-offline.component';
import {PartCreationComponent} from './components/normal-component/part-creation/part-creation.component';
import { ChatComponent } from './components/normal-component/chat/chat.component';

const routes: Route [] = [
	{path: 'login',				component: LoginComponent},
	{path: 'server',			component: ServerPageComponent},
	{path: 'statistic',			component: StatisticPageComponent},
	{path: 'createAccount',		component: CreateAccountComponent},

	{path: 'P4Offline',			component: P4OfflineComponent},
	{path: 'AwaleOffline',		component: AwaleOfflineComponent},

	{path: 'Quarto/:id',		component: QuartoComponent},
	{path: 'Awale/:id',			component: AwaleComponent},
	{path: 'Tablut/:id',		component: TablutComponent},
	{path: 'P4/:id',			component: P4Component},

	{path: '', redirectTo: 'server', pathMatch: 'full'},
	{path: '**', 'component': ServerPageComponent}
];

@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		FooterComponent,
		LoginComponent,
		ServerPageComponent,
		StatisticPageComponent,
		CreateAccountComponent,
		PartCreationComponent,

		QuartoComponent,
		P4Component,
		AwaleComponent,
		TablutComponent,

		AwaleOfflineComponent,
		P4OfflineComponent,
		QuartoOfflineComponent,
		TablutOfflineComponent,
		ChatComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		HttpModule,
		RouterModule.forRoot(routes, {useHash: true}),
		ReactiveFormsModule,
		FormsModule,
		AngularFireModule.initializeApp(firebaseConfig),
		AngularFirestoreModule
	],
	providers: [AuthenticationService, GameService, JoinerService, UserService],
	bootstrap: [AppComponent]
})
export class AppModule {
}

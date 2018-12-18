import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {HttpModule} from '@angular/http';
import {RouterModule, Route} from '@angular/router';

import {AngularFireModule} from 'angularfire2';
import {AngularFirestoreModule} from 'angularfire2/firestore';

import {UserService} from './services/user-service';
import {GameInfoService} from './services/game-info-service';

import {AppComponent} from './app.component';

import {CreateAccountComponent} from './components/normal-component/create-account/create-account.component';
import {FooterComponent} from './components/normal-component/footer/footer.component';
import {HeaderComponent} from './components/normal-component/header/header.component';
import {JoiningPageComponent} from './components/normal-component/joining-page/joining-page.component';
import {LoginComponent} from './components/normal-component/login-page/login.component';
import {ServerPageComponent} from './components/normal-component/server-page/server-page.component';
import {StatisticPageComponent} from './components/normal-component/statistic-page/statistic-page.component';

import {P4OfflineComponent} from './components/offline-components/p4-offline/p4-offline.component';
import {AwaleOfflineComponent} from './components/offline-components/awale-offline/awale-offline.component';

import {firebaseConfig} from './firebaseConfig';

import {QuartoComponent} from './components/game-components/quarto/quarto.component';
import {P4Component} from './components/game-components/p4/p4.component';
import {AwaleComponent} from './components/game-components/awale/awale.component';

const routes: Route [] = [
	{path: 'server',			component: ServerPageComponent},
	{path: 'statistic',			component: StatisticPageComponent},
	{path: 'createAccount',		component: CreateAccountComponent},
	{path: 'joiningPage',		component: JoiningPageComponent},

	{path: 'P4Offline',			component: P4OfflineComponent},
	{path: 'AwaleOffline',		component: AwaleOfflineComponent},

	{path: 'QuartoOnline',		component: QuartoComponent},
	{path: 'P4Online',			component: P4Component},
	{path: 'AwaleOnline',		component: AwaleComponent},

	{path: '', redirectTo: 'login-page', pathMatch: 'full'},
	{path: '**', 'component': LoginComponent}
];

@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		FooterComponent,
		LoginComponent,
		P4OfflineComponent,
		ServerPageComponent,
		StatisticPageComponent,
		CreateAccountComponent,
		JoiningPageComponent,
		AwaleOfflineComponent,

		QuartoComponent,
		P4Component,
		AwaleComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		HttpModule,
		RouterModule.forRoot(routes),
		ReactiveFormsModule,
		FormsModule,
		AngularFireModule.initializeApp(firebaseConfig),
		AngularFirestoreModule
	],
	providers: [UserService, GameInfoService],
	bootstrap: [AppComponent]
})
export class AppModule {
}

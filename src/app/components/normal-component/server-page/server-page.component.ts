import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import {IUserId} from '../../../domain/iuser';
import {ICurrentPartId} from '../../../domain/icurrentpart';

import {UserService} from '../../../services/UserService';
import {GameService} from '../../../services/GameService';

@Component({
	selector: 'app-server-page',
	templateUrl: './server-page.component.html',
	styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit, OnDestroy {

	activesParts: ICurrentPartId[];
	activesUsers: IUserId[];
	readonly gameNameList: String[] = ['P4', 'Awale', 'Quarto', 'Tablut', 'Reversi'];
	selectedGame: string;
	userName: string;

	private userNameSub: Subscription;
	private activesPartsSub: Subscription;
	private activesUsersSub: Subscription;

	constructor(private _route: Router,
				private userService: UserService,
				private gameService: GameService) {}

	ngOnInit() {
		this.userNameSub =
			this.userService.userNameObs
				.subscribe(userName => this.userName = userName);

		this.activesPartsSub = this.gameService
			.getActivesPartsObs()
			.subscribe(
				activesParts => this.activesParts = activesParts);

		this.activesUsersSub = this.userService
			.getActivesUsersObs()
			.subscribe(
				activesUsers => this.activesUsers = activesUsers);
	}

	joinGame(partId: string, typeGame: string) {
		if (this.userLogged()) {
			/* this.gameService.joinGame(partId, this.userName) // TODO : just navigate
				.then(onFullFilled => this._route.navigate(['/' + typeGame, partId]))
				.catch(onRejected => console.log('joiningGame failed (part ref not found I guess)'));
				*/ // OLDLY
			// this._route.navigate(['/play/' + typeGame, partId]); // NEW
			this._route.navigate([typeGame, partId]); // NEW
		} else {
			console.log('vous devez vous connecter pour rejoindre??'); // TODO: redirect vers la connection, doit il ??
		}
	}

	userLogged(): boolean {
		return (this.userName != null) && (this.userName !== '');
	}

	playLocally() {
		this._route.navigate([this.selectedGame + 'Offline']);
	}

	createGame() {
		if (this.canCreateGame()) {
			this.gameService
				.createGame(this.userName, this.selectedGame, '') // create Part and Joiner
				.then(createdDocId => {
					// this._route.navigate(['/play/' + this.selectedGame, createdDocId]);
					this._route.navigate([this.selectedGame, createdDocId]);
				})
				.catch(onRejected => {
					console.log('gameService Failed to create a game: ');
					console.log(JSON.stringify(onRejected));
				});
		} else {
			console.log('vous devez vous connecter pour créer une partie'); // TODO: redirect vers la connection
		}
	}

	canCreateGame(): boolean {
		if (!this.userLogged()) {
			return false;
		}
		let i = 0;
		let found = false; // todo : faire en stream pour le sexe
		let playerZero: string;
		let playerOne: string;
		while (	(i < this.activesParts.length) && (!found)) {
			playerZero = this.activesParts[i].part.playerZero;
			playerOne = this.activesParts[i++].part.playerOne;
			found = (this.userName === playerZero) || (this.userName === playerOne);
		}
		return !found;
	}

	ngOnDestroy() {
		if (this.userNameSub) {
			this.userNameSub.unsubscribe();
		}
		if (this.activesPartsSub) {
			this.activesPartsSub.unsubscribe();
			this.gameService.unSubFromActivesPartsObs();
		}
		if (this.activesUsersSub) {
			this.activesUsersSub.unsubscribe();
			this.userService.unSubFromActivesUsersObs();
		}
	}

}

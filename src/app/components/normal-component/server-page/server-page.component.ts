import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import {IUserId} from '../../../domain/iuser';
import {ICurrentPartId} from '../../../domain/icurrentpart';

import {GameInfoService} from '../../../services/game-info-service';
import {UserService} from '../../../services/UserService';
import {GameService} from '../../../services/game.service';

@Component({
	selector: 'app-server-page',
	templateUrl: './server-page.component.html',
	styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit, OnDestroy {

	partIds: ICurrentPartId[];
	activeUsers: IUserId[];
	readonly gameNameList: String[] = ['P4', 'Awale', 'Quarto', 'Tablut'];
	selectedGame: string;
	userName: string;

	private userNameSub: Subscription;
	private currentActivePartSub: Subscription;
	private currentActiveUserSub: Subscription;

	constructor(private _route: Router,
				private gameInfoService: GameInfoService,
				private userService: UserService,
				private partService: GameService) {}

	ngOnInit() {
		this.userNameSub =
			this.userService.currentUsernameObservable
				.subscribe(userName => this.userName = userName);

		this.partService.observeAllActivePart();
		this.currentActivePartSub =
			this.partService.currentActivePartObservable.subscribe(
				currentActivePartId => this.partIds = currentActivePartId);

		this.userService.observeAllActiveUser();
		this.currentActiveUserSub =
			this.userService.currentActiveUsersObservable.subscribe(
				currentActiveUsers => this.activeUsers = currentActiveUsers);
	}

	joinGame(partId: string, typeGame: string) {
		if (this.userLogged()) {
			this.partService.joinGame(partId, this.userName)
				.then(onfullfilled => this._route.navigate(['/' + typeGame, partId]))
				.catch(onrejected => console.log('joiningGame failed (part ref not found I guess)'));
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
			this.partService
				.createAndJoinGame(this.userName, this.selectedGame);
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
		while (	(i < this.partIds.length) && (!found)) {
			playerZero = this.partIds[i].part.playerZero;
			playerOne = this.partIds[i++].part.playerOne;
			found = (this.userName === playerZero) || (this.userName === playerOne);
		}
		return !found;
	}

	ngOnDestroy() {
		if (this.userNameSub) {
			this.userNameSub.unsubscribe();
		}
		if (this.currentActivePartSub) {
			this.currentActivePartSub.unsubscribe();
		}
		if (this.currentActiveUserSub) {
			this.currentActiveUserSub.unsubscribe();
		}
	}

}

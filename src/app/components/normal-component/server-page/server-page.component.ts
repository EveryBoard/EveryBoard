import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Router} from '@angular/router';

import {UserDAO} from '../../../dao/UserDAO';

import {IUser, IUserId} from '../../../domain/iuser';
import {ICurrentPart, ICurrentPartId} from '../../../domain/icurrentpart';

import {GameInfoService} from '../../../services/game-info-service';
import {UserService} from '../../../services/UserService';
import {IJoiner} from '../../../domain/ijoiner';
import {PartService} from '../../../services/PartService';
import {environment} from '../../../../environments/environment';

@Component({
	selector: 'app-server-page',
	templateUrl: './server-page.component.html',
	styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit {

	partIds: ICurrentPartId[];
	activeUsers: IUserId[];
	readonly gameNameList: String[] = ['P4', 'Awale', 'Quarto', 'Tablut'];
	selectedGame: string;
	userName: string;

	constructor(private _route: Router,
				private gameInfoService: GameInfoService,
				private userService: UserService,
				private partService: PartService) {}

	ngOnInit() {
		this.userService.currentUsernameObservable.subscribe(message =>
			this.userName = message);
		this.partService.observeAllActivePart();
		this.partService.currentActivePartObservable.subscribe(
			currentActivePart => this.partIds = currentActivePart);

		this.userService.observeAllActiveUser();
		this.userService.currentActiveUsersObservable.subscribe(
			currentActiveUsers => this.activeUsers = currentActiveUsers);
	}

	joinGame(partId: string, typeGame: string) {
		this.partService.joinGame(partId, this.userName);
		this.gameInfoService.changeGame(partId, typeGame);
		this._route.navigate(['/' + typeGame, partId]);
	}

	playLocally() {
		this._route.navigate([this.selectedGame + 'Offline']);
	}

	createGame() {
		if (this.canCreateGame()) {
			this.partService.createGame(this.userName, this.selectedGame).then(oncreated => {
				this._route.navigate(['/' + this.selectedGame, this.partService.getPartId()]);
			});
		}
	}

	canCreateGame(): boolean {
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

}

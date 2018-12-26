import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Router} from '@angular/router';

import {UserDAO} from '../../../dao/UserDAO';

import {IUser, IUserId} from '../../../domain/iuser';
import {ICurrentPart, ICurrentPartId} from '../../../domain/icurrentpart';

import {GameInfoService} from '../../../services/game-info-service';
import {UserService} from '../../../services/user-service';
import {IJoiner} from '../../../domain/ijoiner';
import {PartService} from '../../../services/PartService';

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
		/* this.afs.collection('parties').ref
			.where('result', '==', 5) // TODO : afs se fait appeler par les DAO !
			.onSnapshot( (querySnapshot) => {
				const tmpPartIds: ICurrentPartId[] = [];
				querySnapshot.forEach(doc => {
					const data = doc.data() as ICurrentPart;
					const id = doc.id;
					tmpPartIds.push({id: id, part: data});
				});
				this.partIds = tmpPartIds;
			}); */ // OLD
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
		this._route.navigate(['joiningPage']);
	}

	playLocally() {
		this._route.navigate([this.selectedGame + 'Offline']);
	}

	createGame() {
		if (this.canCreateGame()) {
			/* const newPart: ICurrentPart = {
				historic: 'pas implémenté',
				listMoves: [],
				playerZero: this.userName, // TODO: supprimer, il n'y a pas de createur par défaut
				playerOne: '',
				result: 5, // todo : constantiser ça, bordel
				scorePlayerZero: 'pas implémenté',
				scorePlayerOne: 'pas implémenté',
				turn: -1,
				typeGame: this.selectedGame,
				typePart: 'pas implémenté',
				winner: ''
			};
			this.afs.collection('parties')
				.add(newPart)
				.then(docRef => {
					const newJoiner: IJoiner = {
						candidatesNames: [],
						creator: this.userName,
						chosenPlayer: '',
						timeoutMinimalDuration: 60,
						firstPlayer: '0', // par défaut: le créateur
						partStatus: 0 // en attente de tout, TODO: constantifier ça aussi !
					};
					this.afs.collection('joiners').doc(docRef.id)
						.set(newJoiner);
					this.gameInfoService.changeGame(docRef.id, this.selectedGame);
					this._route.navigate(['joiningPage']);
				}); */ // old
			this.partService.createGame(this.userName, this.selectedGame).then(oncreated => {
				this._route.navigate(['joiningPage']);
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

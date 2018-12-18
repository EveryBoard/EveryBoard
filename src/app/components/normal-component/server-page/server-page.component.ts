import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Router} from '@angular/router';

import {UserDAO} from '../../../dao/UserDAO';

import {IUser, IUserId} from '../../../domain/iuser';
import {ICurrentPart, ICurrentPartId} from '../../../domain/icurrentpart';

import {GameInfoService} from '../../../services/game-info-service';
import {UserService} from '../../../services/user-service';

@Component({
	selector: 'app-server-page',
	templateUrl: './server-page.component.html',
	styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit {

	partIds: ICurrentPartId[];
	activeUserList: IUserId[];
	readonly gameNameList: String[] = ['P4', 'Awale', 'Quarto'];
	selectedGame: string;
	userName: string;

	constructor(private userDAO: UserDAO,
				private afs: AngularFirestore,
				private _route: Router,
				private gameInfoService: GameInfoService,
				private userService: UserService) {}

	ngOnInit() {
		this.userService.currentUsername.subscribe(message =>
			this.userName = message);
		this.afs.collection('parties').ref
			.where('result', '==', 5) // TODO : afs se fait appeler par les DAO !
			.onSnapshot( (querySnapshot) => {
				const tmpPartIds: ICurrentPartId[] = [];
				querySnapshot.forEach(doc => {
					const data = doc.data() as ICurrentPart;
					const id = doc.id;
					tmpPartIds.push({id: id, part: data});
				});
				this.partIds = tmpPartIds;
			});

		this.userDAO.observeAllActiveUser()
			.onSnapshot((querySnapshot) => {
				const tmpActiveUserIds: IUserId[] = [];
				querySnapshot.forEach( doc => {
					const data = doc.data() as IUser;
					const id = doc.id;
					tmpActiveUserIds.push({id: id, user: data});
				});
				this.activeUserList = tmpActiveUserIds;
			});
	}

	joinGame(partId: string, typeGame: string) {
		const partRef = this.afs.doc('parties/' + partId).ref;
		const joinerRef = this.afs.doc('joiners/' + partId).ref;
		partRef.get()
			.then(partDoc => {
				const creator = partDoc.get('playerZero');
				joinerRef.get()
					.then(joinerDoc => {
						const joinerList: string[] = joinerDoc.get('names');
						if (!joinerList.includes(this.userName) &&
							(this.userName !== creator)) {
							joinerList[joinerList.length] = this.userName;
							joinerRef.update({'names': joinerList});
						}
					});
			});
		this.gameInfoService.changeGame(partId, typeGame);
		this._route.navigate(['joiningPage']);
	}

	playLocally() {
		this._route.navigate([this.selectedGame + 'Offline']);
	}

	createGame() {
		if (this.canCreateGame()) {
			this.afs.collection('parties')
				.add({
					'historic': 'pas implémenté',
					'listMoves': [],
					'playerZero': this.userName,
					'playerOne': '',
					'result': 5, // todo : constantiser ça, bordel
					'scorePlayerZero': 'pas implémenté',
					'scorePlayerOne': 'pas implémenté',
					'turn': -1,
					'typeGame': this.selectedGame,
					'typePart': 'pas implémenté',
					'winner': ''
				})
				.then((docRef) => {
					this.afs.collection('joiners')
						.doc(docRef.id)
						.set({'names': []});
					this.gameInfoService.changeGame(docRef.id, this.selectedGame);
					this._route.navigate(['joiningPage']);
				});
		}
	}

	canCreateGame(): boolean {
		let i = 0;
		let found = false; // todo : faire en stream pour le sexe
		let playerZero: string;
		let playerOne: string;
		while (	(i < this.partIds.length) &&
		(!found)) {
			playerZero = this.partIds[i].part.playerZero;
			playerOne = this.partIds[i++].part.playerOne;
			found = (this.userName === playerZero) || (this.userName === playerOne);
		}
		return !found;
	}

}

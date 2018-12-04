import {Component, OnInit} from '@angular/core';
import {IUser, IUserId} from '../../../domain/iuser';
import {ICurrentPart, ICurrentPartId} from '../../../domain/icurrentpart';

import {Observable} from 'rxjs';
import {AngularFirestore} from 'angularfire2/firestore';
import {filter, map} from 'rxjs/operators';

import {Router} from '@angular/router';
import {GameInfoService} from '../../../services/game-info-service';
import {UserNameService} from '../../../services/user-name-service';

@Component({
	selector: 'app-server-page',
	templateUrl: './server-page.component.html',
	styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit {

	partIds: ICurrentPartId[];
	// observedPartIds: Observable<ICurrentPartId[]>;
	activeUserList: IUserId[];
	readonly gameNameList: String[] = ['P4', 'Awale'];
	selectedGame: string;
	userName: string;

	constructor(private afs: AngularFirestore,
				private _route: Router,
				private gameInfoService: GameInfoService,
				private userNameService: UserNameService) {
		const u1: IUser = {
			code: '1234',
			pseudo: 'roger',
			email: 'who care',
			inscriptionDate: new Date(),
			lastActionTime: new Date(),
			status: 0,
		};
		const u2: IUser = {
			code: 'root',
			pseudo: 'beniuiui',
			email: 'lol@mdr.com',
			inscriptionDate: new Date(),
			lastActionTime: new Date(),
			status: 0,
		};
		console.log('server page component constructor');
	}

	ngOnInit() {
		this.userNameService.currentMessage.subscribe(message =>
			this.userName = message);
		/* this.observedPartIds = this.afs.collection('parties')
			.snapshotChanges().pipe(
				map(actions => {
					return actions.map(a => {
						const data = a.payload.doc.data() as ICurrentPart;
						const id = a.payload.doc.id;
						return {'id': id, 'part': data};
					});
				})); */
		this.afs.collection('parties').ref
			.where('result', '==', 5)
			.onSnapshot( (querySnapshot) => {
				const tmpPartIds: ICurrentPartId[] = [];
				querySnapshot.forEach(doc => {
					const data = doc.data() as ICurrentPart;
					const id = doc.id;
					tmpPartIds.push({id: id, part: data});
				});
				this.partIds = tmpPartIds;
			});
		this.afs.collection('joueurs').ref
			.where('lastActionTime', '>=', Date.now() - (1000 * 60 * 10))
			.onSnapshot((querySnapshot) => {
				const tmpActiveUserIds: IUserId[] = [];
				querySnapshot.forEach( doc => {
					const data = doc.data() as IUser;
					const id = doc.id;
					tmpActiveUserIds.push({id: id, user: data});
				});
				this.activeUserList = tmpActiveUserIds;
			});
		console.log('server page component ON INIT');
	}

	joinGame(info: string) {
		console.log('server page choose this part info : [' + info + ']');
		const separator = info.indexOf(':');
		const id = info.substring(0, separator);
		const docRef = this.afs.doc('joiners/' + id).ref;
		docRef.get()
			.then(doc => {
				const joinerList: string[] = doc.get('names');
				joinerList[joinerList.length] = this.userName;
				docRef.update({'names': joinerList});
			});
		this.gameInfoService.changeMessage(info);
		this._route.navigate(['joiningPage']);
	}

	playLocally() {
		this._route.navigate([this.selectedGame + 'Offline']);
	}

	createGame() {
		console.log('want to create a ' + this.selectedGame);
		if (this.canCreateGame()) {
			this.afs.collection('parties')
				.add({
					'beginning': 'pas implémenté',
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
					this.gameInfoService.changeMessage(docRef.id + ':' + this.selectedGame);
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

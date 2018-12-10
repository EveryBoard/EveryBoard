import {Component, OnInit} from '@angular/core';
import {P4Rules} from '../../../games/games.p4/P4Rules';
import {MoveX} from '../../../jscaip/MoveX';

import {AngularFirestore, AngularFirestoreDocument, DocumentReference} from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ICurrentPart} from '../../../domain/icurrentpart';

import {GameInfoService} from '../../../services/game-info-service';
import {UserService} from '../../../services/user-service';
import {P4PartSlice} from '../../../games/games.p4/P4PartSlice';
import {Router} from '@angular/router';
import {HeaderComponent} from '../../normal-component/header/header.component';
import {IUser, IUserId} from '../../../domain/iuser';
import {UserDAO} from '../../../dao/UserDAO';

@Component({
	selector: 'app-p4-online',
	templateUrl: './p4-online.component.html',
	styleUrls: ['./p4-online.component.css']
})
export class P4OnlineComponent implements OnInit {

	rules = new P4Rules();
	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[];
	board: Array<Array<number>>;

	imagesLocation = 'gaviall/pantheonsgame/assets/images/';

	imagesNames: string[] = ['empty_circle.svg', 'yellow_circle.svg.png', 'brown_circle.svg.png'];

	observedPart: Observable<ICurrentPart>;
	partDocument: AngularFirestoreDocument<ICurrentPart>;

	partId: string;
	userName: string;
	currentPlayer: string;
	turn = 0;
	endGame = false;
	winner: string;
	opponent: IUserId;
	allowedTimeoutVictory = false;

	constructor(private afs: AngularFirestore,
				private gameInfoService: GameInfoService,
				private _route: Router,
				private userService: UserService,
				private userDao: UserDAO) {
	}

	ngOnInit() {
		// totally adaptable to other Rules
		// MNode.ruler = this.rules;

		// should be some kind of session-scope
		this.gameInfoService.currentPartId.subscribe(partId =>
			this.partId = partId);
		this.userService.currentUsername.subscribe(message =>
			this.userName = message);

		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();

		this.observedPart = this.afs.collection('parties').doc(this.partId).snapshotChanges()
			.pipe(map(actions => {
				return actions.payload.data() as ICurrentPart;
			}));

		this.observedPart.subscribe(updatedICurrentPart =>
			this.onCurrentPartUpdate(updatedICurrentPart));

		this.partDocument = this.afs.doc('parties/' + this.partId);
	}

	onCurrentPartUpdate(updatedICurrentPart: ICurrentPart) {
		if (this.players == null) {
			this.setPlayersDatas(updatedICurrentPart);
		}
		if (this.isFinished(updatedICurrentPart.result)) {
			this.endGame = true;
			this.winner = updatedICurrentPart.winner;
		}
		const listMoves = updatedICurrentPart.listMoves;
		this.turn = updatedICurrentPart.turn;

		const nbPlayedMoves = listMoves.length;
		let currentPartTurn;
		while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
			currentPartTurn = this.rules.node.gamePartSlice.turn;
			const bol: boolean = this.rules.choose(MoveX.get(listMoves[currentPartTurn]));
		}
		this.updateBoard();
	}

	setPlayersDatas(updatedICurrentPart: ICurrentPart) {
		this.players = [
			updatedICurrentPart.playerZero,
			updatedICurrentPart.playerOne];
		this.observerRole = 2;
		let opponentName = '';
		if (this.players[0] === this.userName) {
			this.observerRole = 0;
			opponentName = this.players[1];
		} else if (this.players[1] === this.userName) {
			this.observerRole = 1;
			opponentName = this.players[0];
		}
		if (opponentName !== '') {
			this.userDao.getUserDocRefByUserName(opponentName)
				.onSnapshot((querySnapshot) => {
					let opponent: IUserId;
					querySnapshot.forEach(doc => {
						const data = doc.data() as IUser;
						const id = doc.id;
						opponent = {id: id, user: data};
					});
					this.opponent = opponent;
					this.startWatchingForOpponentTimeout();
				});
		}
	}

	startWatchingForOpponentTimeout() {
		if (this.hasTimedOut(this.opponent)) {
			this.allowTimeoutVictory();
		} else {
			this.forbidTimeoutVictory();
		}
		setTimeout( () => this.startWatchingForOpponentTimeout(),
			HeaderComponent.refreshingPresenceTimeout);
	}

	hasTimedOut(opponent: IUserId) {
		const timeOutDuree = 30 * 1000;
		console.log('lastActionTime of your opponant : ' + opponent.user.lastActionTime);
		const mtn: number = Date.now();
		console.log('delta/1000 : ' + ((mtn - opponent.user.lastActionTime) / 1000));
		return (opponent.user.lastActionTime + timeOutDuree < Date.now());
	}

	notifyTimeout() {
		const victoriousPlayer = this.userName;
		this.endGame = true;
		this.winner = victoriousPlayer;
		const docRef = this.partDocument.ref;
		docRef.update({
			winner: victoriousPlayer,
			result: 4
		});
	}

	allowTimeoutVictory() {
		this.allowedTimeoutVictory = true;
	}

	forbidTimeoutVictory() {
		this.allowedTimeoutVictory = false;
	}

	isFinished(result: number) {
		// fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
		return ((result === 3) || (result === 1) || (result === 4));
	}

	backToServer() {
		this._route.navigate(['server']);
	}

	resign() {
		const victoriousPlayer = this.players[(this.observerRole + 1) % 2];
		const docRef: DocumentReference = this.partDocument.ref;
		docRef.update({
			winner: victoriousPlayer,
			result: 1
		}); // resign
	}

	updateBoard() {
		const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
		this.board = p4PartSlice.getCopiedBoard();
		this.turn = p4PartSlice.turn;
		this.currentPlayer = this.players[p4PartSlice.turn % 2];
	}

	choose(event: MouseEvent): boolean {
		if (this.isPlayerTurn()) {
			const x: number = Number(event.srcElement.id.substring(2, 3));
			console.log('vous tentez un mouvement en colonne ' + x);

			if (this.rules.node.isEndGame()) {
				console.log('Malheureusement la partie est finie');
				// todo : option de clonage revision commentage
				return false;
			}

			console.log('ça tente bien c\'est votre tour');
			// player's turn
			const choosedMove = MoveX.get(x);
			if (this.rules.choose(choosedMove)) {
				console.log('Et javascript estime que votre mouvement est légal');
				// player make a correct move
				// let's confirm on java-server-side that the move is legal
				this.updateDBBoard(choosedMove);
				if (this.rules.node.isEndGame()) {
					this.notifyVictory();
				}
			} else {
				console.log('Mais c\'est un mouvement illegal');
			}
		} else {
			console.log('Mais c\'est pas ton tour !');
		}
	}

	notifyVictory() {
		const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
		const docRef: DocumentReference = this.partDocument.ref;
		docRef.update({
			'winner': victoriousPlayer,
			'result': 3
		});
	}

	isPlayerTurn() {
		const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
	}

	updateDBBoard(move: MoveX) {
		const docRef = this.partDocument.ref;
		docRef.get()
			.then((doc) => {
				const turn: number = doc.get('turn') + 1;
				const listMoves: number[] = doc.get('listMoves');
				listMoves[listMoves.length] = move.x;
				docRef.update({
					'listMoves': listMoves,
					'turn': turn
				});
			}).catch((error) => {
			console.log(error);
		});
	}

}

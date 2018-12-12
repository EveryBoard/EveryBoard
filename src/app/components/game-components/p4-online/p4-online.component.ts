import {Component, OnInit} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument, DocumentReference, QuerySnapshot} from 'angularfire2/firestore';
import {Router} from '@angular/router';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {UserDAO} from '../../../dao/UserDAO';

import {ICurrentPart} from '../../../domain/icurrentpart';
import {IUser, IUserId} from '../../../domain/iuser';

import {UserService} from '../../../services/user-service';
import {GameInfoService} from '../../../services/game-info-service';

import {HeaderComponent} from '../../normal-component/header/header.component';

import {MoveX} from '../../../jscaip/MoveX';

import {P4Rules} from '../../../games/games.p4/P4Rules';
import {P4PartSlice} from '../../../games/games.p4/P4PartSlice';

@Component({
	selector: 'app-p4-online',
	templateUrl: './p4-online.component.html',
	styleUrls: ['./p4-online.component.css']
})
export class P4OnlineComponent implements OnInit {

	rules = new P4Rules();
	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[] = null ;
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
	opponent: IUserId = null;
	allowedTimeoutVictory = false;

	constructor(private afs: AngularFirestore, private gameInfoService: GameInfoService,
				private _route: Router,        private userService: UserService,
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
		// fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
		if ([1, 3, 4].includes(updatedICurrentPart.result)) {
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
				.onSnapshot(userQuerySnapshot =>
					this.onUserUpdate(userQuerySnapshot));
		}
	}

	onUserUpdate(userQuerySnapshot: QuerySnapshot<any>) {
		userQuerySnapshot.forEach(doc => {
			const data = doc.data() as IUser;
			const id = doc.id;
			if (this.opponent == null) {
				this.opponent = {id: id, user: data};
				this.startWatchingForOpponentTimeout();
			}
			this.opponent = {id: id, user: data};
		});
	}

	startWatchingForOpponentTimeout() {
		if (this.opponentHasTimedOut()) {
			this.allowedTimeoutVictory = true;
		} else {
			this.allowedTimeoutVictory = false;
		}
		setTimeout(() => this.startWatchingForOpponentTimeout(),
			HeaderComponent.refreshingPresenceTimeout);
	}

	opponentHasTimedOut() {
		const timeOutDuree = 30 * 1000;
		console.log('lastActionTime of your opponant : ' + this.opponent.user.lastActionTime);
		return (this.opponent.user.lastActionTime + timeOutDuree < Date.now());
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

	notifyVictory() {
		const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
		this.endGame = true;
		this.winner = victoriousPlayer;
		const docRef = this.partDocument.ref;
		docRef.update({
			'winner': victoriousPlayer,
			'result': 3
		});
	}

	isPlayerTurn() {
		const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
	}

	updateBoard() {
		const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
		this.board = p4PartSlice.getCopiedBoard();
		this.turn = p4PartSlice.turn;
		this.currentPlayer = this.players[p4PartSlice.turn % 2];
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

	choose(event: MouseEvent): boolean {
		if (!this.isPlayerTurn()) {
			console.log('Mais c\'est pas ton tour !');
			return false;
		}
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
	}

}

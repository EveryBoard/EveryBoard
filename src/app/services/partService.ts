import {map} from 'rxjs/operators';
import {AngularFirestore, AngularFirestoreDocument, DocumentReference, QuerySnapshot} from 'angularfire2/firestore';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

import {IUser, IUserId} from '../domain/iuser';
import {ICurrentPart} from '../domain/icurrentpart';

import {Move} from '../jscaip/Move';
import {Rules} from '../jscaip/Rules';
import {GameInfoService} from './game-info-service';
import {UserService} from './user-service';
import {UserDAO} from '../dao/UserDAO';
import {HeaderComponent} from '../components/normal-component/header/header.component';



@Injectable()
export class PartService {
	rules: Rules;

	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[] = null;
	board: Array<Array<number>>;

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

	boardUpdater: () => void;
	moveDecoder: (number) => Move;

	constructor(
		private afs: AngularFirestore, private gameInfoService: GameInfoService,
		private _route: Router, 		private userService: UserService,
		private userDao: UserDAO) {}

	onInit(rules: Rules, boardUpdater: () => void, moveDecoder: (number) => Move) {
		this.rules = rules;
		this.boardUpdater = boardUpdater;
		this.moveDecoder = moveDecoder;

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
			const choosedMove = this.moveDecoder(listMoves[currentPartTurn]);
			const bol: boolean = this.rules.choose(choosedMove);
		}
		this.boardUpdater();
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

}

import {ActivatedRoute, Router} from '@angular/router';

import {AngularFirestoreDocument, DocumentReference, QuerySnapshot} from 'angularfire2/firestore';
import {Observable, Subscription} from 'rxjs';

import {HeaderComponent} from '../normal-component/header/header.component';

import {UserDAO} from '../../dao/UserDAO';
import {PartDAO} from '../../dao/PartDAO';

import {ICurrentPart} from '../../domain/icurrentpart';
import {IUser, IUserId} from '../../domain/iuser';

import {Rules} from '../../jscaip/Rules';
import {Move} from '../../jscaip/Move';

import {UserService} from '../../services/UserService';
import {JoinerService} from '../../services/JoinerService';
import {OnDestroy, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';

export abstract class OnlineGame implements OnInit, OnDestroy {
	rules: Rules;

	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[] = null;
	board: Array<Array<number>>;

	observedPart: Observable<ICurrentPart>;
	partDocument: AngularFirestoreDocument<ICurrentPart>;

	partId: string;
	userName: string;
	gameStarted = false;
	turn = -1;
	endGame = false;
	winner = '';
	opponent: IUserId = null;
	currentPlayer: string;
	allowedTimeoutVictory = false;
	timeout = 60;

	protected userSubscription: Subscription;
	protected observedPartSubscription: Subscription;
	protected opponentSubscription: () => void;

	constructor(
		private _route: Router,
		private actRoute: ActivatedRoute,
		private userService: UserService,
		private userDao: UserDAO,
		private partDao: PartDAO,
		private joinerService: JoinerService,
		private partService: GameService) {} // TODO un component n'appelle pas un DAO !!

	ngOnInit() {
		console.log('OnlineGame ngOnInit');
		this.partId = this.actRoute.snapshot.paramMap.get('id');
	}

	startGame() {
		console.log('OnlineGame.startGame !');
		this.gameStarted = true;
		// should be some kind of session-scope
		this.userSubscription =
			this.userService.currentUsernameObservable.subscribe(userName =>
				this.userName = userName); // delivery

		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();

		this.observedPart = this.partDao.getPartObservableById(this.partId);
		this.joinerService.getJoinerByPartId(this.partId)
			.then( iJoiner => {
				this.timeout = iJoiner.timeoutMinimalDuration;
				console.log('le timout est fixé à ' + this.timeout);
			}).catch( fail => console.log('there was a problem trying to get iJoiner timeout'));
		this.observedPartSubscription =
			this.observedPart.subscribe(updatedICurrentPart =>
				this.onCurrentPartUpdate(updatedICurrentPart));

		this.partDocument = this.partDao.getPartAFDocById(this.partId);
	}

	onCurrentPartUpdate(updatedICurrentPart: ICurrentPart) {
		console.log('currentPartUpdate');
		if (this.players == null) {
			this.setPlayersDatas(updatedICurrentPart);
		}

		// fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
		if ([1, 3, 4].includes(updatedICurrentPart.result)) {
			this.endGame = true;
			this.winner = updatedICurrentPart.winner;
		}
		if (updatedICurrentPart.result === 0) { // match nul
			this.endGame = true;
			console.log('match nul means winner = ' + updatedICurrentPart.winner);
			this.winner = null;
		}
		const listMoves = updatedICurrentPart.listMoves;
		this.turn = updatedICurrentPart.turn;

		const nbPlayedMoves = listMoves.length;
		let currentPartTurn;
		// console.log('FIRST : local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : ' + listMoves);
		while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
			currentPartTurn = this.rules.node.gamePartSlice.turn;
			const choosedMove = this.decodeMove(listMoves[currentPartTurn]);
			console.log('local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : '
				+ listMoves + ' choosed move : ' + choosedMove);
			const correctDBMove: boolean = this.rules.choose(choosedMove);
			if (!correctDBMove) {
				console.log('we received an incorrect db move !' + choosedMove + ' and ' + listMoves);
			}
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
			this.opponentSubscription =
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
		if (!this.endGame) {
			// console.log('la partie n\'est pas terminée!');
			setTimeout(() => this.startWatchingForOpponentTimeout(),
				HeaderComponent.refreshingPresenceTimeout);
		} else {
			console.log('La partie est terminée');
		}
	}

	opponentHasTimedOut() {
		console.log('lastActionTime of your opponant : ' + this.opponent.user.lastActionTime);
		return (this.opponent.user.lastActionTime + (this.timeout * 1000) < Date.now());
	}

	backToServer() {
		this._route.navigate(['/server']);
	}

	resign() {
		const victoriousPlayer = this.players[(this.observerRole + 1) % 2];
		const docRef: DocumentReference = this.partDocument.ref;
		docRef.update({
			winner: victoriousPlayer,
			result: 1
		}); // resign
	}

	notifyDraw() {
		console.log('égalité!');
		this.endGame = true;
		const docRef = this.partDocument.ref;
		docRef.update({
			result: 0
		}); // DRAW CONSTANT
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

	updateDBBoard(move: Move) {
		const docRef = this.partDocument.ref;
		docRef.get()
			.then((doc) => {
				const turn: number = doc.get('turn') + 1;
				const listMoves: number[] = doc.get('listMoves');
				listMoves[listMoves.length] = this.encodeMove(move);
				docRef.update({
					'listMoves': listMoves,
					'turn': turn
				});
			})
			.catch(error => console.log(error));
	}

	ngOnDestroy() {
		if (this.userSubscription && this.userSubscription.unsubscribe) {
			this.userSubscription.unsubscribe();
		}
		if (this.observedPartSubscription && this.observedPartSubscription.unsubscribe) {
			this.observedPartSubscription.unsubscribe();
		}
		if (this.opponentSubscription) {
			this.opponentSubscription();
		}
		this.partService.stopObservingPart();
		console.log('OnlineGame.onDestroy');
	}

	abstract updateBoard(): void;

	abstract decodeMove(encodedMove: number): Move;

	abstract encodeMove(move: Move): number;
}

import {Rules} from '../../jscaip/Rules';
import {Move} from '../../jscaip/Move';
import {ICurrentPart} from '../../domain/icurrentpart';
import {AngularFirestoreDocument, DocumentReference, QuerySnapshot} from 'angularfire2/firestore';
import {IUser, IUserId} from '../../domain/iuser';
import {HeaderComponent} from '../normal-component/header/header.component';
import {Observable, Subscription} from 'rxjs';
import {GameInfoService} from '../../services/game-info-service';
import {Router} from '@angular/router';
import {UserService} from '../../services/user-service';
import {UserDAO} from '../../dao/UserDAO';
import {PartDAO} from '../../dao/PartDAO';
import {JoinerService} from '../../services/JoinerService';

export abstract class OnlineGame {
	rules: Rules;

	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[] = null;
	board: Array<Array<number>>;

	observedPart: Observable<ICurrentPart>;
	partDocument: AngularFirestoreDocument<ICurrentPart>;

	partId: string;
	userName: string;
	turn = 0;
	endGame = false;
	winner = '';
	opponent: IUserId = null;
	currentPlayer: string;
	allowedTimeoutVictory = false;
	timeout = 60;

	private gameInfoServiceSubscription: Subscription;
	private userSubscription: Subscription;
	private observedPartSubscription: Subscription;
	private opponentSubscription: () => void;

	constructor(
		private gameInfoService: GameInfoService,
		private _route: Router,
		private userService: UserService,
		private userDao: UserDAO,
		private partDao: PartDAO,
		private joinerService: JoinerService) {} // TODO un component n'appelle pas un DAO !!

	onInit() {
		// should be some kind of session-scope
		this.gameInfoServiceSubscription =
			this.gameInfoService.currentPartId.subscribe(partId =>
				this.partId = partId); // delivery
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

		this.partDocument = this.partDao.getPartDocById(this.partId);

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
		if (updatedICurrentPart.result === 0) { // match nul
			this.endGame = true;
			console.log('match nul means winner = ' + updatedICurrentPart.winner);
			this.winner = null;
		}
		const listMoves = updatedICurrentPart.listMoves;
		this.turn = updatedICurrentPart.turn;

		const nbPlayedMoves = listMoves.length;
		let currentPartTurn;
		while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
			currentPartTurn = this.rules.node.gamePartSlice.turn;
			const choosedMove = this.decodeMove(listMoves[currentPartTurn]);
			const bol: boolean = this.rules.choose(choosedMove);
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
			console.log('la partie n\'est pas terminée!');
			setTimeout(() => this.startWatchingForOpponentTimeout(),
				HeaderComponent.refreshingPresenceTimeout);
		} else {
			console.log('La partie est terminée yeeees');
		}
	}

	opponentHasTimedOut() {
		console.log('lastActionTime of your opponant : ' + this.opponent.user.lastActionTime);
		return (this.opponent.user.lastActionTime + (this.timeout * 1000) < Date.now());
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

	notifyDraw() {
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
			}).catch((error) => {
			console.log(error);
		});
	}

	onDestroy() {
		console.log('désabonnement!!!');
		this.gameInfoServiceSubscription.unsubscribe();
		this.userSubscription.unsubscribe();
		this.observedPartSubscription.unsubscribe();
		this.opponentSubscription();
	}

	abstract updateBoard(): void;

	abstract decodeMove(encodedMove: number): Move;

	abstract encodeMove(move: Move): number;
}

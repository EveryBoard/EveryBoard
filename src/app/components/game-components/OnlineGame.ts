import {ActivatedRoute, Router} from '@angular/router';

import {Observable, Subscription} from 'rxjs';

import {HeaderComponent} from '../normal-component/header/header.component';

import {ICurrentPart, ICurrentPartId} from '../../domain/icurrentpart';
import {IUserId} from '../../domain/iuser';

import {Rules} from '../../jscaip/Rules';
import {Move} from '../../jscaip/Move';

import {UserService} from '../../services/UserService';
import {JoinerService} from '../../services/JoinerService';
import {OnDestroy, OnInit} from '@angular/core';
import {GameService} from '../../services/GameService';
import {ActivesUsersService} from '../../services/ActivesUsersService';

export abstract class OnlineGame implements OnInit, OnDestroy {
	rules: Rules;

	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[] = null;
	board: Array<Array<number>>;

	observedPart: Observable<ICurrentPart>;

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
		private joinerService: JoinerService,
		private gameService: GameService,
		private activesUsersService: ActivesUsersService) {
	}

	ngOnInit() {
		console.log('OnlineGame ngOnInit');
		this.partId = this.actRoute.snapshot.paramMap.get('id');
	}

	startGame() {
		console.log('OnlineGame.startGame !');
		this.gameStarted = true;
		// should be some kind of session-scope
		this.userSubscription =
			this.userService.usernameObs.subscribe(userName => {
				this.userName = userName;

				this.rules.setInitialBoard();
				this.board = this.rules.node.gamePartSlice.getCopiedBoard();

				this.joinerService
					.readJoinerById(this.partId)
					.then(iJoiner => {
						this.timeout = iJoiner.timeoutMinimalDuration;
						console.log('le timout est fixé à ' + this.timeout);

						this.gameService.startObserving(this.partId, iPart =>
							this.onCurrentPartUpdate(iPart));

						/*this.observedPart = this.gameService.getPartObservableById(this.partId);
						this.observedPartSubscription =
							this.observedPart.subscribe(updatedICurrentPart =>
								this.onCurrentPartUpdate(updatedICurrentPart));
					*/

					})
					.catch(fail => console.log('there was a problem trying to get iJoiner timeout'));
			});
	}

	onCurrentPartUpdate(updatedICurrentPart: ICurrentPartId) {
		console.log('currentPartUpdate');
		const part: ICurrentPart = updatedICurrentPart.part;
		if (this.players == null) {
			this.setPlayersDatas(part);
		}

		// fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
		if ([1, 3, 4].includes(part.result)) {
			this.endGame = true;
			this.winner = part.winner;
		}
		if (part.result === 0) { // match nul
			this.endGame = true;
			console.log('match nul means winner = ' + part.winner);
			this.winner = null;
		}
		const listMoves = part.listMoves;
		this.turn = part.turn;

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
				this.userService.REFACTOR_observeUserByPseudo(opponentName,
					callback => {
						console.log('userFound : ' + callback);
						if (this.opponent == null) {
							this.opponent = callback;
							this.startWatchingForOpponentTimeout();
						}
						this.opponent = callback;
					});
		}
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
				this.activesUsersService.refreshingPresenceTimeout);
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
		this.gameService.resign(this.partId, victoriousPlayer);
	}

	notifyDraw() {
		this.endGame = true;
		this.gameService.notifyDraw(this.partId);
	}

	notifyTimeout() {
		const victoriousPlayer = this.userName;
		this.endGame = true;
		this.winner = victoriousPlayer;
		this.gameService.notifyTimeout(this.partId, victoriousPlayer);
	}

	notifyVictory() {
		const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
		this.endGame = true;
		this.winner = victoriousPlayer;
		this.gameService.notifyVictory(this.partId, victoriousPlayer);
	}

	isPlayerTurn() {
		const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
	}

	updateDBBoard(move: Move) {
		const encodedMove: number = this.encodeMove(move);
		this.gameService.updateDBBoard(encodedMove, this.partId);
	}

	ngOnDestroy() {
		if (this.gameStarted === true) {
			console.log('vous quittez un composant d\'une partie : unSub Part');
			if (this.userSubscription && this.userSubscription.unsubscribe) {
				this.userSubscription.unsubscribe();
			}
			if (this.observedPartSubscription && this.observedPartSubscription.unsubscribe) {
				this.observedPartSubscription.unsubscribe();
			}
			if (this.opponentSubscription) {
				this.opponentSubscription();
			}
			this.gameService.stopObservingPart();
		}
		console.log('OnlineGame.onDestroy');
	}

	abstract updateBoard(): void;

	abstract decodeMove(encodedMove: number): Move;

	abstract encodeMove(move: Move): number;
}

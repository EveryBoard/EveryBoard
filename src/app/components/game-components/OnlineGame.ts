import {ActivatedRoute, Router} from '@angular/router';

import {Subscription} from 'rxjs';

import {ICurrentPart, ICurrentPartId} from '../../domain/icurrentpart';
import {IUserId} from '../../domain/iuser';

import {Rules} from '../../jscaip/Rules';
import {Move} from '../../jscaip/Move';

import {UserService} from '../../services/UserService';
import {JoinerService} from '../../services/JoinerService';
import {OnDestroy, OnInit} from '@angular/core';
import {GameService} from '../../services/GameService';
import {MGPRequest} from '../../domain/request';

export abstract class OnlineGame implements OnInit, OnDestroy {
	rules: Rules;

	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)

	currentPart: ICurrentPartId;
	players: string[] = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart
	scores: number[] = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart
	partId: string; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
	turn = -1; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
	winner = ''; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

	maximalMoveDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
	totalPartDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

	board: Array<Array<number>>;
	userName: string;
	gameStarted = false;
	endGame = false;
	opponent: IUserId = null;
	currentPlayer: string;

	canPass: boolean = null;
	rematchProposed: boolean = null;
	opponentProposedRematch: boolean = null;

	maximalMoveDurationForZero: number;
	maximalMoveDurationForOne: number;
	gameBeginningTime: number;
	playerZeroRemainingTime: number;
	playerOneRemainingTime: number;
	isPlayerZeroTurn = false;
	isPlayerOneTurn = false;

	protected userSub: Subscription;
	protected observedPartSubscription: Subscription;
	protected opponentSubscription: () => void;

	constructor(
		private _route: Router,
		private actRoute: ActivatedRoute,
		private userService: UserService,
		private joinerService: JoinerService,
		private gameService: GameService) {
	}

	ngOnInit() {
		this.partId = this.actRoute.snapshot.paramMap.get('id');
		this.userSub = this.userService.userNameObs
			.subscribe(userName => this.userName = userName);
	}

	protected startGame() {
		if (this.gameStarted === true) {
			console.log('!!!OnlineGame.startGame next line is useless)');
		} else {
			console.log('OnlineGame.startGame next line is usefull sparadra)');
		}
		this.gameStarted = true;
		this.startCountdownFor(0);
		// should be some kind of session-scope

		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();

		this.joinerService
			.readJoinerById(this.partId)
			.then(iJoiner => {
				this.maximalMoveDuration = iJoiner.maximalMoveDuration;
				this.totalPartDuration = iJoiner.totalPartDuration;
				this.startCountdownFor(0);
				this.gameService.startObserving(this.partId, iPart => {
					this.onCurrentPartUpdate(iPart);
				});
			})
			.catch(onRejected => {
				console.log('there was a problem trying to get iJoiner timeout because : ');
				console.log(JSON.stringify(onRejected));
			});
	}

	protected onCurrentPartUpdate(updatedICurrentPart: ICurrentPartId) {
		this.currentPart = updatedICurrentPart;
		console.log('part updated: ' + JSON.stringify(updatedICurrentPart));
		const part: ICurrentPart = updatedICurrentPart.part;
		if (this.players == null || this.opponent == null) { // TODO: voir à supprimer ce sparadra
			this.setPlayersDatas(part);
		}
		if (updatedICurrentPart.part.request != null) {
			this.onRequest(updatedICurrentPart.part.request);
		}
		// fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
		if ([0, 1, 3, 4].includes(part.result)) {
			this.endGame = true;
			this.stopCountdowns();
			if (part.result === 0) { // match nul
				console.log('match nul means winner = ' + part.winner);
				this.winner = null;
			} else { // victory
				this.winner = part.winner;
			}
		}
		const listMoves = part.listMoves;
		this.turn = part.turn;

		const nbPlayedMoves = listMoves.length;
		let currentPartTurn;
		// console.log('FIRST : local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : ' + listMoves);
		while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
			currentPartTurn = this.rules.node.gamePartSlice.turn;
			const choosedMove = this.decodeMove(listMoves[currentPartTurn]);
			// console.log('local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : '
			// 	+ listMoves + ' choosed move : ' + choosedMove);
			const correctDBMove: boolean = this.rules.choose(choosedMove);
			if (!correctDBMove) {
				console.log('we received an incorrect db move !' + choosedMove + ' and ' + listMoves);
			}
		}
		this.updateBoard();
		if (!this.endGame) {
			this.startCountdownFor(this.turn % 2 === 0 ? 1 : 0);
		}
	}

	protected onRequest(request: MGPRequest) {
		switch (request.code) {
			case 6: // 0 propose un rematch
				this.rematchProposed = true;
				if (this.observerRole === 1) {
					console.log('ton adversaire te propose une revanche, 1');
					this.opponentProposedRematch = true;
				}
				break;
			case 7: // 1 propose un rematch
				this.rematchProposed = true;
				if (this.observerRole === 0) {
					console.log('ton adversaire te propose une revanche, 0');
					this.opponentProposedRematch = true;
				}
				break;
			case 8: // rematch accepted
				this._route.navigate(['/' + request.gameType + '/' + request.partId]);
				break;
			default:
				alert('there was an error : ' + JSON.stringify(request) + ' has ' + request.code);
				break;
		}
	}

	private startCountdownFor(player: 0|1) {
		this.maximalMoveDurationForZero = this.maximalMoveDuration;
		this.maximalMoveDurationForOne = this.maximalMoveDuration;
		if (player === 0) {
			this.isPlayerZeroTurn = false;
			this.isPlayerOneTurn = true;
		} else {
			this.isPlayerZeroTurn = true;
			this.isPlayerOneTurn = false;
		}
	}

	private stopCountdowns() {
		this.isPlayerZeroTurn = false;
		this.isPlayerOneTurn = false;
	}

	setPlayersDatas(updatedICurrentPart: ICurrentPart) {
		// console.log('OnlineGame set player\'s data!');
		this.players = [
			updatedICurrentPart.playerZero,
			updatedICurrentPart.playerOne];
		this.observerRole = 2;
		this.gameBeginningTime = updatedICurrentPart.beginning;
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
						// console.log('userFound : ' + JSON.stringify(callback));
						// if (this.opponent == null) {
							// this.opponent = callback;
							// OLDLY this.startWatchingIfOpponentRunOutOfTime();
						// }
						this.opponent = callback;
					});
		}
	}

	protected didOpponentRunOutOfTime(): boolean {
		console.log('lastMoveTime of your opponent : ' + this.opponent.user.lastMoveTime);
		return Math.max(this.opponent.user.lastMoveTime, this.gameBeginningTime)
				+ (this.maximalMoveDuration * 1000)
				< Date.now();
	}

	reachedOutOfTime(player: 0|1) {
		if (player === this.observerRole) {
			// the player has run out of time, he'll notify his own defeat by time
			this.notifyTimeoutVictory(this.opponent.user.pseudo);
		} else {
			// the other player has timeout
			if (!this.endGame) {
				this.notifyTimeoutVictory(this.userName);
				this.endGame = true;
			}
		}
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

	notifyTimeoutVictory(victoriousPlayer: string) {
		// const victoriousPlayer = this.userName;
		this.endGame = true;
		this.winner = victoriousPlayer;
		this.gameService.notifyTimeout(this.partId, victoriousPlayer);
	}

	notifyVictory() {
		// const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
		// Previous line is wrong, assume that last player who notice the victory is the victorious, wrong as fuck
		let victoriousPlayer = this.players[0]; // by default
		if (![Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER].includes(this.rules.node.getOwnValue())) {
			alert('how the fuck did you notice victory?');
		}
		if (this.rules.node.getOwnValue() === Number.MAX_SAFE_INTEGER) {
			victoriousPlayer = this.players[1];
		}
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
		this.gameService
			.updateDBBoard(encodedMove, this.partId)
			.then(onFullFilled => {
				this.userService.updateUserActivity(true);
			});
	}

	ngOnDestroy() {
		if (this.gameStarted === true) {
			// console.log('vous quittez un composant d\'une partie : unSub Part');
			if (this.userSub && this.userSub.unsubscribe) {
				this.userSub.unsubscribe();
			}
			if (this.observedPartSubscription && this.observedPartSubscription.unsubscribe) {
				this.observedPartSubscription.unsubscribe();
			}
			if (this.opponentSubscription) {
				this.opponentSubscription();
			}
			this.gameService.stopObservingPart();
		}
		// console.log('OnlineGame.onDestroy');
	}

	pass() {
		alert('TODO, Should not be there, call the coder ! Must be overrid');
	}

	acceptRematch() {
		if (this.observerRole === 0 || this.observerRole === 1) {
			this.gameService.acceptRematch(this.currentPart, iPart => {
				this.onCurrentPartUpdate(iPart);
			});
		}
	}

	proposeRematch() {
		if (this.observerRole === 0 || this.observerRole === 1) {
			this.gameService.proposeRematch(this.currentPart.id, this.observerRole);
		}
	}

	abstract updateBoard(): void;

	abstract decodeMove(encodedMove: number): Move;

	abstract encodeMove(move: Move): number;
}

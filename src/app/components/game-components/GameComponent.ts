import {ActivatedRoute, Router} from '@angular/router';

import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';

import {ICurrentPart, ICurrentPartId, PICurrentPart} from '../../domain/icurrentpart';
import {IUserId} from '../../domain/iuser';

import {Rules} from '../../jscaip/Rules';
import {Move} from '../../jscaip/Move';

import {UserService} from '../../services/UserService';
import {JoinerService} from '../../services/JoinerService';
import {AfterViewInit, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GameService} from '../../services/GameService';
import {MGPRequest} from '../../domain/request';
import {CountDownComponent} from '../normal-component/count-down/count-down.component';
import {MoveX} from '../../jscaip/MoveX';

export abstract class GameComponent implements OnInit, OnDestroy {

	/************************************************ Common fields ************************************************/

	@Input() isOnline = false;
	rules: Rules;
	turn = -1; // TODO: check if on init we can set turn to 0 or -1 depending on "isOnline"
	players: string[] = null;
	board: Array<Array<number>>;

	/************************************************ Online fields ************************************************/

	@ViewChild('chronoZeroGlobal') chronoZeroGlobal: CountDownComponent;
	@ViewChild('chronoOneGlobal') chronoOneGlobal: CountDownComponent;
	@ViewChild('chronoZeroLocal') chronoZeroLocal: CountDownComponent;

	@ViewChild('chronoOneLocal') chronoOneLocal: CountDownComponent;

	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	currentPart: ICurrentPart;
	scores: number[] = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart
	partId: string; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
	winner = ''; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

	maximalMoveDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
	totalPartDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

	userName: string;
	gameStarted = false;
	endGame = false;
	opponent: IUserId = null;
	currentPlayer: string;

	canPass: boolean = null;
	rematchProposed: boolean = null;
	opponentProposedRematch: boolean = null;

	gameBeginningTime: number;

	protected userSub: Subscription;
	protected observedPartSubscription: Subscription;
	protected opponentSubscription: () => void;

	/************************************************ Offline fields ************************************************/

	aiDepth = 5;
	botTimeOut = 500; // this.aiDepth * 500;
	readonly _BOT = 'bot';

	/************************************************ Common methods ************************************************/

	constructor(
		private _route: Router,
		private actRoute: ActivatedRoute,
		private userService: UserService,
		private joinerService: JoinerService,
		private gameService: GameService) {
	}

	ngOnInit() {
		if (this.isOnline === true) {
			this.initOnlineGame();
		} else {
			this.initOfflineGame();
		}
	}

	abstract updateBoard();

	isPlayerTurn() {
		const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
	}

	chooseMove(move: Move): boolean {
		if (this.rules.node.isEndGame()) {
			console.log('Malheureusement la partie est finie');
			// todo : option de clonage revision commentage
			return false;
		}
		if (!this.isPlayerTurn()) {
			console.log('Mais c\'est pas ton tour !');
			return false;
		}
		if (!this.rules.isLegal(move)) {
			console.log('Mouvement illégal');
			return false;
		}
		if (this.isOnline) {
			this.updateDBBoard(move);
		} else {
			this.rules.choose(move);
			this.proposeAIToPlay();
		}
		return true;
	}

	/************************************************ Online methods ************************************************/

	initOnlineGame() {
		console.log('OnlineGame.ngOnInit');
		this.players = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart
		this.scores = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart
		this.turn = -1; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
		this.winner = ''; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

		this.gameStarted = false;
		this.endGame = false;
		this.opponent = null;

		this.canPass = null;
		this.rematchProposed = null;
		this.opponentProposedRematch = null;
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

		// should be some kind of session-scope

		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();

		this.joinerService
			.readJoinerById(this.partId)
			.then(iJoiner => {
				this.maximalMoveDuration = iJoiner.maximalMoveDuration * 1000;
				this.totalPartDuration = iJoiner.totalPartDuration * 1000;
				console.log('og::starting game chrono called once');
				this.startGameChronos(this.totalPartDuration, this.totalPartDuration, 0);
				// TODO: recharger une page dont les deux joueurs étaient partis
				this.gameService.startObserving(this.partId, iPart => {
					this.onCurrentPartUpdate(iPart);
				});
			})
			.catch(onRejected => {
				console.log('there was a problem trying to get iJoiner timeout because : ');
				console.log(JSON.stringify(onRejected));
			});
	}

	protected spotDifferenceBetweenUpdateAndCurrentData(update: ICurrentPart): PICurrentPart {
		const difference: PICurrentPart = {};
		if (update == null || this.currentPart == null) {
			console.log('update : ' + JSON.stringify(update));
			console.log('current: ' + JSON.stringify(this.currentPart));
			return {};
		}
		if (update.typeGame !== this.currentPart.typeGame) {
			difference.typeGame = update.typeGame;
		}
		if (update.playerZero !== this.currentPart.playerZero) {
			difference.playerZero = update.playerZero;
		}
		if (update.turn !== this.currentPart.turn) {
			difference.turn = update.turn;
		}
		if (update.playerOne !== this.currentPart.playerOne) {
			difference.playerOne = update.playerOne;
		}
		if (update.beginning !== this.currentPart.beginning) {
			difference.beginning = update.beginning;
		}
		if (update.result !== this.currentPart.result) {
			difference.result = update.result;
		}
		if (update.listMoves !== this.currentPart.listMoves) {
			difference.listMoves = update.listMoves;
		}
		if (update.request !== this.currentPart.request) {
			difference.request = update.request;
		}
		return difference;
	}

	protected onCurrentPartUpdate(updatedICurrentPart: ICurrentPartId) {
		const part: ICurrentPart = updatedICurrentPart.part;
		console.log('part updated: ' + JSON.stringify(this.spotDifferenceBetweenUpdateAndCurrentData(part)));
		this.currentPart = part;
		if (this.players == null || this.opponent == null) { // TODO: voir à supprimer ce sparadra
			console.log('part update : let\'s set players datas');
			this.setPlayersDatas(part);
		}
		if (part.request != null) {
			this.onRequest(part.request);
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
		let updateIsMove = false;
		// console.log('FIRST : local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : ' + listMoves);
		console.log('update before : ' + this.turn + '==' + part.turn + ', ' + this.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
		while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
			currentPartTurn = this.rules.node.gamePartSlice.turn;
			const choosedMove = this.decodeMove(listMoves[currentPartTurn]);
			// console.log('local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : '
			// 	+ listMoves + ' choosed move : ' + choosedMove);
			const correctDBMove: boolean = this.rules.choose(choosedMove);
			updateIsMove = true;
			if (!correctDBMove) {
				console.log('!!!!!!we received an incorrect db move !' + choosedMove + ' and ' + listMoves);
			}
			// NEWLY :
			if (this.rules.node.isEndGame()) {
				if (this.rules.node.getOwnValue() === 0) {
					this.notifyDraw();
				} else {
					this.notifyVictory();
				}
			}

		}
		this.updateBoard();
		console.log('update make turns be : ' + this.turn + '==' + part.turn + ', ' + this.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
		if ((!this.endGame) && updateIsMove) {
			console.log('cdc::new move + ' + this.turn + '==' + part.turn + ', ' + this.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
			const firstPlayedTurn = 0; // TODO: cette endroit pourrait être appellé à un mouvement qui n'est pas le 0
			// (reprise de partie après double perte de connection...)
			if (this.turn === (firstPlayedTurn + 1)) {
				this.startGameChronos(this.totalPartDuration, this.totalPartDuration, this.turn % 2 === 0 ? 0 : 1);
			} else {
				this.startCountdownFor(this.turn % 2 === 0 ? 0 : 1);
			}
		}
		if (!updateIsMove) {
			console.log('cette update n\'est pas un mouvement ! ');
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
				console.log('Rematch accepted !');
				this._route
					.navigate(['/' + request.typeGame + '/' + request.partId])
					.then(onSuccess => {
						this.ngOnDestroy();
						this.initOnlineGame();
						this.startGame();
					});
				break;
			default:
				alert('there was an error : ' + JSON.stringify(request) + ' has ' + request.code);
				break;
		}
	}

	private startGameChronos(durationZero: number, durationOne: number, player: 0 | 1) {
		if (player === 0) {
			console.log('og:cdc:: first turn of 0');
			this.chronoZeroGlobal.start(durationZero);
			this.chronoZeroLocal.start(this.maximalMoveDuration);
			this.chronoOneGlobal.pause(); // TODO : remove more intelligently
			this.chronoOneLocal.stop(); // that means with ifPreviousMoveHasBeenDone
		} else {
			console.log('og:cdc:: first turn of 1');
			this.chronoOneGlobal.start(durationOne);
			this.chronoOneLocal.start(this.maximalMoveDuration);
			this.chronoZeroGlobal.pause();
			this.chronoZeroLocal.stop();
		}
	}

	private startCountdownFor(player: 0 | 1) {
		console.log('og:cdc:: startCountdownFor ' + player);
		if (player === 0) {
			this.chronoZeroGlobal.resume();
			this.chronoZeroLocal.start(this.maximalMoveDuration);
			this.chronoOneGlobal.pause();
			this.chronoOneLocal.stop();
		} else {
			this.chronoZeroGlobal.pause();
			this.chronoZeroLocal.stop();
			this.chronoOneGlobal.resume();
			this.chronoOneLocal.start(this.maximalMoveDuration);
		}
	}

	private stopCountdowns() {
		console.log('cdc::stop count downs');
		this.chronoZeroGlobal.stop();
		this.chronoZeroLocal.stop();
		this.chronoOneGlobal.stop();
		this.chronoOneLocal.stop();
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

	reachedOutOfTime(player: 0 | 1) {
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

	updateDBBoard(move: Move) {
		const encodedMove: number = this.encodeMove(move);
		this.gameService
			.updateDBBoard(encodedMove, this.partId)
			.then(onFullFilled => {
				this.userService.updateUserActivity(true);
			});
	}

	ngOnDestroy() {
		if (this.userSub && this.userSub.unsubscribe) {
			this.userSub.unsubscribe();
		}
		if (this.gameStarted === true) {
			// console.log('vous quittez un composant d\'une partie : unSub Part');
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
			const partId: ICurrentPartId = {
				part: this.currentPart,
				id: this.partId
			};
			this.gameService.acceptRematch(partId, iPart => {
				this.onCurrentPartUpdate(iPart);
			});
		}
	}

	proposeRematch() {
		if (this.observerRole === 0 || this.observerRole === 1) {
			this.gameService.proposeRematch(this.partId, this.observerRole);
		}
	}

	abstract encodeMove(move: Move): number;

	abstract decodeMove(encodedMove: number): Move;

	/************************************************ Offline methods ************************************************/

	initOfflineGame() {
		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();
		this.players = [this.userName, this.userName];
	}

	proposeAIToPlay() {
		// check if ai's turn has come, if so, make her start after a delay
		const turn = this.rules.node.gamePartSlice.turn % 2;
		if (this.players[turn] === this._BOT) {
			// bot's turn
			setTimeout(() => {
				// called only when it's AI's Turn
				if (!this.rules.node.isEndGame()) {
					const aiMove: Move = this.rules.node.findBestMoveAndSetDepth(this.aiDepth).getMove();
					this.rules.choose(aiMove);
					this.updateBoard();
					this.proposeAIToPlay();
				}
			}, this.botTimeOut);
		}
	}

	switchPlayerAndBot(player: 0 | 1) {
		this.players[player] = this.players[player] === this._BOT ? this.userName : this._BOT;
	}

}

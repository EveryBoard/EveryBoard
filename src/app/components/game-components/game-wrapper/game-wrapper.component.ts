import {Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, OnInit, Type, ViewChild} from '@angular/core';
import {GameIncluderDirective} from '../../../directives/game-includer.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {QuartoComponent} from '../quarto/quarto.component';
import {P4Component} from '../p4/p4.component';
import {ReversiComponent} from '../reversi/reversi.component';
import {TablutComponent} from '../tablut/tablut.component';
import {AwaleRules} from '../../../games/awale/AwaleRules';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {P4NewComponent} from '../p4-new/p4-new.component';
import {Move} from '../../../jscaip/Move';
import {GameService} from '../../../services/GameService';
import {ICurrentPart, ICurrentPartId, PICurrentPart} from '../../../domain/icurrentpart';
import {UserService} from '../../../services/UserService';
import {CountDownComponent} from '../../normal-component/count-down/count-down.component';
import {IUserId} from '../../../domain/iuser';
import {Subscription} from 'rxjs';
import {JoinerService} from '../../../services/JoinerService';
import {MGPRequest} from '../../../domain/request';

@Component({
	selector: 'app-game-wrapper',
	templateUrl: './game-wrapper.component.html'
})
export class GameWrapperComponent implements OnInit {

	// component loading
	@ViewChild(GameIncluderDirective) appGameIncluder: GameIncluderDirective;
	private componentInstance: AbstractGameComponent;

	// GameWrapping's Template
	@ViewChild('chronoZeroGlobal') chronoZeroGlobal: CountDownComponent;
	@ViewChild('chronoOneGlobal') chronoOneGlobal: CountDownComponent;
	@ViewChild('chronoZeroLocal') chronoZeroLocal: CountDownComponent;
	@ViewChild('chronoOneLocal') chronoOneLocal: CountDownComponent;

	// link between GameWrapping's template and remote opponent
	currentPartId: ICurrentPartId;
	players: string[];
	observerRole: number;
	userName = this.userService.getCurrentUser();
	gameStarted = false;
	endGame = false;
	canPass: boolean;
	opponent: IUserId = null;
	currentPlayer: string;

	rematchProposed: boolean = null;
	opponentProposedRematch: boolean = null;

	maximalMoveDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
	totalPartDuration: number; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId

	gameBeginningTime: number;

	protected userSub: Subscription;
	protected observedPartSubscription: Subscription;
	protected opponentSubscription: () => void;

	constructor(private componentFactoryResolver: ComponentFactoryResolver,
				private actRoute: ActivatedRoute,
				private router: Router,
				private gameService: GameService,
				private userService: UserService,
				private joinerService: JoinerService,
				private route: Router) {
	}

	ngOnInit() {
		console.log('le component est initialisé');
		this.currentPartId = {id: this.actRoute.snapshot.paramMap.get('id'), part: null};
		this.userSub = this.userService.userNameObs
			.subscribe(userName => this.userName = userName);
	}

	loadGameComponent() {
		const compoString: string = this.actRoute.snapshot.paramMap.get('compo');
		const component = this.getMatchingComponent(compoString);
		const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(component);
		const componentRef: ComponentRef<any> = this.appGameIncluder.viewContainerRef.createComponent(componentFactory);
		this.componentInstance = <AbstractGameComponent>componentRef.instance;
		this.componentInstance.chooseMove = this.receiveChildData;
		this.canPass = this.componentInstance.canPass;
	}

	getMatchingComponent(compoString: string): Type<AbstractGameComponent> { // TODO figure out the difference with Type<any>
		switch (compoString) {
			case 'P4':
				return P4NewComponent;
			case 'Quarto':
				return QuartoComponent;
			default:
				this.router.navigate(['/error']);
				return null;
		}
	}

	resetGameDatas() {
		console.log('OnlineGame.resetGameDatas');
		this.players = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart

		this.gameStarted = false;
		this.endGame = false;
		this.opponent = null;

		this.canPass = null;
		this.rematchProposed = null;
		this.opponentProposedRematch = null;
		this.currentPartId.id = this.actRoute.snapshot.paramMap.get('id');
		this.userSub = this.userService.userNameObs
			.subscribe(userName => this.userName = userName);
	}

	protected startGame() {
		console.log('start game !');
		if (this.gameStarted === true) {
			console.log('!!!OnlineGame.startGame next line is useless)');
		} else {
			console.log('OnlineGame.startGame next line is usefull sparadra)');
		}
		this.gameStarted = true;
		this.loadGameComponent();
		this.resetGameDatas();
		// should be some kind of session-scope

		this.componentInstance.rules.setInitialBoard();
		this.componentInstance.board = this.componentInstance.rules.node.gamePartSlice.getCopiedBoard();

		this.joinerService
			.readJoinerById(this.currentPartId.id)
			.then(iJoiner => {
				this.maximalMoveDuration = iJoiner.maximalMoveDuration * 1000;
				this.totalPartDuration = iJoiner.totalPartDuration * 1000;
				console.log('og::starting game chrono called once');
				this.startGameChronos(this.totalPartDuration, this.totalPartDuration, 0);
				// TODO: recharger une page dont les deux joueurs étaient partis
				this.gameService.startObserving(this.currentPartId.id, iPart => {
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
		if (update == null || this.currentPartId == null) {
			console.log('update : ' + JSON.stringify(update));
			console.log('current: ' + JSON.stringify(this.currentPartId));
			return {};
		}
		if (update.typeGame !== this.currentPartId.part.typeGame) {
			difference.typeGame = update.typeGame;
		}
		if (update.playerZero !== this.currentPartId.part.playerZero) {
			difference.playerZero = update.playerZero;
		}
		if (update.turn !== this.currentPartId.part.turn) {
			difference.turn = update.turn;
		}
		if (update.playerOne !== this.currentPartId.part.playerOne) {
			difference.playerOne = update.playerOne;
		}
		if (update.beginning !== this.currentPartId.part.beginning) {
			difference.beginning = update.beginning;
		}
		if (update.result !== this.currentPartId.part.result) {
			difference.result = update.result;
		}
		if (update.listMoves !== this.currentPartId.part.listMoves) {
			difference.listMoves = update.listMoves;
		}
		if (update.request !== this.currentPartId.part.request) {
			difference.request = update.request;
		}
		return difference;
	}

	protected onCurrentPartUpdate(updatedICurrentPart: ICurrentPartId) {
		const part: ICurrentPart = updatedICurrentPart.part;
		console.log('part updated: ' + JSON.stringify(this.spotDifferenceBetweenUpdateAndCurrentData(part)));
		this.currentPartId.part = part;
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
				// this.winner = null;
			// } else { // victory
			// 	this.winner = part.winner;
			}
		}
		const listMoves = part.listMoves;
		// this.turn = part.turn;

		const nbPlayedMoves = listMoves.length;
		let currentPartTurn;
		let updateIsMove = false;
		// console.log('FIRST : local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : ' + listMoves);
		// console.log('update before : ' + this.turn + '==' + part.turn + ', ' + this.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
		console.log('update before : turn = ' + part.turn + ', ' + this.componentInstance.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
		while (this.componentInstance.rules.node.gamePartSlice.turn < nbPlayedMoves) {
			currentPartTurn = this.componentInstance.rules.node.gamePartSlice.turn;
			const choosedMove = this.componentInstance.decodeMove(listMoves[currentPartTurn]);
			// console.log('local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : '
			// 	+ listMoves + ' choosed move : ' + choosedMove);
			const correctDBMove: boolean = this.componentInstance.rules.choose(choosedMove);
			updateIsMove = true;
			if (!correctDBMove) {
				console.log('!!!!!!we received an incorrect db move !' + choosedMove + ' and ' + listMoves);
			}
			// NEWLY :
			if (this.componentInstance.rules.node.isEndGame()) {
				if (this.componentInstance.rules.node.getOwnValue() === 0) {
					this.notifyDraw();
				} else {
					this.notifyVictory();
				}
			}

		}
		this.componentInstance.updateBoard();
		console.log('update makes turn = ' + part.turn + ', ' + this.componentInstance.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
		if ((!this.endGame) && updateIsMove) {
			console.log('cdc::new move turn:' + part.turn + ', ' + this.componentInstance.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
			const firstPlayedTurn = 0; // TODO: cette endroit pourrait être appellé à un mouvement qui n'est pas le 0
			// (reprise de partie après double perte de connection...)
			if (part.turn === (firstPlayedTurn + 1)) {
				this.startGameChronos(this.totalPartDuration, this.totalPartDuration, part.turn % 2 === 0 ? 0 : 1);
			} else {
				this.startCountdownFor(part.turn % 2 === 0 ? 0 : 1);
			}
		}
		if (!updateIsMove) {
			console.log('cette update n\'est pas un mouvement ! ');
		}
	}

	notifyDraw() {
		this.endGame = true;
		this.gameService.notifyDraw(this.currentPartId.id);
	}

	notifyTimeoutVictory(victoriousPlayer: string) {
		// const victoriousPlayer = this.userName;
		this.endGame = true;
		this.currentPartId.part.winner = victoriousPlayer; // oldly in this.winner var
		this.gameService.notifyTimeout(this.currentPartId.id, victoriousPlayer);
	}

	notifyVictory() {
		// const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
		// Previous line is wrong, assume that last player who notice the victory is the victorious, wrong as fuck
		let victoriousPlayer = this.players[0]; // by default
		if (![Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER].includes(this.componentInstance.rules.node.getOwnValue())) {
			alert('how the fuck did you notice victory?');
		}
		if (this.componentInstance.rules.node.getOwnValue() === Number.MAX_SAFE_INTEGER) {
			victoriousPlayer = this.players[1];
		}
		this.endGame = true;
		this.currentPartId.part.winner = victoriousPlayer; // oldly in this.winner var
		this.gameService.notifyVictory(this.currentPartId.id, victoriousPlayer);
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
				this.route
					.navigate(['/' + request.typeGame + '/' + request.partId])
					.then(onSuccess => {
						this.onOnlineGameDestroy();
						this.resetGameDatas();
						this.startGame();
					});
				break;
			default:
				alert('there was an error : ' + JSON.stringify(request) + ' has ' + request.code);
				break;
		}
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

	// callChild() {
	// 	this.componentInstance.applyExternalMove(null);
	// 	console.log('I mave my son do a null move ! BIG LAUGH, HE PRBBLY BUGGED');
	// }

	receiveChildData = (move: Move): boolean => {
		console.log('as a dad, me voici au courant ! (' + move + '), for I am : ');
		console.log(this);
		if (!this.componentInstance.rules.isLegal(move)) {
			return false;
		}
		if (!this.isPlayerTurn()) {
			return false;
		}
		this.updateDBBoard(move);
	}

	updateDBBoard(move: Move) {
		const encodedMove: number = this.componentInstance.encodeMove(move);
		this.gameService
			.updateDBBoard(encodedMove, this.currentPartId.id)
			.then(onFullFilled => {
				this.userService.updateUserActivity(true);
			});
	}

	resign() {
		const victoriousPlayer = this.players[(this.observerRole + 1) % 2];
		this.gameService.resign(this.currentPartId.id, victoriousPlayer);
	}

	isPlayerTurn() {
		const indexPlayer = this.componentInstance.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
	}

	onOnlineGameDestroy() {
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

	pass() {
		alert('TODO, Should not be there, call the coder ! Must be overrid');
	}

	acceptRematch() {
		if (this.observerRole === 0 || this.observerRole === 1) {
			this.gameService.acceptRematch(this.currentPartId, iPart => {
				this.onCurrentPartUpdate(iPart);
			});
		}
	}

	proposeRematch() {
		if (this.observerRole === 0 || this.observerRole === 1) {
			this.gameService.proposeRematch(this.currentPartId.id, this.observerRole);
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
		console.log('og:cdc:: startCountdownFor ' + player );
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

}

import {
	Component,
	ComponentFactory,
	ComponentFactoryResolver,
	ComponentRef, OnDestroy,
	OnInit,
	Type,
	ViewChild
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {QuartoComponent} from '../quarto/quarto.component';
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
import {GameIncluderComponent} from '../game-includer/game-includer.component';
import {TablutComponent} from '../tablut/tablut.component';

@Component({
	selector: 'app-game-wrapper',
	templateUrl: './game-wrapper.component.html',
	styleUrls: ['./game-wrapper.component.css']
})
export class GameWrapperComponent implements OnInit, OnDestroy {

	static VERBOSE = true;

	// component loading
	@ViewChild(GameIncluderComponent) gameCompo: GameIncluderComponent;
	private componentInstance: AbstractGameComponent;

	// GameWrapping's Template
	@ViewChild('chronoZeroGlobal') chronoZeroGlobal: CountDownComponent;
	@ViewChild('chronoOneGlobal') chronoOneGlobal: CountDownComponent;
	@ViewChild('chronoZeroLocal') chronoZeroLocal: CountDownComponent;
	@ViewChild('chronoOneLocal') chronoOneLocal: CountDownComponent;

	// link between GameWrapping's template and remote opponent
	currentPart: ICurrentPart;
	currentPartId: string;
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
		if (GameWrapperComponent.VERBOSE) {
			console.log('le component est initialisé');
		}
		this.currentPartId = this.actRoute.snapshot.paramMap.get('id');
		this.userSub = this.userService.userNameObs
			.subscribe(userName => this.userName = userName);
	}

	getMatchingComponent(compoString: string): Type<AbstractGameComponent> { // TODO figure out the difference with Type<any>
		switch (compoString) {
			case 'P4':
				return P4NewComponent;
			case 'Quarto':
				return QuartoComponent;
			// case 'Tablut':
			// 	return TablutComponent;
			default:
				this.router.navigate(['/error']);
				return null;
		}
	}

	resetGameDatas() {
		if (GameWrapperComponent.VERBOSE) {
			console.log('OnlineGame.resetGameDatas');
		}
		this.players = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart

		this.gameStarted = false;
		this.endGame = false;
		this.opponent = null;

		this.canPass = null;
		this.rematchProposed = null;
		this.opponentProposedRematch = null;
		this.currentPartId = this.actRoute.snapshot.paramMap.get('id');
		this.userSub = this.userService.userNameObs
			.subscribe(userName => this.userName = userName);
	}

	protected startGame() {
		if (GameWrapperComponent.VERBOSE) {
			if (this.gameStarted === true) {
				console.log('!!!GameWrapper.startGame next line is NOT usefull)');
			} else {
				console.log('GameWrapper.startGame next line is USEFULL sparadra)');
			}
		}
		this.gameStarted = true;
		setTimeout(() => {
			// the small waiting is there to make sur that the chronos are charged
			this.afterGameComponentViewProbablyInit();
		}, 1);

		this.readJoiner(); // NEWLY

	}

	protected afterGameComponentViewProbablyInit() {
		if (GameWrapperComponent.VERBOSE) {
			console.log('GameWrapper.afterGameComponentViewProbablyInit');
		}
		this.loadGameComponent();
		// this.resetGameDatas();
		// should be some kind of session-scope

		this.launchGame();

	}

	protected launchGame() {
		this.componentInstance.rules.setInitialBoard();
		this.componentInstance.board = this.componentInstance.rules.node.gamePartSlice.getCopiedBoard();

		// this.readJoiner(); // OLDLY, didnt work anyway

	}

	protected readJoiner() {
		this.joinerService
			.readJoinerById(this.currentPartId)
			.then(iJoiner => {
				this.maximalMoveDuration = iJoiner.maximalMoveDuration * 1000;
				this.totalPartDuration = iJoiner.totalPartDuration * 1000;
				console.log('Starting game chrono called once');
				this.startGameChronos(this.totalPartDuration, this.totalPartDuration, 0);
				// TODO: recharger une page dont les deux joueurs étaient partis
				this.gameService.startObserving(this.currentPartId, iPart => {
					this.onCurrentPartUpdate(iPart);
				});
			})
			.catch(onRejected => {
				console.log('there was a problem trying to get iJoiner timeout because : ');
				console.log(onRejected);
			});
	}

	protected loadGameComponent() {
		if (GameWrapperComponent.VERBOSE) {
			console.log('Loading now game component');
			console.log('gameCompo: ', this.gameCompo);
		}
		const compoString: string = this.actRoute.snapshot.paramMap.get('compo');
		const component = this.getMatchingComponent(compoString);
		const componentFactory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(component);
		const componentRef: ComponentRef<any> = this.gameCompo.viewContainerRef.createComponent(componentFactory);
		// const componentRef: ComponentRef<any> = this.viewContainerRef.createComponent(componentFactory);
		this.componentInstance = <AbstractGameComponent>componentRef.instance;
		this.componentInstance.chooseMove = this.receiveChildData; // so that when the game component do a move
		// the game wrapper can then act accordingly to the chosen move.
		this.canPass = this.componentInstance.canPass;
	}

	protected spotDifferenceBetweenUpdateAndCurrentData(update: ICurrentPart): PICurrentPart {
		const difference: PICurrentPart = {};
		if (update == null || this.currentPart == null) {
			if (GameWrapperComponent.VERBOSE) {
				console.log('update : ' + JSON.stringify(update));
				console.log('current: ' + JSON.stringify(this.currentPartId));
			}
			return {};
		}
		if (update.typeGame		!== this.currentPart.typeGame) {
			difference.typeGame = update.typeGame;
		}
		if (update.playerZero	!== this.currentPart.playerZero) {
			difference.playerZero = update.playerZero;
		}
		if (update.turn			!== this.currentPart.turn) {
			difference.turn = update.turn;
		}
		if (update.playerOne	!== this.currentPart.playerOne) {
			if (GameWrapperComponent.VERBOSE) {
				console.log('playerOne changed from "' + this.currentPart.playerOne + '" to "' + update.playerOne + '"');
			}
			difference.playerOne = update.playerOne;
		}
		if (update.beginning	!== this.currentPart.beginning) {
			if (GameWrapperComponent.VERBOSE) {
				console.log('beginning changed from "' + this.currentPart.beginning + '" to "' + update.beginning + '"');
			}
			difference.beginning = update.beginning;
		}
		if (update.result		!== this.currentPart.result) {
			difference.result = update.result;
		}
		if (update.listMoves	!== this.currentPart.listMoves) {
			difference.listMoves = update.listMoves;
		}
		if (update.request		!== this.currentPart.request) {
			difference.request = update.request;
		}
		return difference;
	}

	protected onCurrentPartUpdate(updatedICurrentPart: ICurrentPartId) {
		const part: ICurrentPart = updatedICurrentPart.part;
		if (GameWrapperComponent.VERBOSE) {
			console.log('part updated !');
			console.log(JSON.stringify(this.spotDifferenceBetweenUpdateAndCurrentData(part)));
		}
		this.currentPart = part;
		if (this.players == null || this.opponent == null) { // TODO: voir à supprimer ce sparadra
			if (GameWrapperComponent.VERBOSE) {
				console.log('part update : let\'s set players datas');
			}
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
				if (GameWrapperComponent.VERBOSE) {
					console.log('match nul means winner = ' + part.winner);
				}
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
		if (GameWrapperComponent.VERBOSE) {
			// console.log('FIRST : local rules turn : ' + this.rules.node.gamePartSlice.turn + ' list moves : ' + listMoves);
			// console.log('update before : ' + this.turn + '==' + part.turn + ', ' + this.rules.node.gamePartSlice.turn + '==' + nbPlayedMoves);
			// console.log('update before : turn = ' + part.turn + ', ' + this.componentInstance.rules.node.
			// 		gamePartSlice.turn + '==' + nbPlayedMoves);
			console.log('Before = part.turn = ' + part.turn);
			console.log('Before = this.turn = ' + 'is abandonned');
			console.log('Before = this...gamePartSlice.turn = ' + this.componentInstance.rules.node.gamePartSlice.turn);
			console.log('Before = nbPlayedMoves = ' + nbPlayedMoves);
		}
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
		if (GameWrapperComponent.VERBOSE) {
			console.log('After = part.turn = ' + part.turn);
			console.log('After = this.turn = ' + 'is abandonned');
			console.log('After = this...gamePartSlice.turn = ' + this.componentInstance.rules.node.gamePartSlice.turn);
			console.log('After = nbPlayedMoves = ' + nbPlayedMoves);
		}
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
			if (GameWrapperComponent.VERBOSE) {
				console.log('cette update n\'est pas un mouvement ! ');
			}
		}
	}

	notifyDraw() {
		this.endGame = true;
		this.gameService.notifyDraw(this.currentPartId);
	}

	notifyTimeoutVictory(victoriousPlayer: string) {
		// const victoriousPlayer = this.userName;
		this.endGame = true;
		this.currentPart.winner = victoriousPlayer; // oldly in this.winner var
		this.gameService.notifyTimeout(this.currentPartId, victoriousPlayer);
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
		this.currentPart.winner = victoriousPlayer; // oldly in this.winner var
		this.gameService.notifyVictory(this.currentPartId, victoriousPlayer);
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
		if (GameWrapperComponent.VERBOSE) {
			console.log('GameWrapper.setPlayersDatas(' + JSON.stringify(updatedICurrentPart) + ')');
		}
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

	receiveChildData = (move: Move): boolean => {
		if (!this.componentInstance.rules.isLegal(move)) {
			console.log('move illegal');
			return false;
		}
		if (!this.isPlayerTurn()) {
			console.log('not your turn');
			return false;
		}
		console.log('board about to update');
		this.updateDBBoard(move);
	}

	updateDBBoard(move: Move) {
		if (GameWrapperComponent.VERBOSE) {
			console.log('let\'s update db board');
		}
		const encodedMove: number = this.componentInstance.encodeMove(move);
		this.gameService
			.updateDBBoard(encodedMove, this.currentPartId)
			.then(onFullFilled => {
				this.userService.updateUserActivity(true);
			});
	}

	resign() {
		const victoriousPlayer = this.players[(this.observerRole + 1) % 2];
		this.gameService.resign(this.currentPartId, victoriousPlayer);
	}

	isPlayerTurn() {
		const indexPlayer = this.componentInstance.rules.node.gamePartSlice.turn % 2;
		if (GameWrapperComponent.VERBOSE) {
			console.log(this.players, ' : ', this.userName);
		}
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
			const currentPartId: ICurrentPartId = {
				id: this.currentPartId,
				part: this.currentPart
			};
			this.gameService.acceptRematch(currentPartId, iPart => {
				this.onCurrentPartUpdate(iPart);
			});
		}
	}

	proposeRematch() {
		if (this.observerRole === 0 || this.observerRole === 1) {
			this.gameService.proposeRematch(this.currentPartId, this.observerRole);
		}
	}

	private startGameChronos(durationZero: number, durationOne: number, player: 0 | 1) {
		if (GameWrapperComponent.VERBOSE) {
			console.log('og:cdc:: first turn of ' + player);
		}
		if (player === 0) {
			this.chronoZeroGlobal.start(durationZero);
			this.chronoZeroLocal.start(this.maximalMoveDuration);
			this.chronoOneGlobal.pause(); // TODO : remove more intelligently
			this.chronoOneLocal.stop(); // that means with ifPreviousMoveHasBeenDone
		} else {
			this.chronoOneGlobal.start(durationOne);
			this.chronoOneLocal.start(this.maximalMoveDuration);
			this.chronoZeroGlobal.pause();
			this.chronoZeroLocal.stop();
		}
	}

	private startCountdownFor(player: 0 | 1) {
		if (GameWrapperComponent.VERBOSE) {
			console.log('og:cdc:: startCountdownFor ' + player);
		}
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
		if (GameWrapperComponent.VERBOSE) {
			console.log('cdc::stop count downs');
		}
		this.chronoZeroGlobal.stop();
		this.chronoZeroLocal.stop();
		this.chronoOneGlobal.stop();
		this.chronoOneLocal.stop();
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

}

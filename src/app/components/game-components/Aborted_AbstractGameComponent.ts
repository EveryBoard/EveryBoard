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

export abstract class Aborted_AbstractGameComponent implements OnInit {

	/************************************************ Common fields ************************************************/

	@Input() isOnline: boolean;
	@Input() userName: string;
	updateDBBoard: (move: Move) => void; // setted by the wrapper, kind of EventEmiter hack

	rules: Rules;
	turn = -1; // TODO: check if on init we can set turn to 0 or -1 depending on "isOnline"
	board: Array<Array<number>>;
	players: string[] = null;

	/************************************************ Online fields ************************************************/

	gameStarted = false;
	endGame = false;

	canPass: boolean = null;

	/************************************************ Offline fields ************************************************/

	aiDepth = 5;
	botTimeOut = 500; // this.aiDepth * 500;
	readonly _BOT = 'bot';

	/************************************************ Common methods ************************************************/

	constructor() {}

	ngOnInit() {
		if (this.isOnline === true) {
			this.initOnlineGame();
		} else {
			this.initOfflineGame();
		}
	}

	initOnlineGame() {
		// console.log('OnlineGame.ngOnInit');
		this.players = null; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPart
		this.turn = -1; // TODO: rendre inutile, remplacé par l'instance d'ICurrentPartId
		this.gameStarted = false;
		this.endGame = false;
		this.canPass = null;
	}

	initOfflineGame() {
		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();
		this.players = [this.userName, this.userName];
	}

	abstract updateBoard();

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

	isPlayerTurn() {
		const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
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
	}

	pass() {
		alert('TODO, Should not be there, call the coder ! Must be overrid');
	}

	abstract encodeMove(move: Move): number;

	abstract decodeMove(encodedMove: number): Move;

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

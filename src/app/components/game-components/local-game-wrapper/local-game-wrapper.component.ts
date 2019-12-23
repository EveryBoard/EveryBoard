import {Component, ComponentFactoryResolver, OnInit} from '@angular/core';
import {GameWrapper} from '../GameWrapper';
import {Move} from '../../../jscaip/Move';
import {ActivatedRoute, Router} from '@angular/router';
import {GameService} from '../../../services/GameService';
import {UserService} from '../../../services/UserService';
import {JoinerService} from '../../../services/JoinerService';

@Component({
	selector: 'app-local-game-wrapper',
	templateUrl: './local-game-wrapper.component.html',
	styleUrls: ['./local-game-wrapper.component.css']
})
export class LocalGameWrapperComponent extends GameWrapper implements OnInit {

	static VERBOSE = false;

	aiDepth = 3;
	botTimeOut = 2000; // this.aiDepth * 500;

	constructor(componentFactoryResolver: ComponentFactoryResolver,
				actRoute: ActivatedRoute,
				router: Router,
				userService: UserService) {
		super(componentFactoryResolver, actRoute, router, userService);
	}

	ngOnInit() {
		this.players = [this.userService.getCurrentUser(), this.userService.getCurrentUser()];
		this.afterGameComponentViewProbablyInit();
	}

	onValidUserMove(move: Move): void {
		if (LocalGameWrapperComponent.VERBOSE) {
			console.log('LocalGameWrapperComponent.onValidUserMove');
		}
		this.componentInstance.rules.choose(move);
		this.componentInstance.updateBoard();
		this.proposeAIToPlay();
	}

	proposeAIToPlay() {
		// check if ai's turn has come, if so, make her start after a delay
		const turn = this.componentInstance.rules.node.gamePartSlice.turn % 2;
		if (this.players[turn] === 'bot') {
			// bot's turn
			setTimeout(() => {
				// called only when it's AI's Turn
				if (!this.componentInstance.rules.node.isEndGame()) {
					const aiMove: Move = this.componentInstance.rules.node.findBestMoveAndSetDepth(this.aiDepth).getMove();
					this.componentInstance.rules.choose(aiMove);
					this.componentInstance.updateBoard();
					this.proposeAIToPlay();
				}
			}, this.botTimeOut);
		}
	}

	switchPlayerOne() { // totally adaptable to other Rules
		this.switchPlayer(0);
	}

	switchPlayerTwo() { // totally adaptable to other Rules
		this.switchPlayer(1);
	}

	switchPlayer(n: 0|1) {
		this.players[n] = this.players[n] === 'bot' ? this.userService.getCurrentUser() : 'bot';
		this.proposeAIToPlay();
	}

	get compo() {
		return this.componentInstance;
	}
}

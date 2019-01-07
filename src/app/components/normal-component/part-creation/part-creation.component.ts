import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import {IJoiner, IJoinerId} from '../../../domain/ijoiner';

import {UserService} from '../../../services/UserService';
import {GameService} from '../../../services/game.service';

@Component({
	selector: 'app-part-creation',
	templateUrl: './part-creation.component.html',
	styleUrls: ['./part-creation.component.css']
})
export class PartCreationComponent implements OnInit, OnDestroy {

	@Input() partId: string;
	@Output() gameStartNotification: EventEmitter<void> = new EventEmitter<void>();

	currentJoiner: IJoiner = null;

	userName: string;

	userIsCreator: boolean;
	userIsChosenPlayer: boolean;
	acceptingDisabled = true;
	proposingDisabled = true;
	proposalSent = false;

	// Game Configuration Values
	timeout = 60;
	firstPlayer = '0';

	// Subscription
	private userSub: Subscription;
	private partSub: Subscription;
	private joinerSub: Subscription;

	constructor(private _route: Router,
				private userService: UserService,
				private partService: GameService) {
	}

	ngOnInit() {
		console.log('PartCreationComponent ngOnInit');
		this.userSub = this.userService.currentUsernameObservable.subscribe(userName => {
			console.log('user name received : ' + userName);
			this.userName = userName;
			if (userName !== '') {
				console.log('part id received by mother-component: ' + this.partId);
				if (this.partId !== '') {
					console.log('joining COMPO initialisation start observing part ' + this.partId);
					this.partService.startObservingPart(this.partId); // // TODO : SUPERFLU  ???
					this.joinerSub = this.partService.getJoinerIdObservable().subscribe(
						iJoiner => this.onCurrentJoinerUpdate(iJoiner));
				} else {
					console.log('we did not receive partId error');
					this._route.navigate(['/server']);
				}
			} else {
				console.log('we did not receive userName error');
				this._route.navigate(['/server']);
			}
		});
	}

	ngOnDestroy() {
		if (this.userSub && this.userSub.unsubscribe) {
			this.userSub.unsubscribe();
		}
		if (this.partSub && this.partSub.unsubscribe) {
			this.partSub.unsubscribe();
		}
		if (this.joinerSub && this.joinerSub.unsubscribe) {
			this.joinerSub.unsubscribe();
		}
		console.log('PartCreation ngOnDestroy : subscriptions cancelled');
	}

	private onCurrentJoinerUpdate(iJoinerId: IJoinerId) {
		if (this.isGameCanceled(iJoinerId)) {
			console.log('LAST UPDATE : the game is cancelled');
			return this.onGameCancelling();
		}
		if (this.isGameStarted(iJoinerId)) {
			console.log('the game has started');
			return this.onGameStarted();
		}
		console.log('game update');
		// here game is nor cancelled nor started, no reason to redirect anything
		this.updateJoiner(iJoinerId);
	}

	private isGameCanceled(iJoinerId: IJoinerId) {
		return (iJoinerId == null) || (iJoinerId.joiner == null);
	}

	private onGameCancelling() {
		this.partService.stopObservingPart();
		this._route.navigate(['/server']);
	}

	private isGameStarted(iJoinerId: IJoinerId) {
		return iJoinerId && iJoinerId.joiner && (iJoinerId.joiner.partStatus === 3);
	}

	private onGameStarted() {
		this.gameStartNotification.emit();
		// this.ngOnDestroy();
	}

	private updateJoiner(iJoinerId: IJoinerId) {
		this.userIsCreator = (this.userName === iJoinerId.joiner.creator);
		this.userIsChosenPlayer = (this.userName === iJoinerId.joiner.chosenPlayer);
		if (this.userIsCreator) {
			this.proposalSent = iJoinerId.joiner.partStatus > 1;
			this.proposingDisabled = (iJoinerId.joiner.partStatus !== 1);
		} else {
			this.timeout = iJoinerId.joiner.timeoutMinimalDuration;
			this.firstPlayer = iJoinerId.joiner.firstPlayer;
			this.acceptingDisabled = (iJoinerId.joiner.partStatus !== 2);
		}
		this.currentJoiner = iJoinerId.joiner;
	}

	cancelGameCreation() {
		// callable only by the creator
		this.joinerSub.unsubscribe();
		this.partService.cancelGame().then(onCancel =>
			this._route.navigate(['/server']));
	}

	cancelGameJoining() {
		this.partService.removePlayerFromJoiningPage(this.userName);
		this.partService.stopObservingPart(); // NEW HERE TODO : mettre dans removePlayerFromJoiningPage
		this._route.navigate(['/server']);
	}

	setChosenPlayer(pseudo: string) {
		this.partService.setChosenPlayer(pseudo);
	}

	proposeConfig() {
		// called by the creator

		// send the proposal to opponent
		// status become 2 (waiting joiner confirmation)
		this.partService.proposeConfig(this.timeout, this.firstPlayer);
	}

	acceptConfig() {
		// called by the joiner

		// trigger the beginning redirection that will be called on every subscribed user
		// status become 3 (game started)
		this.partService.acceptConfig(this.currentJoiner);
	}

}

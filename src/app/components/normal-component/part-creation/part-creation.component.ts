import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import {IJoiner, IJoinerId} from '../../../domain/ijoiner';

import {UserService} from '../../../services/UserService';
import {GameService} from '../../../services/GameService';
import {JoinerService} from '../../../services/JoinerService';

@Component({
	selector: 'app-part-creation',
	templateUrl: './part-creation.component.html',
	styleUrls: ['./part-creation.component.css']
})
export class PartCreationComponent implements OnInit, OnDestroy {

	@Input() partId: string;
	@Output() gameStartNotification = new EventEmitter<void>();

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

	constructor(private _route: Router,
				private userService: UserService,
				private gameService: GameService,
				private joinerService: JoinerService) {
	}

	ngOnInit() {
		this.userSub = this.userService.usernameObs.subscribe(userName => {
			this.userName = userName;
			if (userName !== '') {
				if (this.partId !== '') {
					console.log('PartCreationComponent ngOnInit correctly starting (' + userName + ', ' + this.partId + ')');
					this.joinerService
						.joinGame(this.partId, this.userName)
						.then(onFullFilled =>
							this.joinerService.startObserving(this.partId, iJoiner =>
								this.onCurrentJoinerUpdate(iJoiner)))
						.catch(onRejected => {
							console.log('!!!PartCreationComponent joining game FAILED because : ');
							console.log(onRejected);
							this._route.navigate(['/server']);
						});
				} else {
					console.log('PartCreationComponent we did not receive partId error');
					this._route.navigate(['/server']);
				}
			} else {
				console.log('PartCreationComponent we did not receive userName error');
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
		if (!this.userIsCreator) {
			console.log('vous quittez le channel ' + this.userName);
			this.joinerService
				.cancelJoining(this.userName)
				.then(onFullFilled => console.log('you left the channel'))
				.catch(onRejected => { console.log('cancelJoining failed'); console.log(onRejected); });
		}
		this.joinerService.stopObserving();
		console.log('PartCreation ngOnDestroy : subscriptions cancelled');
	}

	private onCurrentJoinerUpdate(iJoinerId: IJoinerId) {
		if (this.isGameCanceled(iJoinerId)) {
			console.log('LAST UPDATE : the game is cancelled');
			return this.onGameCancelled();
		}
		if (this.isGameStarted(iJoinerId)) {
			console.log('the game has started');
			return this.onGameStarted();
		}
		console.log('joiner updated');
		// here game is nor cancelled nor started, no reason to redirect anything
		this.updateJoiner(iJoinerId);
	}

	private isGameCanceled(iJoinerId: IJoinerId) {
		return (iJoinerId == null) || (iJoinerId.joiner == null);
	}

	private onGameCancelled() {
		this._route.navigate(['/server']);
	}

	private isGameStarted(iJoinerId: IJoinerId) {
		return iJoinerId && iJoinerId.joiner && (iJoinerId.joiner.partStatus === 3);
	}

	private onGameStarted() {
		this.gameStartNotification.emit();
	}

	private updateJoiner(iJoinerId: IJoinerId) {
		// Update the form depending on which state we're on now
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
		this.gameService
			.deletePart(this.partId)
			.then(then => {
				console.log('part suppressed');
				this.joinerService
					.deleteJoiner()
					.then( onFullFilled => {
						console.log('joiner and part suppressed !');
						this._route.navigate(['/server']);
					})
					.catch(onRejected => {
						console.log('joiner could not be cancelled');
						this._route.navigate(['/server']);
					});
			})
			.catch(fail => {
				console.log('delete part failed');
				this._route.navigate(['/server']);
			});
	}

	oldcancelGame() {
		// callable only by the creator
		this.joinerService
			.deleteJoiner()
			.then(then => {
				console.log('joiner suppressed');
				this.gameService
					.deletePart(this.partId)
					.then( onFullFilled => {
						console.log('part suppressed');
						this._route.navigate(['/server']);
					})
					.catch(onRejected => {
						console.log('part could not be cancelled');
						this._route.navigate(['/server']);
					});
			})
			.catch(fail => {
				console.log('delete joiner failed');
				this._route.navigate(['/server']);
			});
	}

	cancelGameJoining() {
		this._route.navigate(['/server']);
	}

	setChosenPlayer(pseudo: string): Promise<void> {
		return this.joinerService.setChosenPlayer(pseudo);
	}

	proposeConfig(): Promise<void> {
		// called by the creator

		// send the proposal to opponent
		// status become 2 (waiting joiner confirmation)
		return this.joinerService.proposeConfig(this.timeout, this.firstPlayer);
	}

	acceptConfig(): Promise<void> {
		// called by the joiner

		// trigger the beginning redirection that will be called on every subscribed user
		// status become 3 (game started)
		return this.gameService.acceptConfig(this.currentJoiner);
	}

}

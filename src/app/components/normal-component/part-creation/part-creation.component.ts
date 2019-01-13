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
	/* PageCreationComponent are always child components of OnlineGames component (one to one)
	 * they need common data so mother calculate/retrieve then share them with her child
	 */

	@Input() partId: string;
	@Input() userName: string;

	@Output() gameStartNotification = new EventEmitter<void>();
	gameStarted = false; // notify that the game has started, a thing evaluated with the joiner doc game status

	currentJoiner: IJoiner = null;

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
		// console.log('PartCreation Component Initializing...');
		if (this.userName === '') { // TODO: ces vérifications doivent être faite par le composant mère, et une seule fois ??
			console.log('PartCreationComponent we did not receive userName error');
			this._route.navigate(['/server']);
		} else if (this.partId === '') {
			console.log('PartCreationComponent we did not receive partId error');
			this._route.navigate(['/server']);
		} else {
			// console.log('PartCreationComponent ngOnInit correctly starting (' + this.userName + ', ' + this.partId + ')');
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
		}
		// console.log('PartCreation Component Initialized!');
	}

	ngOnDestroy() {
		if (this.userSub && this.userSub.unsubscribe) {
			this.userSub.unsubscribe();
		}
		if (this.partSub && this.partSub.unsubscribe) {
			this.partSub.unsubscribe();
		}
		if (this.gameStarted) {
			this.joinerService.stopObserving();
		} else {
			if (this.userIsCreator) {
				console.log('you leave, creator');
				this.cancelGameCreation().then(onFullFilled =>
					this.joinerService.stopObserving());
			} else {
				console.log('vous quittez le channel ' + this.userName);
				this.joinerService
					.cancelJoining(this.userName)
					.then(onFullFilled => {
						this.joinerService.stopObserving();
						console.log('you left the channel, joiner');
					})
					.catch(onRejected => {
						console.log('cancelJoining failed');
						console.log(onRejected);
					});
			}
		}
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
		this.gameStarted = true;
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

	private cancelGameCreation(): Promise<void> {
		// callable only by the creator
		return new Promise((resolve, reject) => {
			this.gameService
				.deletePart(this.partId)
				.then(then => {
					console.log('part suppressed');
					this.joinerService
						.deleteJoiner()
						.then(onFullFilled => {
							console.log('joiner and part suppressed !');
							resolve(onFullFilled);
						})
						.catch(onRejected => {
							console.log('joiner could not be cancelled');
							reject(onRejected);
						});
				})
				.catch(fail => {
					console.log('delete part failed');
					reject(fail);
				});
		});
	}

	cancelAndLeave() {
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
		// console.log('let\'s accept config of ' + this.partId);
		// console.log('GameService observing : ');
		return this.gameService.acceptConfig(this.currentJoiner);
	}

}

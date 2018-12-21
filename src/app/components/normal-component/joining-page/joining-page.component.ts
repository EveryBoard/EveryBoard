import {Component, OnDestroy, OnInit} from '@angular/core';

import {GameInfoService} from '../../../services/game-info-service';
import {IJoiner, IJoinerId} from '../../../domain/ijoiner';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {PartService} from '../../../services/PartService';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-joining-page',
	templateUrl: './joining-page.component.html',
	styleUrls: ['./joining-page.component.css']
})
export class JoiningPageComponent implements OnInit, OnDestroy {

	currentJoiner: IJoiner = null;
	partId: string;
	gameName: string;
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
	private gameNameSub: Subscription;
	private userSub: Subscription;
	private partSub: Subscription;
	private joinerSub: Subscription;

	constructor(private _route: Router,
				private gameInfoService: GameInfoService,
				private userService: UserService,
				private partService: PartService) {
	}

	ngOnInit() {
		this.gameNameSub = this.gameInfoService.currentGameName.subscribe(gameName => {
			console.log('game name received : ' + gameName);
			this.gameName = gameName;
			if (gameName !== '') {
				this.userSub = this.userService.currentUsernameObservable.subscribe(userName => {
					console.log('user name received : ' + userName);
					this.userName = userName;
					if (userName !== '') {
						this.partSub = this.gameInfoService.currentPartId.subscribe(partId => {
							console.log('part id received : ' + partId);
							this.partId = partId;
							if (partId !== '') {
								console.log('joining page initialisation start observing part ' + partId);
								this.partService.startObservingPart(partId);
								this.joinerSub = this.partService.getJoinerIdObservable().subscribe(
									iJoiner => this.onCurrentJoinerUpdate(iJoiner));
							} else {
								console.log('we did not receive userName error');
								this._route.navigate(['server']);
							}
						});
					} else {
						console.log('we did not receive userName error');
						this._route.navigate(['server']);
					}
				});
			} else {
				console.log('we did not receive gameName error');
				this._route.navigate(['server']);
			}
		});
	}

	ngOnDestroy() {
		this.gameNameSub.unsubscribe();
		this.userSub.unsubscribe();
		this.partSub.unsubscribe();
		this.joinerSub.unsubscribe();
		console.log('subscriptions cancelled');
	}

	private onCurrentJoinerUpdateOld(iJoinerId: IJoinerId) {
		const randomNum = Date.now() % (100 * 1000);
		if ((iJoinerId == null) || (iJoinerId.joiner == null)) {
			// on reçoit un iJoinerId null
			console.log('LAST update : currentJoiner (' + ((iJoinerId == null) ? 'null' : iJoinerId.id) + ') has been deleted : ' + randomNum);
			this.partService.stopObservingPart();
			this._route.navigate(['server']);
			return;
		}
		if (this.currentJoiner == null) {
			console.log('FIRST update of currentJoiner (' + ((iJoinerId == null) ? 'null' : iJoinerId.id) + ') ' + randomNum);
			this.currentJoiner = iJoinerId.joiner;
			this.userIsCreator = (this.userName === iJoinerId.joiner.creator);
			this.userIsChosenPlayer = (this.userName === iJoinerId.joiner.chosenPlayer);
			if (iJoinerId.joiner.partStatus === 3) {
				console.log('vous cette partie avait déjà commencé!');
				this._route.navigate([this.gameName + 'Online']);
			}
			return; // first received
		}
		console.log('UPDATE : currentJoiner (' + ((iJoinerId == null) ? 'null' : iJoinerId.id) + ') ' + randomNum);
		if (this.userIsCreator) {
			// the aim is to make proposing part enabled only on part status 1 (waiting for creator to propose game terms)
			this.proposalSent = iJoinerId.joiner.partStatus > 1;
			this.proposingDisabled = (iJoinerId.joiner.partStatus !== 1);
		} else {
			if (iJoinerId.joiner.chosenPlayer !== this.currentJoiner.chosenPlayer) {
				this.userIsChosenPlayer = (this.userName === iJoinerId.joiner.chosenPlayer);
			}
			this.timeout = iJoinerId.joiner.timeoutMinimalDuration;
			this.firstPlayer = iJoinerId.joiner.firstPlayer;
			if (this.userIsChosenPlayer) {
				this.acceptingDisabled = (iJoinerId.joiner.partStatus !== 2);
			}
		}
		if ((iJoinerId.joiner.partStatus === 3) && (this.currentJoiner.partStatus !== 3)) {
			console.log('the part is now started by an update !');
			// the game JUST started
			this.partService.startGameWithConfig(iJoinerId.joiner).then(
				onFullFilled => this._route.navigate([this.gameName + 'Online']));
		}
		this.currentJoiner = iJoinerId.joiner;
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
		this._route.navigate(['server']);
	}

	private isGameStarted(iJoinerId: IJoinerId) {
		return iJoinerId && iJoinerId.joiner && (iJoinerId.joiner.partStatus === 3);
	}

	private onGameStarted() {
		this._route.navigate(['server']);
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
		this.partService.cancelGame().then( onCancel =>
			this._route.navigate(['server']));
	}

	cancelGameJoining() {
		this.partService.removePlayerFromJoiningPage(this.userName);
		this.partService.stopObservingPart(); // NEW HERE TODO : mettre dans removePlayerFromJoiningPage
		this._route.navigate(['server']);
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
		this.partService.acceptConfig();
	}

}

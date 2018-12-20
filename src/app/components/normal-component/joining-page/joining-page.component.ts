import {Component, OnInit} from '@angular/core';

import {GameInfoService} from '../../../services/game-info-service';
import {IJoiner} from '../../../domain/ijoiner';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {JoinerService} from '../../../services/JoinerService';
import {PartService} from '../../../services/PartService';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-joining-page',
	templateUrl: './joining-page.component.html',
	styleUrls: ['./joining-page.component.css']
})
export class JoiningPageComponent implements OnInit {

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
	private joinerSub: Subscription;

	constructor(private _route: Router,
				private gameInfoService: GameInfoService,
				private userService: UserService,
				private joinerService: JoinerService,
				private partService: PartService) {
	}

	ngOnInit() {
		this.gameInfoService.currentGameName.subscribe(gameName => {
			this.gameName = gameName;

			this.userService.currentUsername.subscribe(userName => {
				this.userName = userName;

				this.gameInfoService.currentPartId.subscribe(partId => {
					this.partId = partId;

					this.joinerSub = this.joinerService.getJoinerObservable(partId).subscribe(
						iJoiner => this.onCurrentJoinerUpdate(iJoiner));
				});
			});
		});
	}

	onCurrentJoinerUpdate(iJoiner: IJoiner) {
		if (iJoiner == null) {
			console.log('WHAT THE FUBRUUUUU');
		}

		if (this.currentJoiner == null) {
			this.currentJoiner = iJoiner;
			this.userIsCreator = (this.userName === iJoiner.creator);
			this.userIsChosenPlayer = (this.userName === iJoiner.chosenPlayer);
			return; // first received
		}
		if (iJoiner.chosenPlayer !== this.currentJoiner.chosenPlayer) {
			this.userIsChosenPlayer = (this.userName === iJoiner.chosenPlayer);
		}
		if (this.userIsCreator) {
			// the aim is to make proposing part enabled only on part status 1 (waiting for creator to propose game terms)
			this.proposalSent = iJoiner.partStatus > 1;
			this.proposingDisabled = (iJoiner.partStatus !== 1);
		} else {
			this.timeout = iJoiner.timeoutMinimalDuration;
			this.firstPlayer = iJoiner.firstPlayer;
			if (this.userIsChosenPlayer) {
				this.acceptingDisabled = (iJoiner.partStatus !== 2);
			}
		}
		if (iJoiner.partStatus === 3) {
			// the game can start
			this.partService.startGameWithConfig(iJoiner)
				.then(onFullFilled =>
					this._route.navigate([this.gameName + 'Online']));
		}
		this.currentJoiner = iJoiner;
	}

	cancelGameCreation() {
		// callable only by the creator
		this.joinerSub.unsubscribe();
		this.partService.cancelGame();
		this.joinerService.cancelGame(); // TODO ne communiquer qu'avec un CreationPartService
		this._route.navigate(['server']);
	}

	cancelGameJoining() {
		this.joinerService.removePlayerFromJoiningPage(this.userName);
		this._route.navigate(['server']);
	}

	changeChosenPlayer(pseudo: string) {
		this.joinerService.setChosenPlayer(pseudo);
	}

	proposeConfig() {
		// called by the creator

		// send the proposal to opponent
		// status become 2 (waiting joiner confirmation)
		this.joinerService.proposeConfig(this.timeout, this.firstPlayer);
	}

	acceptConfig() {
		// called by the joiner

		// trigger the beginning redirection that will be called on every subscribed user
		// status become 3 (game started)
		this.joinerService.acceptConfig();
	}

}

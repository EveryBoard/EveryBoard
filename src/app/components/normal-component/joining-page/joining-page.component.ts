import {Component, OnInit} from '@angular/core';
import {GameInfoService} from '../../../services/game-info-service';
import {IJoiner} from '../../../domain/ijoiner';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {JoinerService} from '../../../services/JoinerService';
import {PartService} from '../../../services/PartService';

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

	creator: boolean;
	chosenPlayer: boolean;

	// Game Configuration Values
	timeout = 60;

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

					this.joinerService.getJoinerObservable(partId).subscribe(
						iJoiner => this.onCurrentJoinerUpdate(iJoiner));
				});
			});
		});
	}

	onCurrentJoinerUpdate(iJoiner: IJoiner) {
		if (this.currentJoiner == null) {
			this.currentJoiner = iJoiner;
			this.creator = (iJoiner.creator === this.userName);
			this.chosenPlayer = (this.userName === iJoiner.chosenPlayer);
			return; // first received
		}
		if (iJoiner.chosenPlayer !== this.currentJoiner.chosenPlayer) {
			this.onChosenPlayerChange();
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
		this.partService.cancelGame();
		this.joinerService.deleteJoinerDoc(); // TODO ne communiquer qu'avec un CreationPartService
		this._route.navigate(['server']);
	}

	cancelGameJoining() {
		this.joinerService.removePlayerFromJoinerList(this.userName);
		this._route.navigate(['server']);
	}

	changeChosenPlayer(pseudo: string) {
		this.joinerService.changeChosenPlayer(pseudo).then(
			onfullfilled => this.chosenPlayer = (this.userName === pseudo));
	}

	onChosenPlayerChange() {
		// function called whenever the game creator selected an [other] opponent to play against

		// if joiner :
		// 		acceptConfig disabled
		// if creator :
		// 		proposeConfig enabled
	}

	acceptConfig() {
		// called by the joiner

		// status become 3 (game started)
		this.joinerService.acceptConfig();

		// afterword the beginning redirection will be called on every subscribed user
	}

	proposeConfig() {
		// disable everything
		// send the proposal to opponent
	}

}

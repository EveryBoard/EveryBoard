import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/UserService';
import {Router} from '@angular/router';
import {ActivesUsersService} from '../../../services/ActivesUsersService';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

	userName: string;
	turn = 0;
	isPlayerZeroTurn = false;
	isPlayerOneTurn = false;

	constructor(private _route: Router,
				private userService: UserService,
				private activesUsersService: ActivesUsersService) {
	}

	ngOnInit() {
		this.userService.userNameObs.subscribe(message => {
			this.userName = message;
			if (message !== '') {
				this.startUserPresenceNotification();
			}
		});
		this.startCountdownFor(0);
	}

	startUserPresenceNotification() {
		setTimeout(() => {
			this.userService.updateUserActivity(false);
			this.startUserPresenceNotification();
		}, this.activesUsersService.refreshingPresenceTimeout);
	}

	backToServer() {
		this._route.navigate(['/server']);
	}

	private startCountdownFor(player: 0|1) {
		if (player === 0) {
			this.turn = 1;
			this.isPlayerZeroTurn = false;
			this.isPlayerOneTurn = true;
		} else {
			this.turn = 0;
			this.isPlayerZeroTurn = true;
			this.isPlayerOneTurn = false;
		}
	}

	reachedOutOfTime(player: 0|1) {
		alert(player + ' won');
		this.stopCountdowns();
	}

	private stopCountdowns() {
		this.isPlayerZeroTurn = false;
		this.isPlayerOneTurn = false;
	}

	move() {
		this.startCountdownFor(this.turn === 0 ? 0 : 1);
	}
}

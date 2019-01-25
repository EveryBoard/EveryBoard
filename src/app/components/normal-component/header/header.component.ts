import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/UserService';
import {Router} from '@angular/router';
import {ActivesUsersService} from '../../../services/ActivesUsersService';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

	userName: string;

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

}

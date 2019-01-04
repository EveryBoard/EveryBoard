import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/UserService';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
	static refreshingPresenceTimeout = 60 * 1000;

	userName: string;

	constructor(private _route: Router,
				private userService: UserService) {
	}

	ngOnInit() {
		this.userService.currentUsernameObservable.subscribe(message => {
			this.userName = message;
			if (message !== '') {
				this.startUserPresenceNotification();
			}
		});
	}

	startUserPresenceNotification() {
		setTimeout(() => {
			this.userService.updateUserActivity();
			this.startUserPresenceNotification();
		}, HeaderComponent.refreshingPresenceTimeout);
	}

	backToServer() {
		this._route.navigate(['/server']);
	}
}

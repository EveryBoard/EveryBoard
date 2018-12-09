import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/user-service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

	userName: string;

	constructor(private userService: UserService) {
	}

	ngOnInit() {
		this.userService.currentUsername.subscribe(message => {
			this.userName = message;
			if (message !== '') {
				this.startUserPresenceNotification();
			}
		});
	}

	startUserPresenceNotification() {
		setTimeout(() => {
			console.log('inside the timeout!');
			this.userService.updateUserActivity();
			this.startUserPresenceNotification();
		}, 1000 * 15);
	}
}

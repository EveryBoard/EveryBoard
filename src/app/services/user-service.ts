import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserDAO} from '../dao/UserDAO';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	// TODO : token en sessionStorage, voir martiastrid
	private userName = new BehaviorSubject('');
	private userDocId = new BehaviorSubject('');

	currentUsername = this.userName.asObservable();
	currentUserDocId = this.userDocId.asObservable();

	constructor(private userDAO: UserDAO) {
	}

	changeUser(username: string, userDocId: string) {
		this.userName.next(username);
		this.userDocId.next(userDocId);
	}

	updateUserActivity() {
		const currentUserDocId = this.userDocId.getValue();
		if (currentUserDocId === '') {
			return;
		}
		this.userDAO.updateUserDocuActivity(currentUserDocId);
	}
}

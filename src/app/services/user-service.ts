import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserDAO} from '../dao/UserDAO';
import {IUser, IUserId} from '../domain/iuser';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	// TODO : token en sessionStorage, voir martiastrid
	private userName = new BehaviorSubject('');
	private userDocId = new BehaviorSubject('');
	private activeUsers = new BehaviorSubject<IUserId[]>([]);

	currentUsernameObservable = this.userName.asObservable();
	currentUserDocIdObservable = this.userDocId.asObservable();
	currentActiveUsersObservable = this.activeUsers.asObservable();

	constructor(private userDAO: UserDAO) {}

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

	observeAllActiveUser() {
		this.userDAO.observeAllActiveUser()
			.onSnapshot((querySnapshot) => {
				const tmpActiveUserIds: IUserId[] = [];
				querySnapshot.forEach(doc => {
					const data = doc.data() as IUser;
					const id = doc.id;
					tmpActiveUserIds.push({id: id, user: data});
				});
				this.activeUsers.next(tmpActiveUserIds);
			});
	}

}

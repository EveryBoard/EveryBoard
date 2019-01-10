import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IUserId} from '../domain/iuser';
import {UserDAO} from '../dao/UserDAO';

@Injectable({
	providedIn: 'root'
})
export class ActivesUsersService {
	private activeUsers = new BehaviorSubject<IUserId[]>([]);

	currentActiveUsersObservable = this.activeUsers.asObservable();

	private unsubscribe: () => void;

	constructor(private userDao: UserDAO) {}

	startObserving() {
		const timeOutedTimestamp: number = Date.now() - (1000 * 60 * 10);
		const callback = (activeUserIds: IUserId[]) => {
			console.log('one user must have change a thing');
			activeUserIds = activeUserIds.filter(userId => userId.user.lastActionTime >= timeOutedTimestamp);
			this.activeUsers.next(activeUserIds);
		};
		this.unsubscribe = this.userDao.observeAllActiveUser(callback, timeOutedTimestamp);
	}

	stopObserving() {
		console.log('stopObserving user\'s activities');
		this.unsubscribe();
	}

}

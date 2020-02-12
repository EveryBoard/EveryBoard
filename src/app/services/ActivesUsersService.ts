import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IUserId} from '../domain/iuser';
import {UserDAO} from '../dao/UserDAO';

@Injectable({
	providedIn: 'root'
})
export class ActivesUsersService {
	refreshingPresenceTimeout = 60 * 1000;
	private activesUsersBS = new BehaviorSubject<IUserId[]>([]);

	activesUsersObs = this.activesUsersBS.asObservable();

	private unsubscribe: () => void;

	constructor(private userDao: UserDAO) {}

	public startObserving() {
		const refreshingPresenceTimeout: number = this.refreshingPresenceTimeout;
		const timeOutedTimestamp: number = Date.now() - refreshingPresenceTimeout;
		this.unsubscribe = this.userDao.observeActivesUsers(
			timeOutedTimestamp,
			activeUserIds => {
				activeUserIds = activeUserIds.filter(userId => userId.user.lastActionTime >= timeOutedTimestamp);
				this.activesUsersBS.next(activeUserIds); // TODO: vérifier fonctionnement du filtre
			});
	}
	public stopObserving() {
		this.unsubscribe();
	}
}
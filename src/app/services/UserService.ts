import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserDAO} from '../dao/UserDAO';
import {IUser, IUserId} from '../domain/iuser';
import {Router} from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	// TODO : token en sessionStorage, voir martiastrid
	private userName = this.getUserName();
	private userDocId = new BehaviorSubject<string>('');
	private activeUsers = new BehaviorSubject<IUserId[]>([]);

	currentUsernameObservable = this.userName.asObservable();
	currentUserDocIdObservable = this.userDocId.asObservable();
	currentActiveUsersObservable = this.activeUsers.asObservable();

	private unsubscribe: () => void;

	constructor(private _route: Router,
				private userDAO: UserDAO) {
	}

	private changeUser(username: string, userDocId: string) {
		this.userName.next(username);
		this.userDocId.next(userDocId);
	}

	updateUserActivity() {
		const currentUserDocId = this.userDocId.getValue();
		if (currentUserDocId === '') {
			return;
		}
		this.userDAO.updateUserDocActivity(currentUserDocId);
	}

	observeAllActiveUser() {
		this.userDAO.observeAllActiveUser(activeUserIds =>
			this.activeUsers.next(activeUserIds));
	}

	private getUserName(): BehaviorSubject<string> {
		return new BehaviorSubject<string>('');
	}

	logAsHalfMember(pseudo: string, code: string) {
		/* si on trouve l'utilisateur
			 *	  -> si le code match
			 *	  		-> on connecte
			 *	  		-> on lui dit que c'est prit ou mauvais code
			 *	  -> sinon on crée l'user et le connecte
			 */
		this.unsubscribe = this.userDAO.observeUserByPseudo(pseudo, foundUser => {
			if (foundUser === undefined) {
				this.onNewUser(pseudo, code);
			} else {
				this.onFoundUser(pseudo, code, foundUser);
			}
		});
	}

	private onNewUser(pseudo: string, code: string) {
		this.unsubscribe();
		this.createHalfMemberThenLog(pseudo, code);
	}

	private createHalfMemberThenLog(pseudo: string, code: string) {
		const newUser: IUser = {
			code: code,
			pseudo: pseudo,
			email: '',
			inscriptionDate: Date.now(),
			lastActionTime: Date.now(),
			status: -1
		};
		this.userDAO.createUser(newUser)
			.then(userId => this.logValidHalfMember(pseudo, code, userId));
	}

	private onFoundUser(pseudo: string, code: string, foundUser: IUserId) {
		this.unsubscribe();
		if (code === foundUser.user.code) {
			this.logValidHalfMember(foundUser.user.pseudo, foundUser.user.code, foundUser.id);
		} else {
			console.log('code incorrect !'); // TODO : rendre ça visible de l'user
		}
	}

	private logValidHalfMember(pseudo: string, code: string, id: string) {
		this.userDAO.updateUserById(id, {
			lastActionTime: Date.now(),
			status: -2 // TODO calculate what that must be
		}); // TODO addPart .then
		this.changeUser(pseudo, id);
		this._route.navigate(['/server']);
	}

	// Delegate

	observeUserByPseudo(pseudo: string, callback: (user: IUserId) => void): () => void {
		// the callback will be called on the foundUser
		return this.userDAO.observeUserByPseudo(pseudo, callback);
	}

}

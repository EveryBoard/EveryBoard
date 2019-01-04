import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserDAO} from '../dao/UserDAO';
import {IUser, IUserId} from '../domain/iuser';
import {AngularFirestore} from 'angularfire2/firestore';
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
				private userDAO: UserDAO,
				private afs: AngularFirestore) {}

	private changeUser(username: string, userDocId: string) {
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
		this.unsubscribe = this.afs
			.collection('joueurs').ref
			.where('pseudo', '==', pseudo)
			.onSnapshot( querySnapshot => {
				const users: IUserId[] = [];
				querySnapshot.forEach( doc => {
					users.push({ id: doc.id, user: doc.data() as IUser});
				});
				if (users.length === 0) {
					this.onNewUser(pseudo, code);
				} else {
					this.onFoundUser(pseudo, code, users[0]);
				}
			}, error => {
				console.log('essaye à nouveau, j\'ai pas compris c\'qui se passe');
			});
	}

	private onNewUser(pseudo: string, code: string) {
		this.unsubscribe();
		this.createHalfMemberThenLog(pseudo, code);
	}

	private createHalfMemberThenLog(pseudo: string, code: string) {
		this.afs.collection('joueurs').add({
			code: code,
			pseudo: pseudo,
			email: '',
			inscriptionDate: Date.now(),
			lastActionTime: Date.now(),
			status : -1
		}).then((docRef) => {
			this.logValidHalfMember(pseudo, code, docRef.id);
		});
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
		this.afs.collection('joueurs')
			.doc(id).update({
			lastActionTime: Date.now(),
			status: -2 // TODO calculate what that must be
		});
		this.changeUser(pseudo, id);
		this._route.navigate(['/server']);
	}
}

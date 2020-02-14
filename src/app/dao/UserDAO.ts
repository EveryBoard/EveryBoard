import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {IUser, IUserId, PIUser} from '../domain/iuser';
import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';

@Injectable({
	providedIn: 'root'
})
export class JoueursDAO extends FirebaseFirestoreDAO<IUser, PIUser> {

	constructor(protected afs: AngularFirestore) {
        super("joueurs", afs);
    }
	public observeUserByPseudo(pseudo: string, onUserUpdate: (user: IUserId) => void): () => void {
		// the callback will be called on the foundUser
		return this.afs.collection('joueurs').ref
			.where('pseudo', '==', pseudo)
			.limit(1)
			.onSnapshot(querySnapshot => {
				let userFound: IUserId;
				querySnapshot.forEach(doc => {
					const user: IUser = doc.data() as IUser;
					const id = doc.id;
					userFound = {id, user};
				});
				onUserUpdate(userFound);
			});
	}
	public observeActivesUsers(timeOutedTimestamp: number, callback: (users: IUserId[]) => void): () => void {
		return this.afs
			.collection('joueurs').ref
			.where('lastActionTime', '>=', timeOutedTimestamp)
			.onSnapshot(querySnapshot => {
				const activeUserIds: IUserId[] = [];
				querySnapshot.forEach(doc => {
					const user: IUser = doc.data() as IUser;
					const id = doc.id;
					activeUserIds.push({id, user});
				});
				callback(activeUserIds);
			});
	}
	public updateUserDocActivity(userDocId: string, activityIsAMove: boolean): Promise<void> {
		// update the user with pseudo to notifify that he's been doing something
		const now = Date.now();
		const moveUpdate: PIUser = {
			lastActionTime: now,
			lastMoveTime: now,
			status: -2 // TODO calculate what that must be
		};
		const nonMoveUpdate: PIUser = {
			lastActionTime: now,
			status: -2 // TODO calculate what that must be
		};
		const update: PIUser = activityIsAMove ? moveUpdate : nonMoveUpdate;
		return this.afs
			.doc('joueurs/' + userDocId)
			.update(update);
	}
}
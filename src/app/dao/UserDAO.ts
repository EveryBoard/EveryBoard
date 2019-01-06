import {Injectable} from '@angular/core';
import {AngularFirestore, DocumentReference, Query, QuerySnapshot} from 'angularfire2/firestore';
import {IUser, PIUser} from '../domain/iuser';

@Injectable({
	providedIn: 'root'
})
export class UserDAO {
	constructor(private afs: AngularFirestore) {
	}

	observeAllActiveUser(): Query {
		return this.afs.collection('joueurs').ref
			.where('lastActionTime', '>=', Date.now() - (1000 * 60 * 10));
	}

	updateUserDocuActivity(userDocId: string) {
		// update the user with pseudo to notifify that he's been doing something
		this.afs.collection('joueurs')
			.doc(userDocId).update({
			lastActionTime: Date.now(),
			status: -2 // TODO calculate what that must be
		});
	}

	getUserDocRefByUserName(username: string): Query {
		return this.afs.collection('joueurs').ref
			.where('pseudo', '==', username).limit(1);
	}

	getUserByPseudo(pseudo: string, callback: (snapshot: QuerySnapshot<IUser>) => void): () => void {
		return this.afs
			.collection('joueurs').ref
			.where('pseudo', '==', pseudo)
			.onSnapshot(callback);
	}

	updateUserById(id: string, modif: PIUser): Promise<void> {
		return this.afs.collection('joueurs')
			.doc(id).update(modif);
	}

	addUser(newUser: IUser): Promise<DocumentReference> {
		return this.afs.collection('joueurs')
			.add(newUser);
	}
}

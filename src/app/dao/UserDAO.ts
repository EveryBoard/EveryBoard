import {Injectable} from '@angular/core';
import {AngularFirestore, Query} from 'angularfire2/firestore';

@Injectable({
	providedIn : 'root'
})
export class UserDAO {
	constructor(private afs: AngularFirestore) {}

	observeAllActiveUser(): Query {
		return this.afs.collection('joueurs').ref
			.where('lastActionTime', '>=', Date.now() - (1000 * 60 * 10));
	}
	updateUserDocuActivity(userDocId: string) {
		// update the user with pseudo to notifify that he's been doing something
		this.afs.collection('joueurs')
			.doc(userDocId).update({
<<<<<<< HEAD
				lastActionTime: Date.now(),
				status: -2 // TODO calculate what that must be
=======
			lastActionTime: Date.now(),
			status: -2 // TODO calculate what that must be
>>>>>>> small-security-amelioration
		});
	}
}

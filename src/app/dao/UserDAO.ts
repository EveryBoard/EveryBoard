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
		console.log('user presence is being updated');
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
}

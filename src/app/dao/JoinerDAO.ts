import {Observable} from 'rxjs';
import {IJoiner, IJoinerId} from '../domain/ijoiner';
import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn : 'root'
})
export class JoinerDAO {

	constructor(private afs: AngularFirestore) {}

	getJoinerIdObservableById(id: string): Observable<IJoinerId> {
		return this.afs.doc('joiners/' + id).snapshotChanges()
			.pipe(map(actions => {
				return {
					joiner: actions.payload.data() as IJoiner,
					id: id};
			}));
	}

	getJoinerDocById(joinerId: string): AngularFirestoreDocument<IJoiner> {
		return this.afs.doc('joiners/' + joinerId);
	}
}

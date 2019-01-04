import {Observable} from 'rxjs';
import {IJoiner, IJoinerId} from '../domain/ijoiner';
import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument, DocumentReference} from 'angularfire2/firestore';
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

	getJoinerDocById(joinerId: string): AngularFirestoreDocument<IJoiner> { // TODO: AFD belong to DAO's scope
		return this.afs.doc('joiners/' + joinerId);
	}

	set(id: string, joiner: IJoiner): Promise<void> {
		return this.afs
			.collection('joiners')
			.doc(id).set(joiner);
	}

	getJoinerDocRefById(id: string): DocumentReference {
		return this.afs.doc('joiners/' + id).ref;
	}

}

import {Observable} from 'rxjs';
import {IJoiner, IJoinerId, PIJoiner} from '../domain/ijoiner';
import {Injectable} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class JoinerDAO {

	constructor(private afs: AngularFirestore) {
	}

	getJoinerObsById(id: string): Observable<IJoinerId> {
		return this.afs.doc('joiners/' + id).snapshotChanges()
			.pipe(map(actions => {
				return {
					joiner: actions.payload.data() as IJoiner,
					id: id
				};
			}));
	}

	set(id: string, joiner: IJoiner): Promise<void> {
		return this.afs
			.collection('joiners')
			.doc(id).set(joiner);
	}

	// Simple CRUD

	createJoiner(newJoiner: IJoiner): Promise<string> {
		// returns the id of the created joiners
		return new Promise((resolve, reject) => {
			this.afs.collection('joiners')
				.add(newJoiner)
				.then(docRef => resolve(docRef.id))
				.catch(onRejected => reject(onRejected));
		});
	}

	readJoinerById(joinerId: string): Promise<IJoiner> {
		return new Promise((resolve, reject) => {
			this.afs
				.doc('joiners/' + joinerId).ref.get()
				.then(documentSnapshot => resolve(documentSnapshot.data() as IJoiner))
				.catch(onRejected => reject(onRejected));
		});
	}

	updateJoinerById(joinerId: string, modification: PIJoiner): Promise<void> {
		return this.afs
			.doc('joiners/' + joinerId).ref
			.update(modification);
	}

	deleteById(joinerId: string): Promise<void> {
		return this.afs.doc('joiners/' + joinerId).ref.delete();
	}

}

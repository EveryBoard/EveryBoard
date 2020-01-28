import {Observable} from 'rxjs';
import {IJoiner, IJoinerId, PIJoiner} from '../domain/ijoiner';
import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class JoinerDAO {

	static VERBOSE = false;

	constructor(private afs: AngularFirestore) {
	}

	getObservable(id: string): Observable<IJoinerId> {
		if (JoinerDAO.VERBOSE) {
			console.log('JoinerDAO.getObservable(' + id + ')');
		}
		return this.afs.doc('joiners/' + id).snapshotChanges()
			.pipe(map(actions => {
				return {
					joiner: actions.payload.data() as IJoiner,
					id: id
				};
			}));
	}

	set(id: string, joiner: IJoiner): Promise<void> {
		if (JoinerDAO.VERBOSE) {
			console.log('JoinerDAO.set(' + id + ', ' + JSON.stringify(joiner) + ')');
		}
		return this.afs
			.collection('joiners')
			.doc(id).set(joiner);
	}

	// Simple CRUD

	create(newJoiner: IJoiner): Promise<string> {
		if (JoinerDAO.VERBOSE) {
			console.log('JoinerDAO.create(' + JSON.stringify(newJoiner) + ')');
		}
		// returns the id of the created joiners
		return new Promise((resolve, reject) => {
			this.afs.collection('joiners')
				.add(newJoiner)
				.then(docRef => resolve(docRef.id))
				.catch(onRejected => reject(onRejected));
		});
	}

	read(joinerId: string): Promise<IJoiner> {
		if (JoinerDAO.VERBOSE) {
			console.log('JoinerDAO.read(' + joinerId + ')');
		}
		return new Promise((resolve, reject) => {
			this.afs
				.doc('joiners/' + joinerId).ref.get()
				.then(documentSnapshot => resolve(documentSnapshot.data() as IJoiner))
				.catch(onRejected => reject(onRejected));
		});
	}

	update(joinerId: string, modification: PIJoiner): Promise<void> {
		if (JoinerDAO.VERBOSE) {
			console.log('JoinerDAO.update(' + joinerId + ', ' + JSON.stringify(modification) + ')');
		}
		return this.afs
			.doc('joiners/' + joinerId).ref
			.update(modification);
	}

	delete(joinerId: string): Promise<void> {
		if (JoinerDAO.VERBOSE) {
			console.log('JoinerDAO.delete(' + joinerId + ');');
		}
		return this.afs.doc('joiners/' + joinerId).ref.delete();
	}

}

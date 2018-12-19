import {Observable} from 'rxjs';
import {IJoiner} from '../domain/ijoiner';
import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn : 'root'
})
export class JoinerDAO {

	constructor(private afs: AngularFirestore) {}

	getJoinerObservableById(id: string): Observable<IJoiner> {
		return this.afs.doc('joiners/' + id).snapshotChanges()
			.pipe(map(actions => {
				return actions.payload.data() as IJoiner;
			}));
	}

	getJoinerDocById(joinerId: string): AngularFirestoreDocument<IJoiner> {
		return this.afs.doc('joiners/' + joinerId);
	}

}

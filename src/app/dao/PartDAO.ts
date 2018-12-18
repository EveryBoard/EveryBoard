import {map} from 'rxjs/operators';
import {ICurrentPart} from '../domain/icurrentpart';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn : 'root'
})
export class PartDAO {

	constructor(private afs: AngularFirestore) {
	}

	getPartByID(partId: string): Observable<ICurrentPart> {
		return this.afs.collection('parties').doc(partId).snapshotChanges()
			.pipe(map(actions => {
				return actions.payload.data() as ICurrentPart;
			}));
	}

	getPartDoc(partId: string): AngularFirestoreDocument<ICurrentPart> {
		return this.afs.doc('parties/' + partId);
	}
}

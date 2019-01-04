import {map} from 'rxjs/operators';
import {ICurrentPart} from '../domain/icurrentpart';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreDocument, DocumentReference, QuerySnapshot} from 'angularfire2/firestore';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn : 'root'
})
export class PartDAO {

	constructor(private afs: AngularFirestore) {}

	getPartObservableById(partId: string): Observable<ICurrentPart> {
		return this.afs.doc('parties/' + partId).snapshotChanges()
			.pipe(map(actions => {
				return actions.payload.data() as ICurrentPart;
			}));
	}

	getPartAFDocById(partId: string): AngularFirestoreDocument<ICurrentPart> { // TODO: refactor, AFD belong to DAO's scope ?
		return this.afs.doc('parties/' + partId);
	}

	getPartDocRefById(partId: string) {
		return this.afs.doc('parties/' + partId).ref;
	}

	add(newPart: ICurrentPart): Promise<DocumentReference> {
		return this.afs.collection('parties/').
			add(newPart);
	}

	observeAllActivePart(f: (snapshot: QuerySnapshot<ICurrentPart>) => void): () => void {
		return this.afs.collection('parties').ref
			.where('result', '==', 5) // TODO : afs se fait appeler par les DAO !
			.onSnapshot(f);
	}
}

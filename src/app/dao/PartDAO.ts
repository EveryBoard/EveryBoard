import {map} from 'rxjs/operators';
import {ICurrentPart, ICurrentPartId} from '../domain/icurrentpart';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreDocument, DocumentReference, QuerySnapshot} from 'angularfire2/firestore';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn : 'root'
})
export class PartDAO {

	constructor(private afs: AngularFirestore) {}

	getPartObservableById(partId: string): Observable<ICurrentPart> {
		return this.afs.doc('parties/' + partId)
			.snapshotChanges()
			.pipe(map(actions => {
				return actions.payload.data() as ICurrentPart;
			}));
	}

	getPartAFDocById(partId: string): AngularFirestoreDocument<ICurrentPart> { // TODO: refactor, AFD belong to DAO's scope ?
		return this.afs.doc('parties/' + partId);
	}

	getPartDocRefById(partId: string): DocumentReference {
		return this.afs.doc('parties/' + partId)
			.ref;
	}

	private addPart(newPart: ICurrentPart): Promise<DocumentReference> {
		return this.afs.collection('parties')
			.add(newPart);
	}

	observeAllActivePart(callback: (snapshot: QuerySnapshot<ICurrentPart>) => void): () => void {
		return this.afs.collection('parties').ref
			.where('result', '==', 5) // TODO : afs se fait appeler par les DAO !
			.onSnapshot(callback);
	}

	addPartNew(newPart: ICurrentPart): Promise<string> {
		// returns the id of the created part
		console.log('addPartNew');
		const docRefPromise: Promise<DocumentReference> = this.addPart(newPart);
		return new Promise((resolve, reject) => {
			console.log('custom Promise Fullfilled or excecuting ??');
			console.log(resolve);
			docRefPromise.then(docRef => {
				console.log('db promise fullfilled with ' + docRef.id);
				resolve(docRef.id);
			});
		});
	}
}

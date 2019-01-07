import {map} from 'rxjs/operators';
import {ICurrentPart, ICurrentPartId, PICurrentPart} from '../domain/icurrentpart';
import {Observable} from 'rxjs';
import {AngularFirestore} from 'angularfire2/firestore';
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

	observeAllActivePart(callback: (parts: ICurrentPartId[]) => void): () => void {
		// the callback will be called on the list of all actives parts
		return this.afs.collection('parties').ref
			.where('result', '==', 5)
			.onSnapshot(querySnapshot => {
				const partIds: ICurrentPartId[] = [];
				querySnapshot.forEach(doc => {
					const data = doc.data() as ICurrentPart;
					const id = doc.id;
					partIds.push({id: id, part: data});
				});
				callback(partIds);
			});
	}

	// Simple CRUD

	createPart(newPart: ICurrentPart): Promise<string> {
		// returns the id of the created part
		return new Promise((resolve, reject) => {
			this.afs.collection('parties')
				.add(newPart)
				.then(docRef => resolve(docRef.id))
				.catch(onRejected => reject(onRejected));
		});
	}

	readPartById(partId: string): Promise<ICurrentPart> {
		return new Promise((resolve, reject) => {
			this.afs
				.doc('parties/' + partId).ref.get()
				.then(documentSnapshot => resolve(documentSnapshot.data() as ICurrentPart))
				.catch(onRejected => reject(onRejected));
		});
	}

	updatePartById(partId: string, modification: PICurrentPart): Promise<void> {
		return this.afs
			.doc('parties/' + partId).ref
			.update(modification);
	}

	deletePartById(partId: string): Promise<void> {
		return this.afs.doc('parties/' + partId).ref.delete();
	}

}

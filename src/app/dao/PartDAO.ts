import {map} from 'rxjs/operators';
import {ICurrentPart, ICurrentPartId, PICurrentPart} from '../domain/icurrentpart';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn : 'root'
})
export class PartDAO {

	static VERBOSE = false;

	constructor(private afs: AngularFirestore) {}

	getPartObsById(partId: string): Observable<ICurrentPartId> {
		if (PartDAO.VERBOSE) {
			console.log('getPartObsById(' + partId + ')');
		}
		return this.afs.doc('parties/' + partId).snapshotChanges()
			.pipe(map(actions => {
				return {
					part: actions.payload.data() as ICurrentPart,
					id: partId
				};
			}));
	}

	observeActivesParts(callback: (parts: ICurrentPartId[]) => void): () => void {
		if (PartDAO.VERBOSE) {
			console.log('observeActivesParts');
		}
		// the callback will be called on the list of all actives activesParts
		return this.afs
			.collection('parties').ref
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
		if (PartDAO.VERBOSE) {
			console.log('PartDAO.createPart : ' + JSON.stringify(newPart));
		}
		return new Promise((resolve, reject) => {
			this.afs.collection('parties')
				.add(newPart)
				.then(docRef => resolve(docRef.id))
				.catch(onRejected => {
					console.log('PartDAO.createPart with arg:');
					console.log(JSON.stringify(newPart));
					console.log('failed because :');
					console.log(onRejected);
					reject(onRejected);
				});
		});
	}

	readPartById(partId: string): Promise<ICurrentPart> {
		if (PartDAO.VERBOSE) {
			console.log('readPartById(' + partId + ')');
		}
		return new Promise((resolve, reject) => {
			this.afs
				.doc('parties/' + partId).ref.get()
				.then(documentSnapshot => resolve(documentSnapshot.data() as ICurrentPart))
				.catch(onRejected => reject(onRejected));
		});
	}

	updatePartById(partId: string, modification: PICurrentPart): Promise<void> {
		if (PartDAO.VERBOSE) {
			console.log('PartDAO.updated ' + partId);
			console.log('now it is: ' + JSON.stringify(modification));
		}
		return this.afs
			.doc('parties/' + partId).ref
			.update(modification);
	}

	deletePartById(partId: string): Promise<void> {
		if (PartDAO.VERBOSE) {
			console.log('deletePartById(' + partId + ')');
		}
		return this.afs.doc('parties/' + partId).ref.delete();
	}

}

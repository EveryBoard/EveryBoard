import { FirebaseFirestoreDAO } from "./FirebaseFirestoreDAO";
import { ICurrentPart, PICurrentPart, ICurrentPartId } from "../domain/icurrentpart";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export class PartDAO extends FirebaseFirestoreDAO<ICurrentPart, PICurrentPart> {

	static VERBOSE = false;

	constructor(protected afs: AngularFirestore) {
        super("parties", afs);
    }
	public getPartObsById(partId: string): Observable<ICurrentPartId> {
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
	public observeActivesParts(callback: (parts: ICurrentPartId[]) => void): () => void {
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
}
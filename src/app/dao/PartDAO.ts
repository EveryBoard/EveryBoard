import { FirebaseFirestoreDAO } from "./FirebaseFirestoreDAO";
import { ICurrentPart, PICurrentPart, ICurrentPartId } from "../domain/icurrentpart";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { FirebaseCollectionObserver } from "./FirebaseCollectionObserver";

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
                    doc: actions.payload.data() as ICurrentPart,
                    id: partId
                };
            }));
    }
    public observeActivesParts(callback: FirebaseCollectionObserver<ICurrentPart>): () => void {
        return this.observingWhere("result", "==", 5, callback);
    }
}
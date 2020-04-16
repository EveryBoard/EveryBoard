import { FirebaseFirestoreDAO } from "./FirebaseFirestoreDAO";
import { IJoiner, PIJoiner, IJoinerId } from "../domain/ijoiner";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class JoinerDAO extends FirebaseFirestoreDAO<IJoiner, PIJoiner> {

    static VERBOSE = false;

    constructor(protected afs: AngularFirestore) {
        super("joiners", afs);
        if (environment.test) throw new Error("NO JOINER DAO IN TEST");
    }
    public getObservable(id: string): Observable<IJoinerId> {
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
}
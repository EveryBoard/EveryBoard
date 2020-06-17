import { FirebaseFirestoreDAO } from "../firebasefirestoredao/FirebaseFirestoreDAO";
import { IJoiner, PIJoiner, IJoinerId } from "../../domain/ijoiner";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class JoinerDAO extends FirebaseFirestoreDAO<IJoiner, PIJoiner> {

    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super("joiners", afs);
        if (environment.test) throw new Error("NO JOINER DAO IN TEST");
        if (JoinerDAO.VERBOSE) console.log("JoinerDAO.constructor");
    }
}
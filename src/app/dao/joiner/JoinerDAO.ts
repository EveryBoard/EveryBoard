import { FirebaseFirestoreDAO } from "../firebasefirestoredao/FirebaseFirestoreDAO";
import { IJoiner, PIJoiner } from "../../domain/ijoiner";
import { AngularFirestore } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { display } from "src/app/collectionlib/utils";

@Injectable({
    providedIn: 'root'
})
export class JoinerDAO extends FirebaseFirestoreDAO<IJoiner, PIJoiner> {

    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super("joiners", afs);
        if (environment.test) throw new Error("NO JOINER DAO IN TEST");
        display(JoinerDAO.VERBOSE, "JoinerDAO.constructor");
    }
}
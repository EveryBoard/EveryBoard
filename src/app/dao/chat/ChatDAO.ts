import { IChat, PIChat, IChatId } from "../../domain/ichat";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { FirebaseFirestoreDAO } from "../FirebaseFirestoreDAO";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ChatDAO extends FirebaseFirestoreDAO<IChat, PIChat> {

    constructor(protected afs: AngularFirestore) {
        super("chats", afs);
        if (environment.test) throw new Error("NO CHAT DAO IN TEST");
    }
    public getChatObsById(id: string): Observable<IChatId> {
        return this.afs.doc('chats/' + id).snapshotChanges()
            .pipe(map(actions => {
                return {
                    chat: actions.payload.data() as IChat,
                    id: id
                };
            }));
    }
}
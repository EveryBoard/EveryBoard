import { IChat, PIChat, IChatId } from "../domain/ichat";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { FirebaseFirestoreDAO } from "./FirebaseFirestoreDAO";

export class ChatDAO extends FirebaseFirestoreDAO<IChat, PIChat> {

	constructor(protected afs: AngularFirestore) {
        super("/chats", afs);
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
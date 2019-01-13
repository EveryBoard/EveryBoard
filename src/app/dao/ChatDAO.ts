import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {map} from 'rxjs/operators';
import {IChat, IChatId, PIChat} from '../domain/ichat';

@Injectable({
	providedIn: 'root'
})
export class ChatDAO {

	constructor(private afs: AngularFirestore) {}

	getChatObsById(id: string): Observable<IChatId> {
		return this.afs.doc('chats/' + id).snapshotChanges()
			.pipe(map(actions => {
				return {
					chat: actions.payload.data() as IChat,
					id: id
				};
			}));
	}

	set(id: string, chat: IChat): Promise<void> {
		return this.afs
			.collection('chats')
			.doc(id).set(chat);
	}

	// Simple CRUD

	createChat(newChat: IChat): Promise<string> {
		// returns the id of the created chats
		return new Promise((resolve, reject) => {
			this.afs.collection('chats')
				.add(newChat)
				.then(docRef => resolve(docRef.id))
				.catch(onRejected => reject(onRejected));
		});
	}

	readChatById(chatId: string): Promise<IChat> {
		return new Promise((resolve, reject) => {
			this.afs
				.doc('chats/' + chatId).ref.get()
				.then(documentSnapshot => resolve(documentSnapshot.data() as IChat))
				.catch(onRejected => reject(onRejected));
		});
	}

	updateChatById(chatId: string, modification: PIChat): Promise<void> {
		return this.afs
			.doc('chats/' + chatId).ref
			.update(modification);
	}

	deleteById(chatId: string): Promise<void> {
		return this.afs.doc('chats/' + chatId).ref.delete();
	}

}

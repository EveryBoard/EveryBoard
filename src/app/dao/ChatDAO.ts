import { Chat } from '../domain/Chat';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ChatDAO extends FirebaseFirestoreDAO<Chat> {
    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('chats', afs);
        display(ChatDAO.VERBOSE, 'ChatDAO.constructor');
    }
}

import { Chat } from '../domain/Chat';
import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class ChatDAO extends FirebaseFirestoreDAO<Chat> {
    public static VERBOSE: boolean = false;

    constructor(firestore: Firestore) {
        super('chats', firestore);
        display(ChatDAO.VERBOSE, 'ChatDAO.constructor');
    }
}

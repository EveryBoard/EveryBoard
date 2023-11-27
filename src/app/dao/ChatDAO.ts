import { FirestoreDAO } from './FirestoreDAO';
import { Injectable } from '@angular/core';
import { Chat } from '../domain/Chat';
import { Firestore } from '@angular/fire/firestore';
import { Debug } from '../utils/Debug';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ChatDAO extends FirestoreDAO<Chat> {

    public constructor(firestore: Firestore) {
        super('chats', firestore);
    }
}

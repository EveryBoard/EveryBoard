import { FirestoreDAO } from './FirestoreDAO';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';
import { Chat } from '../domain/Chat';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class ChatDAO extends FirestoreDAO<Chat> {

    public static override VERBOSE: boolean = false;

    public constructor(firestore: Firestore) {
        super('chats', firestore);
        display(ChatDAO.VERBOSE, 'ChatDAO.constructor');
    }
}

import { FirestoreDAO } from './FirestoreDAO';
import { Injectable } from '@angular/core';
import { Chat } from '../domain/Chat';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ChatDAO extends FirestoreDAO<Chat> {

    public constructor() {
        super('chats');
    }
}

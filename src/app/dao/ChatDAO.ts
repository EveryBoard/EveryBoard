import { Injectable } from '@angular/core';

import { Chat } from '../domain/Chat';
import { Debug } from '../utils/Debug';

import { FirestoreDAO } from './FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ChatDAO extends FirestoreDAO<Chat> {

    public constructor() {
        super('chats');
    }
}

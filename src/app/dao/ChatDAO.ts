import { Chat } from '../domain/Chat';
import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ChatDAO extends FirebaseFirestoreDAO<Chat> {
    public static VERBOSE: boolean = false;

    constructor() {
        super('chats');
        display(ChatDAO.VERBOSE, 'ChatDAO.constructor');
    }
}

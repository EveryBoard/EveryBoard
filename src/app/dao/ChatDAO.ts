import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';
import { Message, MessageDocument } from '../domain/Message';
import { Chat } from '../domain/Chat';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { Firestore, Unsubscribe } from 'firebase/firestore';

@Injectable({
    providedIn: 'root',
})
export class ChatDAO extends FirebaseFirestoreDAO<Chat> {
    public static VERBOSE: boolean = false;

    constructor(firestore: Firestore) {
        super('chats', firestore);
        display(ChatDAO.VERBOSE, 'ChatDAO.constructor');
    }
    public async addMessage(chatId: string, message: Message): Promise<string> {
        return this.subCollectionDAO(chatId, 'messages').create(message);
    }
    public async getLastMessages(chatId: string, limit: number): Promise<MessageDocument[]> {
        const ordering: string = 'postedTime';
        return this.subCollectionDAO<Message>(chatId, 'messages').findWhere([], ordering, limit);
    }
    public subscribeToMessages(chatId: string, callback: FirebaseCollectionObserver<Message>): Unsubscribe {
        return this.subCollectionDAO<Message>(chatId, 'messages').observingWhere([], callback, 'postedTime');
    }
}

/* eslint-disable max-lines-per-function */
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { FirebaseFirestoreDAOMock } from './FirebaseFirestoreDAOMock.spec';
import { Chat, ChatDocument } from 'src/app/domain/Chat';
import { display } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Message, MessageDocument } from 'src/app/domain/Message';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import * as Firestore from '@angular/fire/firestore';

type ChatOS = ObservableSubject<MGPOptional<ChatDocument>>
type MessageOS = ObservableSubject<MGPOptional<MessageDocument>>

export class ChatDAOMock extends FirebaseFirestoreDAOMock<Chat> {
    public static VERBOSE: boolean = false;

    private static chatDB: MGPMap<string, ChatOS>;
    public static messagesDB: MGPMap<string, MGPMap<string, MessageOS>>;

    public constructor() {
        super('ChatDAOMock', ChatDAOMock.VERBOSE);
        display(this.VERBOSE, 'ChatDAOMock.constructor');
    }
    public getStaticDB(): MGPMap<string, ChatOS> {
        return ChatDAOMock.chatDB;
    }
    public resetStaticDB(): void {
        ChatDAOMock.chatDB = new MGPMap();
    }
    public async addMessage(chatId: string, message: Message): Promise<string> {
        return this.subCollectionDAO(chatId, 'messages').create(message);
    }
    public async getLastMessages(chatId: string, limit: number): Promise<MessageDocument[]> {
        return this.subCollectionDAO<Message>(chatId, 'messages').findWhere([], 'postedTime', limit);
    }
    public subscribeToMessages(chatId: string, callback: FirebaseCollectionObserver<Message>): Firestore.Unsubscribe {
        return this.subCollectionDAO<Message>(chatId, 'messages').observingWhere([], callback, 'postedTime');
    }
}

/* eslint-disable max-lines-per-function */
import { MGPMap, MGPOptional, ObservableSubject } from '@everyboard/lib';

import { Chat, ChatDocument } from '../../domain/Chat';
import { MessageDocument } from '../../domain/Message';
import { Debug } from '../../utils/Debug';
import { FirestoreDAOMock } from './FirestoreDAOMock.spec';

type ChatOS = ObservableSubject<MGPOptional<ChatDocument>>;

type MessageOS = ObservableSubject<MGPOptional<MessageDocument>>;

@Debug.log
export class ChatDAOMock extends FirestoreDAOMock<Chat> {

    private static chatDB: MGPMap<string, ChatOS>;

    public static messagesDB: MGPMap<string, MGPMap<string, MessageOS>>;

    public constructor() {
        super('ChatDAOMock');
    }
    public getStaticDB(): MGPMap<string, ChatOS> {
        return ChatDAOMock.chatDB;
    }
    public resetStaticDB(): void {
        ChatDAOMock.chatDB = new MGPMap();
    }
}

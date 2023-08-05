/* eslint-disable max-lines-per-function */
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { FirestoreDAOMock } from './FirestoreDAOMock.spec';
import { Chat, ChatDocument } from 'src/app/domain/Chat';
import { Debug } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDocument } from 'src/app/domain/Message';

type ChatOS = ObservableSubject<MGPOptional<ChatDocument>>
type MessageOS = ObservableSubject<MGPOptional<MessageDocument>>

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

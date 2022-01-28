/* eslint-disable max-lines-per-function */
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { FirebaseFirestoreDAOMock } from './FirebaseFirestoreDAOMock.spec';
import { Chat, ChatDocument } from 'src/app/domain/Chat';
import { display } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type ChatOS = ObservableSubject<MGPOptional<ChatDocument>>

export class ChatDAOMock extends FirebaseFirestoreDAOMock<Chat> {
    public static VERBOSE: boolean = false;

    private static chatDB: MGPMap<string, ChatOS>;

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
}

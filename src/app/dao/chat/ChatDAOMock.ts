import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPStr } from 'src/app/utils/mgp-str/MGPStr';
import { ObservableSubject } from 'src/app/utils/collection-lib/ObservableSubject';
import { FirebaseFirestoreDAOMock } from '../firebase-firestore-dao/FirebaseFirestoreDAOMock';
import { IChat, PIChat, IChatId } from 'src/app/domain/ichat';
import { display } from 'src/app/utils/collection-lib/utils';

type ChatOS = ObservableSubject<IChatId>

export class ChatDAOMock extends FirebaseFirestoreDAOMock<IChat, PIChat> {
    public static VERBOSE = false;

    private static chatDB: MGPMap<MGPStr, ChatOS>;

    public constructor() {
        super('ChatDAOMock', ChatDAOMock.VERBOSE);
        display(this.VERBOSE, 'ChatDAOMock.constructor');
    }
    public getStaticDB(): MGPMap<MGPStr, ChatOS> {
        return ChatDAOMock.chatDB;
    }
    public resetStaticDB() {
        ChatDAOMock.chatDB = new MGPMap();
    }
}

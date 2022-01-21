import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';
import { JSONObject } from '../utils/utils';
import { Message } from './Message';

export type ChatDocument = FirebaseDocument<Chat>

export interface Chat extends JSONObject {
    // the Id will always be the same as the joiner doc and part doc, or "server"
    messages: Message[];
}


import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';
import { FirebaseJSONObject } from '../utils/utils';

// A chat has no object, it only contains a sub collection with the messages
export type Chat = FirebaseJSONObject

export type ChatDocument = FirebaseDocument<Chat>

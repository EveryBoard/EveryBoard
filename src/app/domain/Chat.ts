import { FirestoreJSONObject } from '@everyboard/lib';

import { FirestoreDocument } from '../dao/FirestoreDAO';

// A chat has no object, it only contains a sub collection with the messages
export type Chat = FirestoreJSONObject

export type ChatDocument = FirestoreDocument<Chat>;

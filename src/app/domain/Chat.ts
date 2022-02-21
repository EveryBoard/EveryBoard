import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';
import { FirebaseJSONObject } from '../utils/utils';

export type Chat = FirebaseJSONObject

export type ChatDocument = FirebaseDocument<Chat>

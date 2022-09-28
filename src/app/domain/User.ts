import { FirestoreDocument } from '../dao/FirestoreDAO';
import { FirestoreJSONObject } from '../utils/utils';
import { FirestoreTime } from './Time';

export type UserDocument = FirestoreDocument<User>

export interface User extends FirestoreJSONObject {
    username?: string; // may not be set initially for google users
    lastUpdateTime?: FirestoreTime,
    verified: boolean,
    observedPart?: string | null,
}

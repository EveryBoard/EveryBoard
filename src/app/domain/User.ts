import { FirestoreDocument } from '../dao/FirestoreDAO';
import { FirestoreJSONObject } from '../utils/utils';
import { FirestoreTime } from './Time';

export type UserDocument = FirestoreDocument<User>

export interface User extends FirestoreJSONObject {
    username?: string; // may not be set initially for google users
    // eslint-disable-next-line camelcase
    last_changed?: FirestoreTime,
    verified: boolean,
    observedPart?: ObservedPart | null,
}

export interface ObservedPart extends FirestoreJSONObject {
    id: string,
    typeGame: string,
    opponent?: string | null,
}

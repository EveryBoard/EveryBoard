
import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';
import { FirebaseJSONObject } from '../utils/utils';
import { FirebaseTime } from './Time';

export type UserDocument = FirebaseDocument<User>

export interface User extends FirebaseJSONObject {
    username?: string; // may not be set initially for google users
    // eslint-disable-next-line camelcase
    last_changed?: FirebaseTime,
    verified: boolean,
    observedPart?: ObservedPart | null,
}

export interface ObservedPart extends FirebaseJSONObject {
    id: string,
    typeGame: string,
    opponent?: string | null,
}

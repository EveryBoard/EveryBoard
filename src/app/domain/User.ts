
import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';
import { FirebaseJSONObject } from '../utils/utils';
import { FirebaseTime } from './Time';

export type UserDocument = FirebaseDocument<User>

export interface User extends FirebaseJSONObject {
    username?: string; // may not be set initially for google users
    // eslint-disable-next-line camelcase
    last_changed?: FirebaseTime,
    state?: 'online' | 'offline';
    verified: boolean,
    observedPart?: string,
}

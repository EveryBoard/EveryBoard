import { FirestoreDocument } from '../dao/FirestoreDAO';
import { JSONObject } from '../utils/utils';
import { Time } from './Time';

export type UserDocument = FirestoreDocument<User>

export interface User extends JSONObject {
    username?: string; // may not be set initially for google users
    // eslint-disable-next-line camelcase
    last_changed?: Time,
    verified: boolean,
    observedPart?: string | null,
}

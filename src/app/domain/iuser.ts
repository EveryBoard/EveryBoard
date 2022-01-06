import { FirebaseDocumentWithId } from '../dao/FirebaseFirestoreDAO';
import { JSONObject } from '../utils/utils';
import { Time } from './Time';

export type IUserId = FirebaseDocumentWithId<IUser>

export interface IUser extends JSONObject {
    username?: string; // may not be set initially for google users
    // eslint-disable-next-line camelcase
    last_changed?: Time;
    state?: 'online' | 'offline';
    verified: boolean,
}


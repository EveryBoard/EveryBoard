import { JSONObject } from '../utils/utils';
import { Time } from './Time';

export interface IUser extends JSONObject {
    username: string;
    // eslint-disable-next-line camelcase
    last_changed?: Time;
    state?: 'online' | 'offline';
    verified: boolean,
}

export interface IUserId extends JSONObject {
    id: string;
    doc: IUser;
}

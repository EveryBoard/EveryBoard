import { JSONObject } from '../utils/utils';
import { Time } from './Time';

export interface IJoueur extends JSONObject {
    username: string;
    // eslint-disable-next-line camelcase
    last_changed?: Time;
    state?: 'online' | 'offline';
}

export interface IJoueurId extends JSONObject {
    id: string;
    doc: IJoueur;
}

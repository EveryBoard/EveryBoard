import { JSONObject } from '../utils/utils';
import { Time } from './Time';

export interface IJoueur extends JSONObject {
    pseudo: string;
    email?: string;
    // eslint-disable-next-line camelcase
    last_changed?: Time;
    emailVerified?: boolean;
    state?: string;
}

export interface IJoueurId extends JSONObject {
    id: string;
    doc: IJoueur;
}

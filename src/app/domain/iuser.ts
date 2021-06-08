import { JSONObject } from '../utils/utils';

export interface Time extends JSONObject {
    seconds: number;
}

export interface IJoueur extends JSONObject {
    pseudo: string;
    email?: string;
    displayName?: string;
    // eslint-disable-next-line camelcase
    last_changed?: Time;
    emailVerified?: boolean;
    state?: string;
}

export interface IJoueurId extends JSONObject {
    id: string;
    doc: IJoueur;
}

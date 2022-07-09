import { FirestoreDocument } from '../dao/FirestoreDAO';
import { FirestoreJSONObject } from '../utils/utils';
import { FirestoreTime } from './Time';

export type UserDocument = FirestoreDocument<User>

export type UserRoleInPart = 'Player' | 'Observer' | 'Creator' | 'ChosenOpponent' | 'Candidate';

export interface User extends FirestoreJSONObject {
    username?: string; // may not be set initially for google users
    // eslint-disable-next-line camelcase
    last_changed?: FirestoreTime,
    verified: boolean,
    observedPart?: FocussedPart | null,
}

export interface FocussedPart extends FirestoreJSONObject {
    id: string,
    typeGame: string,
    role: UserRoleInPart,
}

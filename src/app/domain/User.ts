import { FirestoreDocument } from '../dao/FirestoreDAO';
import { FirestoreJSONObject } from '../utils/utils';
import { MinimalUser } from './MinimalUser';
import { FirestoreTime } from './Time';

export type UserDocument = FirestoreDocument<User>

export type UserRoleInPart = 'Player' | 'Observer' | 'Creator' | 'ChosenOpponent' | 'Candidate';

export interface User extends FirestoreJSONObject {
    username?: string; // may not be set initially for google users
    lastUpdateTime?: FirestoreTime,
    verified: boolean,
    observedPart?: FocusedPart | null,
}

export interface FocusedPart extends FirestoreJSONObject {
    id: string,
    typeGame: string,
    opponent?: MinimalUser | null,
    role: UserRoleInPart,
}

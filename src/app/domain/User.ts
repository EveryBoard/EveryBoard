import { FirestoreDocument } from '../dao/FirestoreDAO';
import { MinimalUser } from './MinimalUser';
import { FirestoreTime } from './Time';

export type UserDocument = FirestoreDocument<User>

export type UserRoleInPart = 'Player' | 'Observer' | 'Creator' | 'ChosenOpponent' | 'Candidate';

export type User = {
    username?: string; // may not be set initially for google users
    lastUpdateTime?: FirestoreTime,
    verified: boolean,
    // Observed part can be undefined if the user has never had an observedPart, null if it has been removed
    observedPart?: FocusedPart | null,
}

export type FocusedPart = {
    id: string,
    typeGame: string,
    opponent?: MinimalUser | null,
    role: UserRoleInPart,
}

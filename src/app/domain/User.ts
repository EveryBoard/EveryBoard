import { FirestoreDocument } from '../dao/FirestoreDAO';
import { MinimalUser } from './MinimalUser';
import { FirestoreTime } from './Time';

export type UserRoleInPart = 'Player' | 'Observer' | 'Creator' | 'ChosenOpponent' | 'Candidate';

export type User = {
    username?: string; // may not be set initially for google users
    lastUpdateTime?: FirestoreTime,
    verified: boolean,
    // Observed part can be undefined if the user has never had an observedPart, null if it has been removed
    observedPart?: CurrentGame | null,
}

// The "current game" is the only game in which a user can be at any point in time.
// The user can be a player in the game (in which case the opponent field is set)
// or they can be an observer. The role field indicates this.
export type CurrentGame = {
    id: string,
    typeGame: string,
    opponent?: MinimalUser | null,
    role: UserRoleInPart,
}

export type UserDocument = FirestoreDocument<User>

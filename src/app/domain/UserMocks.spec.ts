import { AuthUser } from '../services/AuthenticationService';
import { MGPOptional } from '../utils/MGPOptional';
import { MinimalUser } from './Joiner';
import { User } from './User';

export class UserMocks {

    public static readonly CREATOR_AUTH_USER: AuthUser = new AuthUser('creator-user-doc-id',
                                                                      MGPOptional.of('cre@tor'),
                                                                      MGPOptional.of('creator'),
                                                                      true);
    public static readonly CREATOR: User = {
        username: UserMocks.CREATOR_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    public static readonly CREATOR_MINIMAL_USER: MinimalUser = {
        id: UserMocks.CREATOR_AUTH_USER.userId,
        name: UserMocks.CREATOR_AUTH_USER.username.get(),
    };
    public static readonly FIRST_CANDIDATE_MINIMAL_USER: MinimalUser = {
        id: 'firstCandidate-user-doc-id', // TODOTODO TODOTOPOOP
        name: 'firstCandidate',
    };

    public static readonly OPPONENT_AUTH_USER: AuthUser = new AuthUser('firstCandidate-user-doc-id',
                                                                       MGPOptional.of('opp@nante'),
                                                                       MGPOptional.of('firstCandidate'),
                                                                       true);
    public static readonly OPPONENT: User = {
        username: UserMocks.OPPONENT_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    public static readonly OPPONENT_MINIMAL_USER: MinimalUser = {
        id: UserMocks.OPPONENT_AUTH_USER.userId,
        name: UserMocks.OPPONENT_AUTH_USER.username.get(),
    };
}

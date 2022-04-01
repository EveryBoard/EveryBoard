import { AuthUser } from '../services/AuthenticationService';
import { MGPOptional } from '../utils/MGPOptional';
import { MinimalUser } from './MinimalUser';
import { User } from './User';

export class UserMocks {
    public static readonly CONNECTED_UNVERIFIED: AuthUser = new AuthUser('jeanjaja123',
                                                                         MGPOptional.of('jean@jaja.europe'),
                                                                         MGPOptional.of('Jean Jaja'),
                                                                         false);

    public static readonly CONNECTED: AuthUser = new AuthUser('creator-user-doc-id',
                                                              MGPOptional.of('cre@tor'),
                                                              MGPOptional.of('creator'),
                                                              true);


    public static readonly CREATOR_AUTH_USER: AuthUser = UserMocks.CONNECTED;

    public static readonly CREATOR: User = {
        username: UserMocks.CREATOR_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    public static readonly CREATOR_MINIMAL_USER: MinimalUser = UserMocks.CREATOR_AUTH_USER.toMinimalUser();

    public static readonly OPPONENT_AUTH_USER: AuthUser = new AuthUser('firstCandidateUserDocId',
                                                                       MGPOptional.of('opp@nante'),
                                                                       MGPOptional.of('firstCandidate'),
                                                                       true);
    public static readonly OPPONENT: User = {
        username: UserMocks.OPPONENT_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    public static readonly OPPONENT_MINIMAL_USER: MinimalUser = UserMocks.OPPONENT_AUTH_USER.toMinimalUser();

}
